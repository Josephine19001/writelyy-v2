"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useAggressiveWorkspaceCache } from "../../hooks/use-aggressive-workspace-cache";

type AggressiveWorkspaceCacheContextValue = {
  // Loading states - should only be true on initial load
  isInitializing: boolean;
  isReady: boolean;
  hasError: boolean;
  error: Error | null;
  
  // Data - available instantly after initial load
  documents: any[];
  folders: any[];
  sources: any[];
  
  // Stats
  totalDocuments: number;
  totalSources: number;
  lastUpdated: Date | null;
  
  // Document operations (no loading states)
  getDocument: (documentId: string) => any;
  accessDocument: (documentId: string) => Promise<any>;
  updateDocument: (documentId: string, updates: any) => void;
  
  // Cache management
  refreshWorkspace: () => Promise<void>;
  getSnapshot: () => { documents: any[]; folders: any[]; sources: any[]; isCached: boolean };
  
  // Performance
  cacheStats: {
    documentsCount: number;
    foldersCount: number;
    sourcesCount: number;
    isReady: boolean;
    lastUpdated: Date | null;
  };
};

const AggressiveWorkspaceCacheContext = createContext<AggressiveWorkspaceCacheContextValue | null>(null);

export function useAggressiveWorkspaceCacheContext() {
  const context = useContext(AggressiveWorkspaceCacheContext);
  if (!context) {
    throw new Error("useAggressiveWorkspaceCacheContext must be used within an AggressiveWorkspaceCacheProvider");
  }
  return context;
}

interface AggressiveWorkspaceCacheProviderProps {
  children: React.ReactNode;
  showPerformanceStats?: boolean;
}

export function AggressiveWorkspaceCacheProvider({ 
  children, 
  showPerformanceStats = false 
}: AggressiveWorkspaceCacheProviderProps) {
  const { activeWorkspace } = useActiveWorkspace();
  
  const cacheHook = useAggressiveWorkspaceCache(activeWorkspace?.id || null);

  // Performance monitoring
  useEffect(() => {
    if (!showPerformanceStats || process.env.NODE_ENV !== "development") return;

    const logStats = () => {
      if (cacheHook.isReady) {
        console.group("📊 Workspace Cache Performance");
        console.log("Documents cached:", cacheHook.documents.length);
        console.log("Folders cached:", cacheHook.folders.length);
        console.log("Sources cached:", cacheHook.sources.length);
        console.log("Last updated:", cacheHook.lastUpdated?.toLocaleTimeString());
        console.log("Cache ready:", cacheHook.isReady);
        console.groupEnd();
      }
    };

    // Log initial stats
    if (cacheHook.isReady) {
      logStats();
    }

    // Set up periodic logging
    const interval = setInterval(logStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [cacheHook.isReady, cacheHook.documents.length, cacheHook.folders.length, cacheHook.sources.length, showPerformanceStats]);

  // Show loading screen only during initial cache load
  if (activeWorkspace && cacheHook.isInitializing) {
    return (
      <div className="workspace-cache-initializing">
        <div className="cache-loading-content">
          <div className="cache-loading-spinner"></div>
          <h2>Loading Workspace</h2>
          <p>Preparing {activeWorkspace.name} for lightning-fast access...</p>
          <div className="cache-loading-details">
            <div className="loading-step">📄 Loading documents</div>
            <div className="loading-step">📁 Loading folders</div>
            <div className="loading-step">🔗 Loading sources</div>
            <div className="loading-step">🚀 Optimizing cache</div>
          </div>
        </div>

        <style jsx>{`
          .workspace-cache-initializing {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary, #ffffff);
          }

          .cache-loading-content {
            text-align: center;
            max-width: 400px;
            padding: 32px;
          }

          .cache-loading-spinner {
            width: 60px;
            height: 60px;
            border: 4px solid var(--border-color, #e1e5e9);
            border-top: 4px solid var(--color-primary, #007bff);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 24px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .cache-loading-content h2 {
            margin: 0 0 16px 0;
            font-size: 24px;
            font-weight: 600;
            color: var(--text-primary, #212529);
          }

          .cache-loading-content p {
            margin: 0 0 24px 0;
            color: var(--text-secondary, #6c757d);
            font-size: 16px;
          }

          .cache-loading-details {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }

          .loading-step {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: var(--text-secondary, #6c757d);
            animation: pulse 2s ease-in-out infinite;
          }

          .loading-step:nth-child(1) { animation-delay: 0s; }
          .loading-step:nth-child(2) { animation-delay: 0.3s; }
          .loading-step:nth-child(3) { animation-delay: 0.6s; }
          .loading-step:nth-child(4) { animation-delay: 0.9s; }

          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Show error state
  if (cacheHook.hasError) {
    return (
      <div className="workspace-cache-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>Failed to Load Workspace</h2>
          <p>There was an error loading your workspace data.</p>
          <div className="error-actions">
            <button 
              onClick={() => cacheHook.refreshWorkspace()}
              className="retry-button"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="reload-button"
            >
              Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === "development" && (
            <details className="error-details">
              <summary>Error Details</summary>
              <pre>{cacheHook.error?.message}</pre>
            </details>
          )}
        </div>

        <style jsx>{`
          .workspace-cache-error {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary, #ffffff);
          }

          .error-content {
            text-align: center;
            max-width: 500px;
            padding: 32px;
          }

          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .error-content h2 {
            margin: 0 0 16px 0;
            font-size: 24px;
            color: var(--color-error, #dc3545);
          }

          .error-content p {
            margin: 0 0 24px 0;
            color: var(--text-secondary, #6c757d);
          }

          .error-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-bottom: 24px;
          }

          .retry-button,
          .reload-button {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.15s ease;
          }

          .retry-button {
            background: var(--color-primary, #007bff);
            color: white;
          }

          .retry-button:hover {
            background: var(--color-primary-dark, #0056b3);
          }

          .reload-button {
            background: var(--bg-secondary, #f8f9fa);
            color: var(--text-primary, #212529);
            border: 1px solid var(--border-color, #e1e5e9);
          }

          .reload-button:hover {
            background: var(--bg-hover, #e9ecef);
          }

          .error-details {
            margin-top: 16px;
            text-align: left;
          }

          .error-details pre {
            background: var(--bg-secondary, #f8f9fa);
            padding: 12px;
            border-radius: 4px;
            font-size: 12px;
            overflow-x: auto;
          }
        `}</style>
      </div>
    );
  }

  const contextValue: AggressiveWorkspaceCacheContextValue = cacheHook;

  return (
    <AggressiveWorkspaceCacheContext.Provider value={contextValue}>
      {children}
    </AggressiveWorkspaceCacheContext.Provider>
  );
}

/**
 * Performance monitoring component for development
 */
export function WorkspaceCacheDebugPanel() {
  const { cacheStats, isReady, hasError, totalDocuments, totalSources } = useAggressiveWorkspaceCacheContext();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="cache-debug-panel">
      <h4>Cache Debug</h4>
      <div className="debug-stats">
        <div className="stat">
          <label>Status:</label>
          <span className={isReady ? "ready" : hasError ? "error" : "loading"}>
            {isReady ? "✅ Ready" : hasError ? "❌ Error" : "⏳ Loading"}
          </span>
        </div>
        <div className="stat">
          <label>Documents:</label>
          <span>{cacheStats.documentsCount} / {totalDocuments}</span>
        </div>
        <div className="stat">
          <label>Folders:</label>
          <span>{cacheStats.foldersCount}</span>
        </div>
        <div className="stat">
          <label>Sources:</label>
          <span>{cacheStats.sourcesCount} / {totalSources}</span>
        </div>
        <div className="stat">
          <label>Updated:</label>
          <span>{cacheStats.lastUpdated?.toLocaleTimeString() || "Never"}</span>
        </div>
      </div>

      <style jsx>{`
        .cache-debug-panel {
          position: fixed;
          bottom: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          min-width: 200px;
          z-index: 9999;
        }

        .cache-debug-panel h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .debug-stats {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat label {
          opacity: 0.8;
        }

        .stat span.ready {
          color: #28a745;
        }

        .stat span.error {
          color: #dc3545;
        }

        .stat span.loading {
          color: #ffc107;
        }
      `}</style>
    </div>
  );
}