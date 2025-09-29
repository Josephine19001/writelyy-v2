"use client";

import { MultiTabEditor } from "@saas/shared/components/editor/MultiTabEditor";
import { useState, useCallback, useEffect } from "react";
import * as React from "react";
import { flushSync } from "react-dom";
import { type EditorTab, type SourceTab, type DocumentTab } from "@saas/shared/components/editor/types";
import { useEditorContext } from "./NewAppWrapper";
import { useDocumentRouter } from "../hooks/use-document-router";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useTabManager } from "../hooks/use-tab-manager";

export function WorkspaceEditor() {
	const { registerDocumentHandler, registerSourceHandler, setSelectedDocumentId } = useEditorContext();
	const { currentDocumentId, navigateToWorkspace } = useDocumentRouter();
	const { activeWorkspace } = useActiveWorkspace();
	const { addOrUpdateTab } = useTabManager();
	const [tabs, setTabs] = useState<EditorTab[]>([]);
	const [activeTabId, setActiveTabId] = useState<string>();

	const handleDocumentSelect = useCallback(async (document: any) => {
		console.log("📋 Document selected:", document.id, document.title);
		
		// Add/update tab in our tab manager
		if (activeWorkspace) {
			const documentUrl = `/app/${activeWorkspace.slug}/docs/${document.id}`;
			addOrUpdateTab({
				url: documentUrl,
				title: document.title,
			});
		}
		
		// Check if tab already exists
		const existingTab = tabs.find(tab => 
			tab.type === 'document' && 
			(tab.content as DocumentTab).documentId === document.id
		);

		if (existingTab) {
			console.log("📋 Switching to existing tab:", existingTab.id);
			setActiveTabId(existingTab.id);
			// Update URL to match active tab
			if (activeWorkspace) {
				const newUrl = `/app/${activeWorkspace.slug}/docs/${document.id}`;
				if (typeof window !== 'undefined') {
					window.history.replaceState(null, '', newUrl);
				}
			}
			return;
		}

		// Create new document tab with the actual document data
		const newTab: EditorTab = {
			id: `doc-${document.id}`,
			title: document.title,
			type: 'document',
			content: {
				type: 'document',
				documentId: document.id,
				document: {
					id: document.id,
					title: document.title,
					content: document.content || "",
				},
			}
		};

		console.log("📋 Creating new tab:", newTab.id);
		setTabs(prev => [...prev, newTab]);
		setActiveTabId(newTab.id);
		
		// Update URL to match new active tab
		if (activeWorkspace) {
			const newUrl = `/app/${activeWorkspace.slug}/docs/${document.id}`;
			if (typeof window !== 'undefined') {
				window.history.replaceState(null, '', newUrl);
			}
		}
	}, [tabs, activeWorkspace]);

	const handleSourceSelect = useCallback(async (sourceId: string) => {
		// Check if tab already exists
		const existingTab = tabs.find(tab => 
			tab.type === 'source' && 
			(tab.content as SourceTab).sourceId === sourceId
		);

		if (existingTab) {
			setActiveTabId(existingTab.id);
			return;
		}

		// Create new source tab with loading state
		const newTab: EditorTab = {
			id: `source-${sourceId}`,
			title: "Loading...",
			type: 'source',
			content: {
				type: 'source',
				sourceId,
				source: { 
					id: sourceId,
					name: "Loading...",
					filePath: '',
					type: 'unknown'
				},
				sourceType: 'image' // Default, will be updated when data loads
			}
		};

		setTabs(prev => [...prev, newTab]);
		setActiveTabId(newTab.id);

		// TODO: Fetch actual source data and update the tab
		// This will be implemented when we have the actual source API
	}, [tabs]);

	const handleTabSelect = useCallback((tabId: string) => {
		console.log("📋 Tab selected:", tabId);
		
		// Find the tab first to avoid multiple lookups
		const tab = tabs.find(t => t.id === tabId);
		
		// Use flushSync to force immediate state update without batching
		flushSync(() => {
			setActiveTabId(tabId);
		});
		
		// Update URL synchronously if possible
		if (tab?.type === 'document' && activeWorkspace) {
			const documentTab = tab.content as DocumentTab;
			const newUrl = `/app/${activeWorkspace.slug}/docs/${documentTab.documentId}`;
			console.log("📋 Instantly updating URL to:", newUrl);
			
			// Update browser URL instantly using replaceState
			// Note: We don't use router.replace() here to avoid server-side re-render
			if (typeof window !== 'undefined') {
				window.history.replaceState(null, '', newUrl);
			}
		}
		// TODO: Handle source tabs when implemented
	}, [tabs, activeWorkspace]);

	const handleTabClose = useCallback((tabId: string) => {
		console.log("📋 Closing tab:", tabId);
		
		// Calculate new state first
		const newTabs = tabs.filter(tab => tab.id !== tabId);
		let newActiveTabId = activeTabId;
		let newUrl: string | null = null;
		
		// Determine new active tab and URL
		if (activeTabId === tabId && newTabs.length > 0) {
			const newActiveTab = newTabs[newTabs.length - 1];
			newActiveTabId = newActiveTab.id;
			
			if (newActiveTab.type === 'document' && activeWorkspace) {
				const documentTab = newActiveTab.content as DocumentTab;
				newUrl = `/app/${activeWorkspace.slug}/docs/${documentTab.documentId}`;
			}
		} else if (newTabs.length === 0) {
			newActiveTabId = undefined;
			if (activeWorkspace) {
				newUrl = `/app/${activeWorkspace.slug}`;
			}
		}
		
		// Update state synchronously
		flushSync(() => {
			setTabs(newTabs);
			setActiveTabId(newActiveTabId);
		});
		
		// Update URL instantly
		if (newUrl) {
			console.log("📋 Instantly updating URL after tab close to:", newUrl);
			// Update browser URL instantly using replaceState
			// Note: We don't use router.replace() here to avoid server-side re-render
			if (typeof window !== 'undefined') {
				window.history.replaceState(null, '', newUrl);
			}
		}
	}, [tabs, activeTabId, activeWorkspace]);

	// Sync URL changes to tabs (for page refresh, direct navigation, etc.)
	useEffect(() => {
		if (!currentDocumentId) {
			console.log("📋 No document in URL, clearing selection");
			return;
		}

		console.log("📋 URL changed to document:", currentDocumentId);
		
		// Check if we already have a tab for this document
		const existingTab = tabs.find(tab => 
			tab.type === 'document' && 
			(tab.content as DocumentTab).documentId === currentDocumentId
		);

		if (existingTab) {
			console.log("📋 Found existing tab for URL document:", existingTab.id);
			if (activeTabId !== existingTab.id) {
				setActiveTabId(existingTab.id);
			}
		} else {
			console.log("📋 No tab found for URL document, need to create one");
			// We need the document data to create a tab, but we don't have it here
			// The document will be opened via handleDocumentSelect when the tree loads
		}
	}, [currentDocumentId, tabs, activeTabId]);

	// Update selected document ID when active tab changes
	useEffect(() => {
		const activeTab = tabs.find(tab => tab.id === activeTabId);
		if (activeTab?.type === 'document') {
			const documentTab = activeTab.content as DocumentTab;
			setSelectedDocumentId(documentTab.documentId);
		} else {
			setSelectedDocumentId(null);
		}
	}, [activeTabId, tabs, setSelectedDocumentId]);

	// Register handlers with the context on mount
	useEffect(() => {
		registerDocumentHandler(handleDocumentSelect);
		registerSourceHandler(handleSourceSelect);
	}, [registerDocumentHandler, registerSourceHandler, handleDocumentSelect, handleSourceSelect]);

	return (
		<MultiTabEditor
			tabs={tabs}
			activeTabId={activeTabId}
			onTabSelect={handleTabSelect}
			onTabClose={handleTabClose}
		/>
	);
}