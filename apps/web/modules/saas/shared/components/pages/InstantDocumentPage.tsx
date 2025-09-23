"use client";

import React, { useEffect, useState } from "react";
import { useDocumentRouter, useDocumentKeyboardNavigation } from "../../hooks/use-document-router";
import { useAggressiveWorkspaceCacheContext } from "../providers/AggressiveWorkspaceCacheProvider";
import { DocumentBreadcrumbs, CompactDocumentBreadcrumbs } from "../navigation/DocumentBreadcrumbs";
import { InstantWorkspaceDocumentTree } from "../workspace/InstantWorkspaceDocumentTree";
import { useOptimizedDocumentMutations } from "../../hooks/use-optimized-mutations";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { NotionEditor } from "../tiptap-templates/notion-like/notion-like-editor";

interface InstantDocumentPageProps {
  showSidebar?: boolean;
  showBreadcrumbs?: boolean;
  compactBreadcrumbs?: boolean;
  className?: string;
}

export function InstantDocumentPage({
  showSidebar = true,
  showBreadcrumbs = true,
  compactBreadcrumbs = false,
  className = "",
}: InstantDocumentPageProps) {
  const { activeWorkspace } = useActiveWorkspace();
  const {
    currentDocumentId,
    getShareableUrl,
    navigateToWorkspace,
  } = useDocumentRouter();

  const { 
    getDocument, 
    accessDocument, 
    updateDocument: updateDocumentCache,
    isReady,
  } = useAggressiveWorkspaceCacheContext();

  const { updateDocument } = useOptimizedDocumentMutations(activeWorkspace?.id || "");

  // Enable keyboard navigation
  useDocumentKeyboardNavigation();

  // Get document instantly from cache
  const document = currentDocumentId ? getDocument(currentDocumentId) : null;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load document if not in cache
  useEffect(() => {
    if (currentDocumentId && !document && isReady) {
      console.log("📄 Loading document not in cache:", currentDocumentId);
      accessDocument(currentDocumentId);
    }
  }, [currentDocumentId, document, isReady, accessDocument]);

  // Auto-save document changes
  const handleDocumentChange = React.useCallback(async (content: any) => {
    if (!document || !currentDocumentId) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      
      // Optimistic update in cache
      updateDocumentCache(currentDocumentId, { 
        content, 
        updatedAt: new Date().toISOString() 
      });

      // Save to server
      await updateDocument.mutateAsync({
        id: document.id,
        content,
      });

      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save document:", error);
      setSaveError(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [document, currentDocumentId, updateDocumentCache, updateDocument]);

  // Auto-save document title changes
  const handleTitleChange = React.useCallback(async (newTitle: string) => {
    if (!document || !currentDocumentId || newTitle === document.title) return;

    try {
      // Optimistic update
      updateDocumentCache(currentDocumentId, { 
        title: newTitle,
        updatedAt: new Date().toISOString() 
      });

      // Save to server
      await updateDocument.mutateAsync({
        id: document.id,
        title: newTitle,
      });
    } catch (error) {
      console.error("Failed to save title:", error);
      // Revert optimistic update
      updateDocumentCache(currentDocumentId, { title: document.title });
    }
  }, [document, currentDocumentId, updateDocumentCache, updateDocument]);

  // Share document functionality
  const handleShare = React.useCallback(async () => {
    const shareableUrl = getShareableUrl();
    if (shareableUrl) {
      try {
        await navigator.clipboard.writeText(shareableUrl);
        // You could show a toast notification here
        console.log("✅ Document URL copied to clipboard");
      } catch (error) {
        console.error("Failed to copy URL:", error);
      }
    }
  }, [getShareableUrl]);

  // If no document selected, show workspace view
  if (!currentDocumentId) {
    return (
      <div className="document-page-workspace-view">
        {showBreadcrumbs && (
          <div className="document-breadcrumbs-container">
            {compactBreadcrumbs ? (
              <CompactDocumentBreadcrumbs />
            ) : (
              <DocumentBreadcrumbs />
            )}
          </div>
        )}

        <div className="workspace-content">
          {showSidebar && (
            <div className="document-sidebar">
              <div className="sidebar-header">
                <h3>Documents</h3>
              </div>
              <InstantWorkspaceDocumentTree
                useUrlRouting={true}
                className="document-tree"
                showFileCount={true}
              />
            </div>
          )}

          <div className="workspace-main">
            <div className="workspace-welcome">
              <h1>Welcome to {activeWorkspace?.name}</h1>
              <p>Select a document from the sidebar to start editing, or create a new one.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading only if document not in cache and cache is ready
  if (!document && isReady) {
    return (
      <div className="document-page-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  // Show error if document not found
  if (isReady && !document) {
    return (
      <div className="document-page-error">
        <div className="error-content">
          <h2>Document Not Found</h2>
          <p>The requested document could not be found.</p>
          <button onClick={() => navigateToWorkspace()}>
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`instant-document-page ${className}`}>
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
            <InstantWorkspaceDocumentTree
              useUrlRouting={true}
              className="document-tree"
              showFileCount={true}
            />
          </div>
        )}

        <div className="document-main">
          <div className="document-header">
            <div className="document-title-section">
              <input
                type="text"
                value={document?.title || ""}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="document-title-input"
                placeholder="Document title..."
                onBlur={() => {
                  // Auto-save on blur
                  if (document?.title) {
                    handleTitleChange(document.title);
                  }
                }}
              />
              <div className="document-meta">
                {lastSaved && (
                  <span className="last-saved">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {isSaving && (
                  <span className="saving-indicator">Saving...</span>
                )}
                {saveError && (
                  <span className="save-error">Error: {saveError}</span>
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
            {document && (
              <NotionEditor
                room={document.id}
                placeholder="Start writing..."
              />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .instant-document-page,
        .document-page-workspace-view {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary, #ffffff);
        }

        .document-breadcrumbs-container {
          flex-shrink: 0;
          border-bottom: 1px solid var(--border-color, #e1e5e9);
        }

        .document-content,
        .workspace-content {
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

        .document-main,
        .workspace-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .workspace-main {
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px;
        }

        .workspace-welcome h1 {
          margin: 0 0 16px 0;
          font-size: 32px;
          font-weight: 600;
          color: var(--text-primary, #212529);
        }

        .workspace-welcome p {
          margin: 0;
          font-size: 18px;
          color: var(--text-secondary, #6c757d);
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

        .document-title-input {
          width: 100%;
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary, #212529);
          border: none;
          background: transparent;
          padding: 4px 0;
          margin: 0 0 4px 0;
          outline: none;
        }

        .document-title-input:focus {
          background: var(--bg-secondary, #f8f9fa);
          border-radius: 4px;
          padding: 4px 8px;
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

        .save-error {
          color: var(--color-error, #dc3545);
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

        .document-page-loading,
        .document-page-error {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .loading-content,
        .error-content {
          max-width: 400px;
          padding: 32px;
        }

        .loading-content h2,
        .error-content h2 {
          margin: 0 0 16px 0;
          font-size: 24px;
          color: var(--text-primary, #212529);
        }

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

          .document-title-input {
            font-size: 20px;
          }

          .document-actions {
            align-self: flex-end;
          }
        }

        @media (max-width: 480px) {
          .document-content,
          .workspace-content {
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

          .document-title-input {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Focused document page without sidebar (for distraction-free editing)
 */
export function FocusedInstantDocumentPage({ className = "" }: { className?: string }) {
  return (
    <InstantDocumentPage
      showSidebar={false}
      compactBreadcrumbs={true}
      className={`focused-document ${className}`}
    />
  );
}