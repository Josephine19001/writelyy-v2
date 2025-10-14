"use client";

import React, { useMemo } from "react";
import { useAggressiveWorkspaceCacheContext } from "../providers/AggressiveWorkspaceCacheProvider";
import { useDocumentRouter } from "../../hooks/use-document-router";
import { buildFolderTree } from "@saas/lib/api";

interface InstantWorkspaceDocumentTreeProps {
  onDocumentSelect?: (documentId: string) => void;
  onFolderSelect?: (folderId: string) => void;
  selectedDocumentId?: string;
  className?: string;
  useUrlRouting?: boolean;
  showFileCount?: boolean;
}

interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "document";
  children: TreeNode[];
  parentId?: string;
  updatedAt?: string;
  documentCount?: number;
}

export function InstantWorkspaceDocumentTree({
  onDocumentSelect,
  onFolderSelect,
  selectedDocumentId,
  className,
  useUrlRouting = false,
  showFileCount = true,
}: InstantWorkspaceDocumentTreeProps) {
  const {
    documents,
    folders,
    isReady,
    accessDocument,
  } = useAggressiveWorkspaceCacheContext();

  const {
    currentDocumentId,
    currentFolderId,
    navigateToDocument,
    navigateToFolder,
  } = useDocumentRouter();

  // Use URL-based selection if enabled, otherwise use prop
  const effectiveSelectedDocumentId = useUrlRouting ? currentDocumentId : selectedDocumentId;
  const effectiveSelectedFolderId = useUrlRouting ? currentFolderId : null;

  // Build optimized tree structure from cached data (no loading!)
  const treeData = useMemo(() => {
    if (!isReady) {
      return []; // Return empty array if not ready yet
    }

    // Create folder tree structure
    const folderTree = buildFolderTree(folders);
    
    // Group documents by folder
    const documentsByFolder = documents.reduce((acc, doc) => {
      const folderId = doc.folderId || "root";
      if (!acc[folderId]) {
        acc[folderId] = [];
      }
      acc[folderId].push(doc);
      return acc;
    }, {} as Record<string, any[]>);

    // Build complete tree with documents and counts
    const buildTreeWithDocuments = (folderNodes: any[], parentId?: string): TreeNode[] => {
      const result: TreeNode[] = [];

      // Add folders
      folderNodes.forEach(folder => {
        const folderDocs = documentsByFolder[folder.id] || [];
        const subFolderNodes = folder.subFolders?.length 
          ? buildTreeWithDocuments(folder.subFolders, folder.id)
          : [];

        // Count total documents in this folder and subfolders
        const totalDocCount = folderDocs.length + 
          subFolderNodes.reduce((sum, child) => sum + (child.documentCount || 0), 0);

        const folderNode: TreeNode = {
          id: folder.id,
          name: folder.name,
          type: "folder",
          children: [],
          parentId,
          documentCount: totalDocCount,
        };

        // Add subfolders
        folderNode.children.push(...subFolderNodes);

        // Add documents in this folder
        folderDocs
          .sort((a: any, b: any) => a.title.localeCompare(b.title)) // Sort alphabetically
          .forEach((doc: any) => {
            folderNode.children.push({
              id: doc.id,
              name: doc.title,
              type: "document",
              children: [],
              parentId: folder.id,
              updatedAt: doc.updatedAt,
            });
          });

        result.push(folderNode);
      });

      return result.sort((a, b) => a.name.localeCompare(b.name)); // Sort folders alphabetically
    };

    // Start with root folders
    const rootTree = buildTreeWithDocuments(folderTree);

    // Add root-level documents
    const rootDocuments = documentsByFolder.root || [];
    rootDocuments
      .sort((a: any, b: any) => a.title.localeCompare(b.title))
      .forEach((doc: any) => {
        rootTree.push({
          id: doc.id,
          name: doc.title,
          type: "document",
          children: [],
          updatedAt: doc.updatedAt,
        });
      });

    return rootTree;
  }, [documents, folders, isReady]);

  // Handle document selection with instant access
  const handleDocumentClick = React.useCallback(async (documentId: string) => {
    // Access document immediately (no loading state)
    accessDocument(documentId);
    
    if (useUrlRouting) {
      navigateToDocument(documentId);
    } else {
      onDocumentSelect?.(documentId);
    }
  }, [accessDocument, useUrlRouting, navigateToDocument, onDocumentSelect]);

  // Handle folder selection
  const handleFolderClick = React.useCallback((folderId: string) => {
    if (useUrlRouting) {
      navigateToFolder(folderId);
    } else {
      onFolderSelect?.(folderId);
    }
  }, [useUrlRouting, navigateToFolder, onFolderSelect]);

  // Render tree node
  const renderTreeNode = React.useCallback((node: TreeNode, level = 0) => {
    const isSelected = node.type === "document" && node.id === effectiveSelectedDocumentId;
    const isFolderSelected = node.type === "folder" && node.id === effectiveSelectedFolderId;
    const hasChildren = node.children.length > 0;
    const [isExpanded, setIsExpanded] = React.useState(level < 2); // Auto-expand first 2 levels
    
    return (
      <div key={node.id} className="tree-node" style={{ paddingLeft: `${level * 16}px` }}>
        <div
          className={`tree-node-content ${isSelected || isFolderSelected ? "selected" : ""} ${node.type}`}
          onClick={() => {
            if (node.type === "document") {
              handleDocumentClick(node.id);
            } else {
              // Toggle folder expansion
              setIsExpanded(!isExpanded);
              handleFolderClick(node.id);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (node.type === "document") {
                handleDocumentClick(node.id);
              } else {
                setIsExpanded(!isExpanded);
                handleFolderClick(node.id);
              }
            }
          }}
        >
          {node.type === "folder" ? (
            <>
              <span className="folder-toggle">
                {hasChildren ? (isExpanded ? "📂" : "📁") : "📁"}
              </span>
              <span className="node-name">{node.name}</span>
              {showFileCount && node.documentCount !== undefined && (
                <span className="document-count">({node.documentCount})</span>
              )}
            </>
          ) : (
            <>
              <span className="document-icon">📄</span>
              <span className="node-name">{node.name}</span>
              {node.updatedAt && (
                <span className="updated-at">
                  {new Date(node.updatedAt).toLocaleDateString()}
                </span>
              )}
            </>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [effectiveSelectedDocumentId, effectiveSelectedFolderId, handleDocumentClick, handleFolderClick, showFileCount]);

  // Show empty state only if ready but no data
  if (isReady && !treeData.length) {
    return (
      <div className={`workspace-tree-empty ${className || ""}`}>
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No Documents</h3>
          <p>Create your first document to get started!</p>
        </div>

        <style jsx>{`
          .workspace-tree-empty {
            padding: 32px 16px;
            text-align: center;
            color: var(--text-secondary, #6c757d);
          }

          .empty-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }

          .empty-state h3 {
            margin: 0 0 8px 0;
            font-size: 18px;
            color: var(--text-primary, #212529);
          }

          .empty-state p {
            margin: 0;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`instant-workspace-document-tree ${className || ""}`}>
      <div className="tree-container">
        {treeData.map(node => renderTreeNode(node))}
      </div>
      
      <style jsx>{`
        .instant-workspace-document-tree {
          height: 100%;
          overflow-y: auto;
        }
        
        .tree-container {
          padding: 8px 0;
        }
        
        .tree-node-content {
          display: flex;
          align-items: center;
          padding: 6px 8px;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.1s ease;
          gap: 8px;
          min-height: 32px;
        }
        
        .tree-node-content:hover {
          background-color: var(--color-bg-hover, #f5f5f5);
        }
        
        .tree-node-content.selected {
          background-color: var(--color-bg-selected, #e3f2fd);
          font-weight: 500;
        }
        
        .tree-node-content.document {
          font-size: 14px;
        }
        
        .tree-node-content.folder {
          font-weight: 500;
          font-size: 14px;
        }
        
        .folder-toggle,
        .document-icon {
          font-size: 16px;
          flex-shrink: 0;
          line-height: 1;
        }
        
        .node-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
        }
        
        .document-count {
          font-size: 12px;
          color: var(--text-muted, #adb5bd);
          background: var(--bg-secondary, #f8f9fa);
          padding: 2px 6px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        
        .updated-at {
          font-size: 11px;
          color: var(--text-muted, #adb5bd);
          flex-shrink: 0;
        }
        
        .tree-children {
          margin-left: 0;
        }
        
        /* Improved scrollbar */
        .instant-workspace-document-tree::-webkit-scrollbar {
          width: 6px;
        }
        
        .instant-workspace-document-tree::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .instant-workspace-document-tree::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb, #c1c1c1);
          border-radius: 3px;
        }
        
        .instant-workspace-document-tree::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover, #a8a8a8);
        }

        /* Performance optimizations */
        .tree-node {
          will-change: transform;
        }

        .tree-node-content {
          will-change: background-color;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for getting tree statistics instantly
 */
export function useInstantWorkspaceTreeStats() {
  const { documents, folders, isReady } = useAggressiveWorkspaceCacheContext();
  
  return useMemo(() => {
    if (!isReady) {
      return {
        totalDocuments: 0,
        totalFolders: 0,
        recentDocuments: 0,
        isReady: false,
      };
    }
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDocuments = documents.filter(doc => 
      new Date(doc.updatedAt) > weekAgo
    ).length;
    
    return {
      totalDocuments: documents.length,
      totalFolders: folders.length,
      recentDocuments,
      isReady: true,
    };
  }, [documents, folders, isReady]);
}