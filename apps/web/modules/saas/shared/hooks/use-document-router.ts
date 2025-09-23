"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useWorkspaceCacheContext } from "../components/providers/WorkspaceCacheProvider";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";

export interface DocumentRouterState {
  currentDocumentId: string | null;
  currentFolderId: string | null;
  isInDocumentView: boolean;
  isInFolderView: boolean;
  documentPath: DocumentPathItem[];
}

export interface DocumentPathItem {
  id: string;
  name: string;
  type: "workspace" | "folder" | "document";
  url: string;
}

/**
 * Hook for managing document navigation with URL tracking
 * Provides URL-based routing for documents with deep linking support
 */
export function useDocumentRouter() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { activeWorkspace } = useActiveWorkspace();
  const { documents, folders, trackDocumentAccess } = useWorkspaceCacheContext();

  // Extract current state from URL
  const currentDocumentId = params.documentId as string || null;
  const currentFolderId = params.folderId as string || searchParams.get("folder") || null;
  
  const isInDocumentView = !!currentDocumentId;
  const isInFolderView = !!currentFolderId && !currentDocumentId;

  // Find current document and folder
  const currentDocument = useMemo(() => {
    return currentDocumentId ? documents.find(doc => doc.id === currentDocumentId) : null;
  }, [currentDocumentId, documents]);

  const currentFolder = useMemo(() => {
    return currentFolderId ? folders.find(folder => folder.id === currentFolderId) : null;
  }, [currentFolderId, folders]);

  // Build breadcrumb path
  const documentPath = useMemo(() => {
    const path: DocumentPathItem[] = [];
    
    if (!activeWorkspace) return path;

    // Add workspace root
    path.push({
      id: activeWorkspace.id,
      name: activeWorkspace.name,
      type: "workspace",
      url: `/app/${activeWorkspace.slug}`,
    });

    // Build folder path if we're in a folder or document has a folder
    const targetFolderId = currentFolderId || currentDocument?.folderId;
    if (targetFolderId) {
      const folderPath = buildFolderPath(targetFolderId, folders);
      folderPath.forEach(folder => {
        path.push({
          id: folder.id,
          name: folder.name,
          type: "folder",
          url: `/app/${activeWorkspace.slug}/folders/${folder.id}`,
        });
      });
    }

    // Add current document if viewing one
    if (currentDocument) {
      path.push({
        id: currentDocument.id,
        name: currentDocument.title,
        type: "document",
        url: `/app/${activeWorkspace.slug}/docs/${currentDocument.id}`,
      });
    }

    return path;
  }, [activeWorkspace, currentFolderId, currentDocument, folders]);

  // Navigation functions
  const navigateToDocument = useCallback((documentId: string, options?: {
    replace?: boolean;
    trackAccess?: boolean;
  }) => {
    if (!activeWorkspace) return;
    
    const url = `/app/${activeWorkspace.slug}/docs/${documentId}`;
    
    if (options?.trackAccess !== false) {
      trackDocumentAccess(documentId);
    }
    
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }, [activeWorkspace, router, trackDocumentAccess]);

  const navigateToFolder = useCallback((folderId: string | null, options?: {
    replace?: boolean;
  }) => {
    if (!activeWorkspace) return;
    
    const url = folderId 
      ? `/app/${activeWorkspace.slug}/folders/${folderId}`
      : `/app/${activeWorkspace.slug}`;
    
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }, [activeWorkspace, router]);

  const navigateToWorkspace = useCallback((options?: {
    replace?: boolean;
  }) => {
    if (!activeWorkspace) return;
    
    const url = `/app/${activeWorkspace.slug}`;
    
    if (options?.replace) {
      router.replace(url);
    } else {
      router.push(url);
    }
  }, [activeWorkspace, router]);

  // Navigate back in the path
  const navigateBack = useCallback(() => {
    if (documentPath.length <= 1) return;
    
    const previousItem = documentPath[documentPath.length - 2];
    if (previousItem.type === "document") {
      navigateToDocument(previousItem.id);
    } else if (previousItem.type === "folder") {
      navigateToFolder(previousItem.id);
    } else {
      navigateToWorkspace();
    }
  }, [documentPath, navigateToDocument, navigateToFolder, navigateToWorkspace]);

  // Create new document in current context
  const createDocumentInCurrentContext = useCallback(() => {
    if (!activeWorkspace) return null;
    
    // If we're in a folder, create document there
    const folderId = currentFolderId || currentDocument?.folderId;
    
    return {
      organizationId: activeWorkspace.id,
      folderId: folderId || undefined,
      title: "Untitled Document",
    };
  }, [activeWorkspace, currentFolderId, currentDocument]);

  // Update URL when document/folder changes programmatically
  const updateUrl = useCallback((documentId?: string | null, folderId?: string | null) => {
    if (!activeWorkspace) return;
    
    let url = `/app/${activeWorkspace.slug}`;
    
    if (documentId) {
      url += `/docs/${documentId}`;
    } else if (folderId) {
      url += `/folders/${folderId}`;
    }
    
    router.replace(url);
  }, [activeWorkspace, router]);

  // Track document access when URL changes
  useEffect(() => {
    if (currentDocumentId && isInDocumentView) {
      trackDocumentAccess(currentDocumentId);
    }
  }, [currentDocumentId, isInDocumentView, trackDocumentAccess]);

  // Generate shareable URL
  const getShareableUrl = useCallback((documentId?: string) => {
    if (!activeWorkspace) return null;
    
    const docId = documentId || currentDocumentId;
    if (!docId) return null;
    
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/app/${activeWorkspace.slug}/docs/${docId}`;
  }, [activeWorkspace, currentDocumentId]);

  const routerState: DocumentRouterState = {
    currentDocumentId,
    currentFolderId,
    isInDocumentView,
    isInFolderView,
    documentPath,
  };

  return {
    // Current state
    ...routerState,
    currentDocument,
    currentFolder,
    
    // Navigation functions
    navigateToDocument,
    navigateToFolder,
    navigateToWorkspace,
    navigateBack,
    updateUrl,
    
    // Utilities
    createDocumentInCurrentContext,
    getShareableUrl,
    
    // Path helpers
    isAtRoot: documentPath.length <= 1,
    canNavigateBack: documentPath.length > 1,
    parentPath: documentPath.slice(0, -1),
  };
}

/**
 * Helper function to build folder path from root to target folder
 */
function buildFolderPath(targetFolderId: string, folders: any[]): any[] {
  const path: any[] = [];
  const folderMap = new Map(folders.map(f => [f.id, f]));
  
  let currentFolder = folderMap.get(targetFolderId);
  
  while (currentFolder) {
    path.unshift(currentFolder);
    currentFolder = currentFolder.parentFolderId 
      ? folderMap.get(currentFolder.parentFolderId)
      : null;
  }
  
  return path;
}

/**
 * Hook for document URL management in components
 */
export function useDocumentUrl(documentId?: string) {
  const { activeWorkspace } = useActiveWorkspace();
  const { getShareableUrl, navigateToDocument } = useDocumentRouter();
  
  const documentUrl = useMemo(() => {
    if (!documentId || !activeWorkspace) return null;
    return `/app/${activeWorkspace.slug}/docs/${documentId}`;
  }, [documentId, activeWorkspace]);
  
  const shareableUrl = useMemo(() => {
    return getShareableUrl(documentId);
  }, [getShareableUrl, documentId]);
  
  const openDocument = useCallback(() => {
    if (documentId) {
      navigateToDocument(documentId);
    }
  }, [documentId, navigateToDocument]);
  
  return {
    documentUrl,
    shareableUrl,
    openDocument,
  };
}

/**
 * Hook for keyboard navigation shortcuts
 */
export function useDocumentKeyboardNavigation() {
  const { navigateBack, currentDocumentId } = useDocumentRouter();
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if we're not in an input/textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLElement && event.target.contentEditable === "true"
      ) {
        return;
      }
      
      // Escape key to go back
      if (event.key === "Escape" && currentDocumentId) {
        event.preventDefault();
        navigateBack();
      }
      
      // Cmd/Ctrl + Left Arrow to go back
      if ((event.metaKey || event.ctrlKey) && event.key === "ArrowLeft") {
        event.preventDefault();
        navigateBack();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigateBack, currentDocumentId]);
}