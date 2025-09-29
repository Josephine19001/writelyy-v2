"use client";

import { useDocumentQuery } from "@saas/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import {
	useDocumentKeyboardNavigation,
	useDocumentRouter,
} from "../../hooks/use-document-router";
import { useOptimizedDocumentMutations } from "../../hooks/use-optimized-mutations";
import { useDocumentTabTitle } from "../../hooks/use-tab-manager";
import {
	CompactDocumentBreadcrumbs,
	DocumentBreadcrumbs,
} from "../navigation/DocumentBreadcrumbs";
import { CompactTabBar, TabBar } from "../navigation/TabBar";
import { useWorkspaceCacheContext } from "../providers/WorkspaceCacheProvider";
import { NotionEditor } from "../tiptap-templates/notion-like/notion-like-editor";
import { CachedWorkspaceDocumentTree } from "../workspace/CachedWorkspaceDocumentTree";
import "./DocumentPage.scss";

interface DocumentPageProps {
	showSidebar?: boolean;
	showBreadcrumbs?: boolean;
	compactBreadcrumbs?: boolean;
	className?: string;
}

export function DocumentPage({
	showSidebar = true,
	showBreadcrumbs = true,
	compactBreadcrumbs = false,
	className = "",
}: DocumentPageProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const {
		currentDocumentId,
		currentDocument,
		isInDocumentView,
		getShareableUrl,
		navigateToWorkspace,
	} = useDocumentRouter();

	const { updateDocumentCache } = useWorkspaceCacheContext();
	const { updateDocument } = useOptimizedDocumentMutations(
		activeWorkspace?.id || "",
	);

	// Enable keyboard navigation
	useDocumentKeyboardNavigation();

	// Fetch full document data if not in cache
	const { data: fullDocument, isLoading: isDocumentLoading } =
		useDocumentQuery(currentDocumentId || "", {
			enabled: !!currentDocumentId && !currentDocument,
		});

	// Use cached document or fetched document
	const document = currentDocument || fullDocument;

	// Update tab title when document loads
	useDocumentTabTitle(currentDocumentId, document);

	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [localContent, setLocalContent] = useState<any>(null);

	// Save function
	const saveDocument = React.useCallback(
		async (content: any) => {
			if (!document) {
				return;
			}

			try {
				console.log("=== Starting document save ===");
				console.log("Document ID:", document.id);
				console.log("Content type:", typeof content);
				console.log("Content value:", content);
				console.log("Content stringified:", JSON.stringify(content));
				setIsSaving(true);

				// Save to server
				await updateDocument.mutateAsync({
					id: document.id,
					content,
				});

				console.log("Document saved successfully");
				setLastSaved(new Date());
				setHasUnsavedChanges(false);

				// Clear localStorage draft after successful save
				const localKey = `doc-draft-${document.id}`;
				localStorage.removeItem(localKey);
				setLocalContent(null);
			} catch (error) {
				console.error("Failed to save document:", error);
			} finally {
				setIsSaving(false);
			}
		},
		[document, updateDocument],
	);

	// Debounced save function (shorter delay like Notion - 500ms)
	const debouncedSave = React.useMemo(
		() => debounce(saveDocument, 500),
		[saveDocument],
	);

	// Create a stable reference to the current document and functions
	const documentRef = React.useRef(document);
	const updateDocumentCacheRef = React.useRef(updateDocumentCache);
	const debouncedSaveRef = React.useRef(debouncedSave);

	// Update refs when values change
	React.useEffect(() => {
		documentRef.current = document;
		updateDocumentCacheRef.current = updateDocumentCache;
		debouncedSaveRef.current = debouncedSave;
	}, [document, updateDocumentCache, debouncedSave]);

	// Auto-save document changes with debouncing (stable callback)
	const handleDocumentChange = React.useCallback((content: any) => {
		const currentDocument = documentRef.current;
		if (!currentDocument) {
			return;
		}

		console.log("=== Document change detected ===");
		console.log("Document ID:", currentDocument.id);
		console.log("Content being saved:", content);

		// Immediately save to localStorage (like Google Docs)
		const localKey = `doc-draft-${currentDocument.id}`;
		const draft = {
			content,
			timestamp: new Date().toISOString(),
			documentId: currentDocument.id,
			title: currentDocument.title || "Untitled",
		};

		try {
			const draftString = JSON.stringify(draft);
			localStorage.setItem(localKey, draftString);
			console.log("✅ Successfully saved to localStorage:", localKey, {
				size: draftString.length,
				timestamp: draft.timestamp,
			});
			setLocalContent(content);

			// Also save a backup with timestamp
			const backupKey = `doc-backup-${currentDocument.id}-${Date.now()}`;
			localStorage.setItem(backupKey, draftString);

			// Clean old backups (keep only last 5)
			const allKeys = Object.keys(localStorage);
			const backupKeys = allKeys
				.filter((key) =>
					key.startsWith(`doc-backup-${currentDocument.id}-`),
				)
				.sort()
				.reverse();

			if (backupKeys.length > 5) {
				const keysToRemove = backupKeys.slice(5);
				for (const key of keysToRemove) {
					localStorage.removeItem(key);
					console.log("🧹 Cleaned old backup:", key);
				}
			}
		} catch (error) {
			console.error("❌ Failed to save to localStorage:", error);
			// Try to free up space and retry
			try {
				const allKeys = Object.keys(localStorage);
				const backupKeys = allKeys.filter((key) =>
					key.startsWith("doc-backup-"),
				);
				for (const key of backupKeys) {
					localStorage.removeItem(key);
				}
				localStorage.setItem(localKey, JSON.stringify(draft));
				console.log("✅ Saved to localStorage after cleanup");
			} catch (retryError) {
				console.error(
					"❌ Failed to save even after cleanup:",
					retryError,
				);
			}
		}

		// Mark as having unsaved changes IMMEDIATELY
		setHasUnsavedChanges(true);

		// Optimistic update cache immediately
		const updatedDoc = {
			...currentDocument,
			content,
			updatedAt: new Date().toISOString(),
		};
		updateDocumentCacheRef.current(updatedDoc);

		// Debounced save to server (this can be slow)
		console.log("Calling debounced save...");
		debouncedSaveRef.current(content);
	}, []); // Empty dependency array makes this callback stable

	// Save before page unload and cleanup
	React.useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			console.log("🚨 beforeunload triggered - forcing save");
			// Force save any pending changes before leaving
			debouncedSave.flush();
			// If there are unsaved changes, show confirmation
			if (hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = "";
			}
		};

		const handleVisibilityChange = () => {
			if (typeof window === "undefined" || !window.document) return;
			console.log(
				"👁️ visibilitychange triggered:",
				window.document.visibilityState,
			);
			if (window.document.visibilityState === "hidden") {
				console.log("🔄 Tab hidden - forcing save");
				// Force save when tab becomes hidden
				debouncedSave.flush();
			}
		};

		const handlePageHide = () => {
			console.log("🚪 pagehide triggered - forcing save");
			debouncedSave.flush();
		};

		const handleFocus = () => {
			console.log("🎯 window focus triggered");
		};

		const handleBlur = () => {
			console.log("😶‍🌫️ window blur triggered - forcing save");
			debouncedSave.flush();
		};

		// Add event listeners for various scenarios where we should save
		if (typeof window !== "undefined") {
			window.addEventListener("beforeunload", handleBeforeUnload);
			window.addEventListener("pagehide", handlePageHide);
			window.addEventListener("focus", handleFocus);
			window.addEventListener("blur", handleBlur);
			
			if (window.document) {
				window.document.addEventListener(
					"visibilitychange",
					handleVisibilityChange,
				);
			}
		}

		return () => {
			// Force flush any pending saves before cleanup
			console.log("🧹 Component cleanup - forcing save");
			debouncedSave.flush();
			if (typeof window !== "undefined") {
				window.removeEventListener("beforeunload", handleBeforeUnload);
				window.removeEventListener("pagehide", handlePageHide);
				window.removeEventListener("focus", handleFocus);
				window.removeEventListener("blur", handleBlur);
				
				if (window.document) {
					window.document.removeEventListener(
						"visibilitychange",
						handleVisibilityChange,
					);
				}
			}
		};
	}, [debouncedSave, hasUnsavedChanges]);

	// Periodic auto-save as a fallback (every 5 seconds if there are unsaved changes)
	React.useEffect(() => {
		const interval = setInterval(() => {
			if (hasUnsavedChanges && !isSaving) {
				console.log("⏰ Periodic auto-save triggered");
				debouncedSave.flush();
			}
		}, 5000); // 5 seconds (more frequent)

		return () => clearInterval(interval);
	}, [hasUnsavedChanges, isSaving, debouncedSave]);

	// Share document functionality
	const handleShare = React.useCallback(() => {
		const shareableUrl = getShareableUrl();
		if (shareableUrl) {
			navigator.clipboard.writeText(shareableUrl);
			// You could show a toast notification here
			console.log("Document URL copied to clipboard");
		}
	}, [getShareableUrl]);

	// Update browser tab title to show unsaved changes
	React.useEffect(() => {
		const baseTitle = document?.title || "Document";
		const newTitle = hasUnsavedChanges ? `● ${baseTitle}` : baseTitle;

		// Update the HTML document title
		if (typeof window !== "undefined") {
			window.document.title = newTitle;
		}
	}, [hasUnsavedChanges, document?.title]);

	// Initialize lastSaved when document loads and restore from localStorage if needed
	React.useEffect(() => {
		if (document?.id) {
			console.log(
				"🔄 Document changed, resetting state for:",
				document.id,
			);

			// CRITICAL: Reset local content state when switching documents
			setLocalContent(null);
			setHasUnsavedChanges(false);

			// Check for locally stored content for this specific document
			const localKey = `doc-draft-${document.id}`;
			const storedDraft = localStorage.getItem(localKey);

			console.log("🔍 Checking for local draft:", localKey);

			if (storedDraft) {
				try {
					const parsedDraft = JSON.parse(storedDraft);
					const draftTime = new Date(parsedDraft.timestamp);
					const serverTime = new Date(document.updatedAt || 0);

					console.log("📋 Found local draft:", {
						draftTime: draftTime.toISOString(),
						serverTime: serverTime.toISOString(),
						isNewer: draftTime > serverTime,
					});

					// Verify the draft is actually for this document
					if (
						parsedDraft.documentId === document.id &&
						draftTime > serverTime
					) {
						setHasUnsavedChanges(true);
						setLocalContent(parsedDraft.content);
						console.log(
							"✅ Found newer local draft, restoring content",
						);
					} else {
						console.log(
							"🆕 Server version is newer or wrong document, ignoring local draft",
						);
						localStorage.removeItem(localKey);
						setLocalContent(null);
						setHasUnsavedChanges(false);
					}
				} catch (error) {
					console.warn("❌ Failed to parse local draft:", error);
					localStorage.removeItem(localKey);
					setLocalContent(null);
					setHasUnsavedChanges(false);
				}
			} else {
				console.log("📄 No local draft found");
				setLocalContent(null);
				setHasUnsavedChanges(false);
			}

			if (document.updatedAt) {
				setLastSaved(new Date(document.updatedAt));
			}
		}
	}, [document?.id, document?.updatedAt]);

	// Redirect to workspace if no document selected
	useEffect(() => {
		if (!isInDocumentView && activeWorkspace) {
			navigateToWorkspace();
		}
	}, [isInDocumentView, activeWorkspace, navigateToWorkspace]);

	if (!currentDocumentId) {
		return (
			<div className="document-page-empty">
				<div className="empty-state">
					<h2>Select a Document</h2>
					<p>Choose a document from the sidebar to start editing.</p>
				</div>
			</div>
		);
	}

	if (isDocumentLoading && !document) {
		return (
			<div className="document-page-loading">
				<div className="loading-content">
					<div className="loading-spinner" />
					<p>Loading document...</p>
				</div>
			</div>
		);
	}

	if (!document) {
		return (
			<div className="document-page-error">
				<div className="error-content">
					<h2>Document Not Found</h2>
					<p>The requested document could not be found.</p>
					<button type="button" onClick={() => navigateToWorkspace()}>
						Back to Workspace
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={`document-page ${className}`}>
			{/* Tab Bar */}
			<TabBar />
			<CompactTabBar />

			{showBreadcrumbs && (
				<div className="document-breadcrumbs-container">
					{compactBreadcrumbs ? (
						<CompactDocumentBreadcrumbs />
					) : (
						<DocumentBreadcrumbs />
					)}
				</div>
			)}

			<div className="document-content">
				{showSidebar && (
					<div className="document-sidebar">
						<div className="sidebar-header">
							<h3>Documents</h3>
						</div>
						<CachedWorkspaceDocumentTree
							useUrlRouting={true}
							className="document-tree"
						/>
					</div>
				)}

				<div className="document-main">
					<div className="document-header">
						<div className="document-title-section">
							<h1 className="document-title">{document.title}</h1>
							<div className="document-meta">
								{isSaving && (
									<span className="saving-indicator">
										<span className="saving-spinner" />
										Saving...
									</span>
								)}
								{!isSaving && hasUnsavedChanges && (
									<span className="unsaved-indicator">
										● Unsaved changes
									</span>
								)}
								{!isSaving &&
									!hasUnsavedChanges &&
									lastSaved && (
										<span className="last-saved">
											✓ Saved{" "}
											{lastSaved.toLocaleTimeString()}
										</span>
									)}
							</div>
						</div>

						<div className="document-actions">
							<button
								onClick={handleShare}
								className="share-button"
								type="button"
								title="Copy document link"
							>
								🔗 Share
							</button>
						</div>
					</div>

					<div className="document-editor">
						<NotionEditor
							room={document.id}
							placeholder="Start writing..."
							initialContent={(() => {
								const content =
									localContent || document.content;
								console.log(
									"🔧 Initial content type:",
									typeof content,
								);
								console.log(
									"🔧 Initial content value:",
									content,
								);

								// If content is a string, try to parse it as JSON
								if (typeof content === "string") {
									try {
										const parsed = JSON.parse(content);
										console.log(
											"✅ Parsed string content:",
											parsed,
										);
										return parsed;
									} catch (error) {
										console.log(
											"❌ Failed to parse content as JSON, treating as HTML:",
											error,
										);
										// If parsing fails, it might be plain HTML, wrap it in a basic doc structure
										return {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: content,
														},
													],
												},
											],
										};
									}
								}

								// If it's already an object, return as-is
								console.log("✅ Content is already an object");
								return content;
							})()}
							onChange={handleDocumentChange}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Minimal document page without sidebar (for focused editing)
 */
export function FocusedDocumentPage({
	className = "",
}: {
	className?: string;
}) {
	return (
		<DocumentPage
			showSidebar={false}
			compactBreadcrumbs={true}
			className={`focused-document ${className}`}
		/>
	);
}
