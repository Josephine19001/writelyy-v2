"use client";

import React from "react";
import { WorkspaceCacheProvider, useWorkspaceCacheContext } from "../providers/WorkspaceCacheProvider";
import { CachedWorkspaceDocumentTree } from "../workspace/CachedWorkspaceDocumentTree";
import { useCacheWarmer } from "../../hooks/use-cache-warmer";
import { useOptimizedDocumentMutations } from "../../hooks/use-optimized-mutations";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";

/**
 * Example component showing how to use the workspace cache system
 */
function WorkspaceCacheExampleInner() {
  const { activeWorkspace } = useActiveWorkspace();
  const {
    documents,
    folders,
    isLoading,
    cacheStats,
    trackDocumentAccess,
    updateDocumentCache,
  } = useWorkspaceCacheContext();

  const { warmCache, getCacheStats } = useCacheWarmer(activeWorkspace?.id || null);
  const { updateDocument } = useOptimizedDocumentMutations(activeWorkspace?.id || "");

  const [selectedDocumentId, setSelectedDocumentId] = React.useState<string | null>(null);

  const handleDocumentSelect = React.useCallback((documentId: string) => {
    setSelectedDocumentId(documentId);
    trackDocumentAccess(documentId);
    console.log("Document selected:", documentId);
  }, [trackDocumentAccess]);

  const handleDocumentUpdate = React.useCallback(async (documentId: string, updates: any) => {
    try {
      await updateDocument.mutateAsync({
        id: documentId,
        ...updates,
      });
      console.log("Document updated successfully");
    } catch (error) {
      console.error("Failed to update document:", error);
    }
  }, [updateDocument]);

  const handleManualCacheWarm = React.useCallback(() => {
    warmCache();
    console.log("Manual cache warming triggered");
  }, [warmCache]);

  if (isLoading) {
    return (
      <div className="workspace-cache-example loading">
        <h2>Loading Workspace Data...</h2>
        <div className="loading-stats">
          <p>Fetching documents, folders, and sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-cache-example">
      <div className="cache-header">
        <h2>Workspace Cache Example</h2>
        <div className="cache-stats">
          <div className="stat">
            <label>Documents:</label>
            <span>{cacheStats.documentsCount}</span>
          </div>
          <div className="stat">
            <label>Folders:</label>
            <span>{cacheStats.foldersCount}</span>
          </div>
          <div className="stat">
            <label>Sources:</label>
            <span>{cacheStats.sourcesCount}</span>
          </div>
          <div className="stat">
            <label>Last Updated:</label>
            <span>{cacheStats.lastUpdated?.toLocaleTimeString()}</span>
          </div>
        </div>
        <button 
          onClick={handleManualCacheWarm}
          className="warm-cache-btn"
          type="button"
        >
          Warm Cache
        </button>
      </div>

      <div className="workspace-content">
        <div className="sidebar">
          <h3>Document Tree (Cached)</h3>
          <CachedWorkspaceDocumentTree
            onDocumentSelect={handleDocumentSelect}
            selectedDocumentId={selectedDocumentId}
            className="example-tree"
          />
        </div>

        <div className="main-content">
          {selectedDocumentId ? (
            <div className="document-viewer">
              <h3>Selected Document: {selectedDocumentId}</h3>
              <p>This would show the document editor with cached data.</p>
              
              <div className="document-actions">
                <button
                  onClick={() => handleDocumentUpdate(selectedDocumentId, {
                    title: `Updated at ${new Date().toLocaleTimeString()}`,
                  })}
                  disabled={updateDocument.isPending}
                  type="button"
                >
                  {updateDocument.isPending ? "Updating..." : "Update Document Title"}
                </button>
              </div>

              {updateDocument.isError && (
                <div className="error">
                  Error updating document: {updateDocument.error?.message}
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              <h3>Select a Document</h3>
              <p>Choose a document from the tree to view it here.</p>
              <p>All data is loaded from cache for instant access!</p>
            </div>
          )}
        </div>
      </div>

      <div className="cache-debug">
        <h4>Cache Debug Info</h4>
        <pre>{JSON.stringify(getCacheStats(), null, 2)}</pre>
      </div>

      <style jsx>{`
        .workspace-cache-example {
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .workspace-cache-example.loading {
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .cache-header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 16px;
        }

        .cache-header h2 {
          margin: 0;
          flex: 1;
        }

        .cache-stats {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stat label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
        }

        .stat span {
          font-size: 18px;
          font-weight: bold;
          color: #2196f3;
        }

        .warm-cache-btn {
          padding: 8px 16px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .warm-cache-btn:hover {
          background: #45a049;
        }

        .workspace-content {
          display: flex;
          flex: 1;
          gap: 16px;
          min-height: 0;
        }

        .sidebar {
          width: 300px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .sidebar h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
        }

        .example-tree {
          flex: 1;
          overflow-y: auto;
        }

        .main-content {
          flex: 1;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
        }

        .document-viewer h3,
        .no-selection h3 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .document-actions {
          margin: 16px 0;
        }

        .document-actions button {
          padding: 8px 16px;
          background: #2196f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .document-actions button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .document-actions button:hover:not(:disabled) {
          background: #1976d2;
        }

        .error {
          color: #f44336;
          background: #ffebee;
          padding: 8px 16px;
          border-radius: 4px;
          margin: 8px 0;
        }

        .no-selection {
          text-align: center;
          color: #666;
        }

        .cache-debug {
          margin-top: 16px;
          padding: 16px;
          background: #f5f5f5;
          border-radius: 8px;
          max-height: 200px;
          overflow-y: auto;
        }

        .cache-debug h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .cache-debug pre {
          font-size: 12px;
          margin: 0;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}

/**
 * Complete example with the cache provider
 */
export function WorkspaceCacheExample() {
  return (
    <WorkspaceCacheProvider>
      <WorkspaceCacheExampleInner />
    </WorkspaceCacheProvider>
  );
}