"use client";

import { MultiTabEditor } from "@saas/shared/components/editor/MultiTabEditor";
import { useState, useCallback, useEffect } from "react";
import { type EditorTab, type SourceTab, type DocumentTab } from "@saas/shared/components/editor/types";
import { useEditorContext } from "./NewAppWrapper";

export function WorkspaceEditor() {
	const { registerDocumentHandler, registerSourceHandler, setSelectedDocumentId } = useEditorContext();
	const [tabs, setTabs] = useState<EditorTab[]>([]);
	const [activeTabId, setActiveTabId] = useState<string>();

	const handleDocumentSelect = useCallback(async (document: any) => {
		// Check if tab already exists
		const existingTab = tabs.find(tab => 
			tab.type === 'document' && 
			(tab.content as DocumentTab).documentId === document.id
		);

		if (existingTab) {
			setActiveTabId(existingTab.id);
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

		setTabs(prev => [...prev, newTab]);
		setActiveTabId(newTab.id);

		// TODO: If we need to fetch more detailed document content, we can do it here
		// For now, we're using the document data from the tree
	}, [tabs]);

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

	const handleTabClose = useCallback((tabId: string) => {
		setTabs(prev => {
			const newTabs = prev.filter(tab => tab.id !== tabId);
			
			// If closing active tab, switch to another tab
			if (activeTabId === tabId && newTabs.length > 0) {
				setActiveTabId(newTabs[newTabs.length - 1].id);
			} else if (newTabs.length === 0) {
				setActiveTabId(undefined);
			}
			
			return newTabs;
		});
	}, [activeTabId]);

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
			onTabSelect={setActiveTabId}
			onTabClose={handleTabClose}
		/>
	);
}