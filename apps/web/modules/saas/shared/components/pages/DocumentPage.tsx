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
import {
	CompactDocumentBreadcrumbs,
	DocumentBreadcrumbs,
} from "../navigation/DocumentBreadcrumbs";
import { useWorkspaceCacheContext } from "../providers/WorkspaceCacheProvider";
import { NotionEditor } from "../tiptap-templates/notion-like/notion-like-editor";
import { CachedWorkspaceDocumentTree } from "../workspace/CachedWorkspaceDocumentTree";

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

	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	// Save function
	const saveDocument = React.useCallback(
		async (content: any) => {
			if (!document) return;

			try {
				console.log("=== Starting document save ===");
				console.log("Document ID:", document.id);
				setIsSaving(true);

				// Save to server
				await updateDocument.mutateAsync({
					id: document.id,
					content,
				});

				console.log("Document saved successfully");
				setLastSaved(new Date());
			} catch (error) {
				console.error("Failed to save document:", error);
			} finally {
				setIsSaving(false);
			}
		},
		[document, updateDocument],
	);

	// Debounced save function
	const debouncedSave = React.useMemo(
		() => debounce(saveDocument, 1000),
		[saveDocument],
	);

	// Auto-save document changes with debouncing
	const handleDocumentChange = React.useCallback(
		(content: any) => {
			if (!document) return;
			
			console.log("=== Document change detected ===");
			console.log("Document ID:", document.id);
			console.log("Content:", content);

			// Optimistic update immediately
			const updatedDoc = {
				...document,
				content,
				updatedAt: new Date().toISOString(),
			};
			updateDocumentCache(updatedDoc);

			// Debounced save to server
			console.log("Calling debounced save...");
			debouncedSave(content);
		},
		[document, updateDocumentCache, debouncedSave],
	);

	// Cleanup debounced function on unmount
	React.useEffect(() => {
		return () => {
			debouncedSave.cancel();
		};
	}, [debouncedSave]);

	// Share document functionality
	const handleShare = React.useCallback(() => {
		const shareableUrl = getShareableUrl();
		if (shareableUrl) {
			navigator.clipboard.writeText(shareableUrl);
			// You could show a toast notification here
			console.log("Document URL copied to clipboard");
		}
	}, [getShareableUrl]);

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
								{lastSaved && (
									<span className="last-saved">
										Saved {lastSaved.toLocaleTimeString()}
									</span>
								)}
								{isSaving && (
									<span className="saving-indicator">
										Saving...
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
							initialContent={document.content}
							onChange={handleDocumentChange}
						/>
					</div>
				</div>
			</div>

			<style jsx>{`
        .document-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary, #ffffff);
        }

        .document-breadcrumbs-container {
          flex-shrink: 0;
          border-bottom: 1px solid var(--border-color, #e1e5e9);
        }

        .document-content {
          flex: 1;
          display: flex;
          min-height: 0;
        }

        .document-sidebar {
          width: 280px;
          border-right: 1px solid var(--border-color, #e1e5e9);
          background: var(--bg-secondary, #f8f9fa);
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-color, #e1e5e9);
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #212529);
        }

        .document-tree {
          flex: 1;
          overflow-y: auto;
        }

        .document-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .document-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color, #e1e5e9);
          background: var(--bg-primary, #ffffff);
        }

        .document-title-section {
          flex: 1;
          min-width: 0;
        }

        .document-title {
          margin: 0 0 4px 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary, #212529);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .document-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 14px;
          color: var(--text-secondary, #6c757d);
        }

        .saving-indicator {
          color: var(--color-warning, #f57c00);
          font-weight: 500;
        }

        .last-saved {
          color: var(--color-success, #28a745);
        }

        .document-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .share-button {
          padding: 8px 16px;
          border: 1px solid var(--border-color, #e1e5e9);
          background: var(--bg-primary, #ffffff);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text-secondary, #6c757d);
          transition: all 0.15s ease;
        }

        .share-button:hover {
          background: var(--bg-hover, #f8f9fa);
          border-color: var(--border-hover, #adb5bd);
        }

        .document-editor {
          flex: 1;
          overflow: hidden;
        }

        .document-page-empty,
        .document-page-loading,
        .document-page-error {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .empty-state,
        .loading-content,
        .error-content {
          max-width: 400px;
          padding: 32px;
        }

        .empty-state h2,
        .error-content h2 {
          margin: 0 0 16px 0;
          font-size: 24px;
          color: var(--text-primary, #212529);
        }

        .empty-state p,
        .loading-content p,
        .error-content p {
          margin: 0 0 24px 0;
          color: var(--text-secondary, #6c757d);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color, #e1e5e9);
          border-top: 3px solid var(--color-primary, #007bff);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-content button {
          padding: 12px 24px;
          background: var(--color-primary, #007bff);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }

        .error-content button:hover {
          background: var(--color-primary-dark, #0056b3);
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .document-sidebar {
            width: 240px;
          }

          .document-header {
            padding: 12px 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .document-title {
            font-size: 20px;
          }

          .document-actions {
            align-self: flex-end;
          }
        }

        @media (max-width: 480px) {
          .document-content {
            flex-direction: column;
          }

          .document-sidebar {
            width: 100%;
            height: 200px;
            border-right: none;
            border-bottom: 1px solid var(--border-color, #e1e5e9);
          }

          .document-header {
            padding: 12px;
          }

          .document-title {
            font-size: 18px;
          }
        }
      `}</style>
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
