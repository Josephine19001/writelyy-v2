"use client";

import { MultiTabEditor } from "@saas/shared/components/editor/MultiTabEditor";
import { useState, useCallback, useEffect } from "react";
import * as React from "react";
import type {
	EditorTab,
	DocumentTab,
} from "@saas/shared/components/editor/types";
import { useEditorContext } from "./NewAppWrapper";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useOptimizedDocumentMutations } from "../hooks/use-optimized-mutations";
import { useWorkspaceCacheContext } from "./providers/WorkspaceCacheProvider";
import { useTabContext } from "./providers/TabProvider";
import { debounce } from "lodash";
import { useQueryClient } from "@tanstack/react-query";

export function WorkspaceEditor() {
	const {
		registerDocumentHandler,
		registerSourceHandler,
		setSelectedDocumentId,
	} = useEditorContext();
	const { activeWorkspace } = useActiveWorkspace();
	const { updateDocumentCache } = useWorkspaceCacheContext();
	const { updateDocument } = useOptimizedDocumentMutations(
		activeWorkspace?.id || "",
	);
	const queryClient = useQueryClient();

	// Use TabProvider for all tab management
	const {
		tabs,
		activeTabId,
		addOrSwitchToTab: addOrSwitchToTabFromProvider,
		selectTab,
		closeTab,
		updateTabDocument,
	} = useTabContext();

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
			setSavingStates((prev) => ({
				...prev,
				[documentId]: { 
					...prev[documentId], 
					isSaving: true,
					hasUnsavedChanges: true 
				},
			}));

			try {
				const savedDocument = await updateDocument.mutateAsync({
					id: documentId,
					content,
				});

				// Update document cache with the fresh saved data
				// DO update list cache after successful save to show updated metadata
				updateDocumentCache(savedDocument, { updateListCache: true });

				// Force query invalidation to ensure all UI components refresh
				queryClient.invalidateQueries({ queryKey: ["document", documentId] });
				queryClient.invalidateQueries({ queryKey: ["documents", activeWorkspace?.id] });

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
				console.error("Failed to save document:", documentId, error);
				
				setSavingStates((prev) => ({
					...prev,
					[documentId]: { 
						...prev[documentId], 
						isSaving: false,
						hasUnsavedChanges: true
					},
				}));
			}
		},
		[updateDocument, tabs, updateDocumentCache],
	);

	// Debounced save function
	const debouncedSave = React.useMemo(
		() => debounce(saveDocument, 500),
		[saveDocument],
	);


	// Simple tab management functions - no side effects!
	const createDocumentTab = useCallback((document: any): EditorTab => {
		// First check React Query cache for the most recent version
		const cachedDocument = queryClient.getQueryData(["document", document.id]) as any;
		let content = document.content || "";
		let baseDocument = document;

		// Use cached document if available (it's more recent than passed document)
		if (cachedDocument) {
			baseDocument = cachedDocument;
			content = cachedDocument.content || "";
		}
		
		// Then check for localStorage draft
		const localKey = `doc-draft-${document.id}`;
		try {
			const storedDraft = localStorage.getItem(localKey);
			if (storedDraft) {
				const draft = JSON.parse(storedDraft);
				// Use draft content if it exists and is newer than the base document
				if (draft.content && draft.timestamp) {
					const draftTime = new Date(draft.timestamp).getTime();
					const docTime = new Date(baseDocument.updatedAt || baseDocument.createdAt).getTime();
					
					// Use draft if it's newer than the base document
					if (draftTime > docTime) {
						content = draft.content;
						console.log("Restored content from localStorage draft for document:", document.id);
					}
				}
			}
		} catch (error) {
			console.warn("Failed to restore draft from localStorage:", error);
		}

		return {
			id: `doc-${document.id}`,
			title: baseDocument.title,
			type: "document",
			content: {
				type: "document",
				documentId: document.id,
				document: {
					id: document.id,
					title: baseDocument.title,
					content: content,
					updatedAt: baseDocument.updatedAt,
					createdAt: baseDocument.createdAt,
				},
			},
		};
	}, [queryClient]);

	// Effect to handle localStorage draft restoration for active tab
	React.useEffect(() => {
		const activeTab = tabs.find((tab) => tab.id === activeTabId);
		if (activeTab?.type === "document") {
			const documentTab = activeTab.content as DocumentTab;
			const documentId = documentTab.documentId;
			const localKey = `doc-draft-${documentId}`;
			
			try {
				const storedDraft = localStorage.getItem(localKey);
				if (storedDraft) {
					const draft = JSON.parse(storedDraft);
					if (draft.content && draft.timestamp) {
						const draftTime = new Date(draft.timestamp).getTime();
						const docTime = new Date(documentTab.document.updatedAt || documentTab.document.createdAt).getTime();
						
						if (draftTime > docTime) {
							// Only mark as unsaved if we haven't already processed this draft
							const currentState = savingStates[documentId];
							if (!currentState?.hasUnsavedChanges) {
								setSavingStates((prev) => ({
									...prev,
									[documentId]: {
										...prev[documentId],
										hasUnsavedChanges: true,
									},
								}));
								
								// Trigger save after a delay
								setTimeout(() => {
									debouncedSave(documentId, draft.content);
								}, 2000);
							}
						}
					}
				}
			} catch (error) {
				console.warn("Failed to process draft for active tab:", error);
			}
		}
	}, [activeTabId, tabs, savingStates, debouncedSave]);

	// Handle document content changes
	const handleDocumentChange = useCallback(
		(documentId: string, content: any) => {
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
				// Update only individual document cache during typing to prevent sidebar flickering
				// The list cache (sidebar) will be updated after successful server save
				updateDocumentCache(updatedDoc, { updateListCache: false });

				// Update tab content immediately for real-time editor updates
				updateTabDocument(documentId, updatedDoc);

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
		[tabs, updateDocumentCache, debouncedSave, updateTabDocument],
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
