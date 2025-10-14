"use client";

import React, { useMemo } from "react";
import { useWorkspaceCacheContext } from "../providers/WorkspaceCacheProvider";
import { useDocumentRouter } from "../../hooks/use-document-router";
import { buildFolderTree } from "@saas/lib/api";

interface CachedWorkspaceDocumentTreeProps {
  onDocumentSelect?: (documentId: string) => void;
  onFolderSelect?: (folderId: string) => void;
  selectedDocumentId?: string;
  className?: string;
  useUrlRouting?: boolean; // Enable URL-based navigation
}

interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "document";
  children: TreeNode[];
  parentId?: string;
  updatedAt?: string;
}

export function CachedWorkspaceDocumentTree({
  onDocumentSelect,
  onFolderSelect,
  selectedDocumentId,
  className,
  useUrlRouting = false,
}: CachedWorkspaceDocumentTreeProps) {
  const {
    documents,
    folders,
    isLoading,
    trackDocumentAccess,
    prefetchDocument,
  } = useWorkspaceCacheContext();

  const {
    currentDocumentId,
    currentFolderId,
    navigateToDocument,
    navigateToFolder,
  } = useDocumentRouter();

  // Use URL-based selection if enabled, otherwise use prop
  const effectiveSelectedDocumentId = useUrlRouting ? currentDocumentId : selectedDocumentId;
  const effectiveSelectedFolderId = useUrlRouting ? currentFolderId : null;

  // Build optimized tree structure from cached data
  const treeData = useMemo(() => {
    if (isLoading || !documents.length) {
      return [];
    }

    // Create folder tree structure
    const folderTree = buildFolderTree(folders);
    
    // Create a map of folders by ID for quick lookup
    const folderMap = new Map(folders.map(folder => [folder.id, folder]));
    
    // Group documents by folder
    const documentsByFolder = documents.reduce((acc, doc) => {
      const folderId = doc.folderId || "root";
      if (!acc[folderId]) {
        acc[folderId] = [];
      }
      acc[folderId].push(doc);
      return acc;
    }, {} as Record<string, any[]>);

    // Build complete tree with documents
    const buildTreeWithDocuments = (folderNodes: any[], parentId?: string): TreeNode[] => {
      const result: TreeNode[] = [];

      // Add folders
      folderNodes.forEach(folder => {
        const folderNode: TreeNode = {
          id: folder.id,
          name: folder.name,
          type: "folder",
          children: [],
          parentId,
        };

        // Recursively add subfolders
        if (folder.subFolders?.length) {
          folderNode.children.push(...buildTreeWithDocuments(folder.subFolders, folder.id));
        }

        // Add documents in this folder
        const folderDocs = documentsByFolder[folder.id] || [];
        folderDocs.forEach((doc: any) => {
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

      return result;
    };

    // Start with root folders
    const rootTree = buildTreeWithDocuments(folderTree);

    // Add root-level documents
    const rootDocuments = documentsByFolder.root || [];
    rootDocuments.forEach((doc: any) => {
      rootTree.push({
        id: doc.id,
        name: doc.title,
        type: "document",
        children: [],
        updatedAt: doc.updatedAt,
      });
    });

    return rootTree;
  }, [documents, folders, isLoading]);

  // Handle document selection with prefetching and tracking
  const handleDocumentClick = React.useCallback((documentId: string) => {
    trackDocumentAccess(documentId);
    prefetchDocument(documentId);
    
    if (useUrlRouting) {
      navigateToDocument(documentId);
    } else {
      onDocumentSelect?.(documentId);
    }
  }, [trackDocumentAccess, prefetchDocument, useUrlRouting, navigateToDocument, onDocumentSelect]);

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
    
    return (
      <div key={node.id} className="tree-node" style={{ paddingLeft: `${level * 16}px` }}>
        <div
          className={`tree-node-content ${isSelected || isFolderSelected ? "selected" : ""} ${node.type}`}
          onClick={() => {
            if (node.type === "document") {
              handleDocumentClick(node.id);
            } else {
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
                handleFolderClick(node.id);
              }
            }
          }}
        >
          {node.type === "folder" ? (
            <span className="folder-icon">📁</span>
          ) : (
            <span className="document-icon">📄</span>
          )}
          <span className="node-name">{node.name}</span>
          {node.type === "document" && node.updatedAt && (
            <span className="updated-at">
              {new Date(node.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {hasChildren && (
          <div className="tree-children">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }, [effectiveSelectedDocumentId, effectiveSelectedFolderId, handleDocumentClick, handleFolderClick]);

  if (isLoading) {
    return (
      <div className={`workspace-tree-loading ${className || ""}`}>
        <div className="loading-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-item" />
          ))}
        </div>
      </div>
    );
  }

  if (!treeData.length) {
    return (
      <div className={`workspace-tree-empty ${className || ""}`}>
        <p>No documents or folders found.</p>
        <p>Create your first document to get started!</p>
      </div>
    );
  }

  return (
    <div className={`workspace-document-tree ${className || ""}`}>
      <div className="tree-container">
        {treeData.map(node => renderTreeNode(node))}
      </div>
      
      <style jsx>{`
        .workspace-document-tree {
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
          transition: background-color 0.15s ease;
          gap: 8px;
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
        
        .folder-icon,
        .document-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .node-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .updated-at {
          font-size: 12px;
          color: var(--color-text-secondary, #666);
          flex-shrink: 0;
        }
        
        .tree-children {
          margin-left: 0;
        }
        
        .workspace-tree-loading,
        .workspace-tree-empty {
          padding: 16px;
          text-align: center;
          color: var(--color-text-secondary, #666);
        }
        
        .loading-skeleton {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .skeleton-item {
          height: 28px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for getting tree statistics
 */
export function useWorkspaceTreeStats() {
  const { documents, folders, isLoading } = useWorkspaceCacheContext();
  
  return useMemo(() => {
    if (isLoading) {
      return {
        totalDocuments: 0,
        totalFolders: 0,
        recentDocuments: 0,
        isLoading: true,
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
      isLoading: false,
    };
  }, [documents, folders, isLoading]);
}