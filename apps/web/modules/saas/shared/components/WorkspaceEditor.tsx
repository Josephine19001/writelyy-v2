"use client";

import { MultiTabEditor } from "@saas/shared/components/editor/MultiTabEditor";
import { useState, useCallback, useEffect } from "react";
import * as React from "react";
import type {
	EditorTab,
	DocumentTab,
} from "@saas/shared/components/editor/types";
import { useEditorContext } from "./NewAppWrapper";
import { useDocumentRouter } from "../hooks/use-document-router";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useOptimizedDocumentMutations } from "../hooks/use-optimized-mutations";
import { useWorkspaceCacheContext } from "./providers/WorkspaceCacheProvider";
import { useTabContext } from "./providers/TabProvider";
import { debounce } from "lodash";

export function WorkspaceEditor() {
	const {
		registerDocumentHandler,
		registerSourceHandler,
		setSelectedDocumentId,
	} = useEditorContext();
	const { currentDocumentId } = useDocumentRouter();
	const { activeWorkspace } = useActiveWorkspace();
	const { updateDocumentCache } = useWorkspaceCacheContext();
	const { updateDocument } = useOptimizedDocumentMutations(
		activeWorkspace?.id || "",
	);

	// Use TabProvider for all tab management
	const {
		tabs,
		activeTabId,
		addOrSwitchToTab: addOrSwitchToTabFromProvider,
		selectTab,
		closeTab,
	} = useTabContext();

	// Simple tab management functions
	const createDocumentTab = useCallback((document: any): EditorTab => {
		return {
			id: `doc-${document.id}`,
			title: document.title,
			type: "document",
			content: {
				type: "document",
				documentId: document.id,
				document: {
					id: document.id,
					title: document.title,
					content: document.content || "",
				},
			},
		};
	}, []);

	// Saving state management
	const [savingStates, setSavingStates] = useState<
		Record<
			string,
			{
				isSaving: boolean;
				lastSaved: Date | null;
				hasUnsavedChanges: boolean;
			}
		>
	>({});

	// The TabProvider handles document fetching, so we don't need this anymore

	// Get current saving state for active tab
	const getCurrentSavingState = useCallback(() => {
		const activeTab = tabs.find((tab) => tab.id === activeTabId);
		if (activeTab?.type === "document") {
			const documentTab = activeTab.content as DocumentTab;
			return (
				savingStates[documentTab.documentId] || {
					isSaving: false,
					lastSaved: null,
					hasUnsavedChanges: false,
				}
			);
		}
		return { isSaving: false, lastSaved: null, hasUnsavedChanges: false };
	}, [tabs, activeTabId, savingStates]);

	// Save function
	const saveDocument = useCallback(
		async (documentId: string, content: any) => {
			try {
				setSavingStates((prev) => ({
					...prev,
					[documentId]: { ...prev[documentId], isSaving: true },
				}));

				await updateDocument.mutateAsync({
					id: documentId,
					content,
				});

				setSavingStates((prev) => ({
					...prev,
					[documentId]: {
						isSaving: false,
						lastSaved: new Date(),
						hasUnsavedChanges: false,
					},
				}));

				// Clear localStorage draft after successful save
				const localKey = `doc-draft-${documentId}`;
				localStorage.removeItem(localKey);
			} catch (error) {
				console.error("Failed to save document:", error);
				setSavingStates((prev) => ({
					...prev,
					[documentId]: { ...prev[documentId], isSaving: false },
				}));
			}
		},
		[updateDocument],
	);

	// Debounced save function
	const debouncedSave = React.useMemo(
		() => debounce(saveDocument, 500),
		[saveDocument],
	);

	// Handle document content changes
	const handleDocumentChange = useCallback(
		(documentId: string, content: any) => {
			// Update cache immediately
			const tab = tabs.find(
				(t) =>
					t.type === "document" &&
					(t.content as DocumentTab).documentId === documentId,
			);
			if (tab) {
				const documentTab = tab.content as DocumentTab;
				const updatedDoc = {
					...documentTab.document,
					content,
					updatedAt: new Date().toISOString(),
				};
				updateDocumentCache(updatedDoc);

				// Update local storage
				const localKey = `doc-draft-${documentId}`;
				const draft = {
					content,
					timestamp: new Date().toISOString(),
					documentId,
					title: documentTab.document.title || "Untitled",
				};

				try {
					localStorage.setItem(localKey, JSON.stringify(draft));
				} catch (error) {
					console.error("Failed to save to localStorage:", error);
				}

				// Mark as having unsaved changes
				setSavingStates((prev) => ({
					...prev,
					[documentId]: {
						...prev[documentId],
						hasUnsavedChanges: true,
					},
				}));

				// Debounced save to server
				debouncedSave(documentId, content);
			}
		},
		[tabs, updateDocumentCache, debouncedSave],
	);

	const handleDocumentSelect = useCallback(
		async (document: any) => {
			console.log("🔍 WORKSPACE CLICK: Document selected:", document.id, document.title);

			// Create tab and add/switch to it using the provider
			const newTab = createDocumentTab(document);
			console.log("🔍 WORKSPACE CLICK: Created tab:", newTab);
			addOrSwitchToTabFromProvider(newTab);
			console.log("🔍 WORKSPACE CLICK: Called addOrSwitchToTabFromProvider");
		},
		[createDocumentTab, addOrSwitchToTabFromProvider],
	);

	const handleSourceSelect = useCallback(
		async (sourceId: string) => {
			// Create source tab
			const newTab: EditorTab = {
				id: `source-${sourceId}`,
				title: "Loading...",
				type: "source",
				content: {
					type: "source",
					sourceId,
					source: {
						id: sourceId,
						name: "Loading...",
						filePath: "",
						type: "unknown",
					},
					sourceType: "image", // Default, will be updated when data loads
				},
			};

			addOrSwitchToTabFromProvider(newTab);

			// TODO: Fetch actual source data and update the tab
			// This will be implemented when we have the actual source API
		},
		[addOrSwitchToTabFromProvider],
	);

	// Update selected document ID when active tab changes
	useEffect(() => {
		const activeTab = tabs.find((tab) => tab.id === activeTabId);
		if (activeTab?.type === "document") {
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
	}, [
		registerDocumentHandler,
		registerSourceHandler,
		handleDocumentSelect,
		handleSourceSelect,
	]);



	return (
		<MultiTabEditor
			tabs={tabs}
			activeTabId={activeTabId}
			onTabSelect={selectTab}
			onTabClose={closeTab}
			onDocumentChange={handleDocumentChange}
			savingState={getCurrentSavingState()}
		/>
	);
}
