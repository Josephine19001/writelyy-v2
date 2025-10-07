"use client";

import { MultiTabEditor } from "@saas/shared/components/editor/MultiTabEditor";
import type {
	DocumentTab,
	EditorTab,
} from "@saas/shared/components/editor/types";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useQueryClient } from "@tanstack/react-query";
import { debounce } from "lodash";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { useOptimizedDocumentMutations } from "../hooks/use-optimized-mutations";
import { useEditorContext } from "./NewAppWrapper";
import { useTabContext } from "./providers/TabProvider";
import { useWorkspaceCacheContext } from "./providers/WorkspaceCacheProvider";
import { createDocumentBackup } from "../utils/document-backup";

export function WorkspaceEditor() {
	const {
		registerDocumentHandler,
		registerSourceHandler,
		setSelectedDocumentId,
		registerInsertSourceHandler,
		registerAIContextHandler,
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
					hasUnsavedChanges: true,
				},
			}));

			try {
				// Validate content before saving to prevent clearing documents
				const isValidContent = content && (
					typeof content === 'object' && 
					content.type === 'doc' &&
					content.content && 
					Array.isArray(content.content)
				);
				
				if (!isValidContent) {
					console.error("Attempted to save invalid content for document:", documentId, content);
					throw new Error("Invalid content - preventing save to avoid data loss");
				}
				
				const savedDocument = await updateDocument.mutateAsync({
					id: documentId,
					content,
				});

				// Update document cache with the fresh saved data
				// DO update list cache after successful save to show updated metadata
				updateDocumentCache(savedDocument, { updateListCache: true });

				// Force query invalidation to ensure all UI components refresh
				queryClient.invalidateQueries({
					queryKey: ["document", documentId],
				});
				queryClient.invalidateQueries({
					queryKey: ["documents", activeWorkspace?.id],
				});

				setSavingStates((prev) => ({
					...prev,
					[documentId]: {
						isSaving: false,
						lastSaved: new Date(),
						hasUnsavedChanges: false,
					},
				}));

				// Only clear localStorage draft if content was actually saved and matches
				const localKey = `doc-draft-${documentId}`;
				try {
					const storedDraft = localStorage.getItem(localKey);
					if (storedDraft) {
						const draft = JSON.parse(storedDraft);
						// Only remove if the saved content matches what we had in localStorage
						// This prevents clearing drafts that might have newer changes
						if (draft.content && JSON.stringify(draft.content) === JSON.stringify(content)) {
							localStorage.removeItem(localKey);
						}
					}
				} catch (error) {
					console.warn("Failed to validate localStorage draft before clearing:", error);
					// Don't clear localStorage if we can't validate it
				}
			} catch (error) {
				console.error("Failed to save document:", documentId, error);

				setSavingStates((prev) => ({
					...prev,
					[documentId]: {
						...prev[documentId],
						isSaving: false,
						hasUnsavedChanges: true,
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
	const createDocumentTab = useCallback(
		(document: any): EditorTab => {
			// First check React Query cache for the most recent version
			const cachedDocument = queryClient.getQueryData([
				"document",
				document.id,
			]) as any;
			let content = document.content;
			let baseDocument = document;

			// Use cached document if available (it's more recent than passed document)
			if (cachedDocument) {
				baseDocument = cachedDocument;
				content = cachedDocument.content;
			}

			// Handle different content states properly:
			// - undefined: Document not loaded yet (don't render editor)
			// - null: Document is legitimately empty (render editor with null)
			// - "": Empty string (treat as null for safety)
			// - object: Document has content (render editor with content)
			
			console.log(`📄 Document ${document.id} content:`, {
				originalContent: content,
				hasContent: !!content,
				contentType: typeof content,
				contentLength: typeof content === 'string' ? content.length : 'N/A',
				isObject: typeof content === 'object',
				willPassToEditor: content === '' ? null : content
			});
			
			// Convert empty string to null (empty doc) to avoid confusion
			if (content === '') {
				console.log(`📄 Converting empty string to null for document ${document.id}`);
				content = null;
			}
			
			// Only set to undefined if we truly don't have the data loaded
			// For now, assume we always have the data (even if null/empty)

			// Then check for localStorage draft
			const localKey = `doc-draft-${document.id}`;
			try {
				const storedDraft = localStorage.getItem(localKey);
				if (storedDraft) {
					const draft = JSON.parse(storedDraft);
					// Use draft content if it exists and is newer than the base document
					if (draft.content && draft.timestamp) {
						const draftTime = new Date(draft.timestamp).getTime();
						const docTime = new Date(
							baseDocument.updatedAt || baseDocument.createdAt,
						).getTime();

						// Use draft if it's newer than the base document
						if (draftTime > docTime) {
							content = draft.content;
						}
					}
				}
			} catch (error) {
				console.warn(
					"Failed to restore draft from localStorage:",
					error,
				);
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
		},
		[queryClient],
	);

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
						const docTime = new Date(
							documentTab.document.updatedAt ||
								documentTab.document.createdAt,
						).getTime();

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

								// Trigger save after a delay with content validation
								setTimeout(() => {
									// Double-check content is still valid before auto-saving
									const isValidContent = draft.content && (
										typeof draft.content === 'object' && 
										draft.content.type === 'doc' &&
										draft.content.content && 
										Array.isArray(draft.content.content)
									);
									
									if (isValidContent) {
										debouncedSave(documentId, draft.content);
									} else {
										console.warn("Skipping auto-save of invalid draft content for document:", documentId);
									}
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
			// CRITICAL: Emergency validation to prevent data loss
			if (!content) {
				console.error("CRITICAL: Attempted to save null/undefined content for document:", documentId);
				return;
			}
			
			// Validate Tiptap content structure
			if (typeof content === 'object' && 
				(!content.type || !content.content || !Array.isArray(content.content))) {
				console.error("CRITICAL: Invalid Tiptap content structure for document:", documentId, content);
				
				// Create emergency backup of invalid content for debugging
				const emergencyKey = `invalid-content-${documentId}-${Date.now()}`;
				try {
					localStorage.setItem(emergencyKey, JSON.stringify({
						content,
						timestamp: new Date().toISOString(),
						reason: "invalid_tiptap_structure",
						documentId
					}));
					console.error("Invalid content backed up to:", emergencyKey);
				} catch (error) {
					console.error("Failed to backup invalid content:", error);
				}
				return;
			}
			
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

				// Update local storage with content validation
				const localKey = `doc-draft-${documentId}`;
				
				// Only save to localStorage if content is not empty/null
				const hasValidContent = content && (
					typeof content === 'string' ? content.trim().length > 0 : 
					typeof content === 'object' ? (
						// Check for valid Tiptap JSON structure
						content.type === 'doc' && content.content && Array.isArray(content.content) ||
						// Fallback for other object types
						Object.keys(content).length > 0
					) : false
				);

				if (hasValidContent) {
					const draft = {
						content,
						timestamp: new Date().toISOString(),
						documentId,
						title: documentTab.document.title || "Untitled",
					};

					try {
						localStorage.setItem(localKey, JSON.stringify(draft));
						
						// Create backup every few changes (not on every keystroke)
						const shouldBackup = Math.random() < 0.1; // 10% chance
						if (shouldBackup) {
							createDocumentBackup(documentId, content, documentTab.document.title);
						}
					} catch (error) {
						console.error("Failed to save to localStorage:", error);
					}
				} else {
					// Don't overwrite existing drafts with empty content
					console.warn("Skipping localStorage save - empty content detected for document:", documentId, {
						content,
						contentType: typeof content,
						hasContent: !!content,
						isString: typeof content === 'string',
						isObject: typeof content === 'object',
						objectKeys: typeof content === 'object' ? Object.keys(content || {}) : 'N/A'
					});
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
			// Create tab and add/switch to it using the provider
			const newTab = createDocumentTab(document);
			addOrSwitchToTabFromProvider(newTab);
		},
		[createDocumentTab, addOrSwitchToTabFromProvider],
	);

	const handleSourceSelect = useCallback(
		async (source: any) => {
			// Create source preview tab
			const newTab: EditorTab = {
				id: `source-${source.id}`,
				title: source.name,
				type: "source",
				content: {
					type: "source",
					sourceId: source.id,
					source: source,
					sourceType: source.type,
				},
			};

			addOrSwitchToTabFromProvider(newTab);
		},
		[addOrSwitchToTabFromProvider],
	);

	// Handle direct source insertion from sidebar
	const handleInsertSource = useCallback((source: any) => {
		// Trigger the same custom event that the slash command uses
		const event = new CustomEvent('tiptap-insert-source-direct', {
			detail: { source }
		});
		window.dispatchEvent(event);
	}, []);

	// Handle AI context usage from sidebar  
	const handleUseAsAIContext = useCallback((source: any) => {
		// TODO: Implement AI context functionality
		// This could open AI panel with source context or add source to AI conversation
		console.log('🤖 Using source as AI context:', source);
		// For now, we could trigger AI panel to open and pre-fill with source context
		// This might involve adding source data to AI conversation context
	}, []);

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
		registerInsertSourceHandler(handleInsertSource);
		registerAIContextHandler(handleUseAsAIContext);
	}, [
		registerDocumentHandler,
		registerSourceHandler,
		registerInsertSourceHandler,
		registerAIContextHandler,
		handleDocumentSelect,
		handleSourceSelect,
		handleInsertSource,
		handleUseAsAIContext,
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
