"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import {
  documentsQueryKey,
  foldersQueryKey,
  folderTreeQueryKey,
  sourcesQueryKey,
  useDocumentsQuery,
  useAllFoldersQuery,
  useSourcesQuery,
} from "@saas/lib/api";

/**
 * Hook for managing workspace data cache
 * Pre-fetches and caches all workspace data for optimal performance
 */
export function useWorkspaceCache(organizationId: string | null) {
  const queryClient = useQueryClient();

  // Pre-fetch all workspace data when organization changes
  const documentsQuery = useDocumentsQuery(organizationId!, {
    enabled: !!organizationId,
    limit: 1000, // Fetch a large number initially
  });

  const foldersQuery = useAllFoldersQuery(organizationId!, {
    enabled: !!organizationId,
  });

  const sourcesQuery = useSourcesQuery(organizationId!, {
    enabled: false, // Temporarily disabled due to validation issues
    limit: 1000,
  });

  // Cache invalidation function
  const invalidateWorkspaceCache = useCallback(() => {
    if (!organizationId) return;

    queryClient.invalidateQueries({
      queryKey: documentsQueryKey(organizationId),
    });
    queryClient.invalidateQueries({
      queryKey: foldersQueryKey(organizationId),
    });
    queryClient.invalidateQueries({
      queryKey: folderTreeQueryKey(organizationId),
    });
    queryClient.invalidateQueries({
      queryKey: sourcesQueryKey(organizationId),
    });
  }, [organizationId, queryClient]);

  // Prefetch individual documents when they're likely to be accessed
  const prefetchDocument = useCallback(async (documentId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["document", documentId],
      queryFn: async () => {
        const { orpcClient } = await import("@shared/lib/orpc-client");
        const { document } = await orpcClient.documents.find({ id: documentId });
        return document;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  // Batch prefetch documents based on recent access patterns
  const prefetchRecentDocuments = useCallback(async (documentIds: string[]) => {
    const prefetchPromises = documentIds.slice(0, 10).map(id => prefetchDocument(id));
    await Promise.allSettled(prefetchPromises);
  }, [prefetchDocument]);

  // Update cache when data changes
  const updateDocumentCache = useCallback((document: any, options?: { updateListCache?: boolean, isTemporary?: boolean }) => {
    // Always update the individual document cache
    queryClient.setQueryData(["document", document.id], document);
    
    // Determine if we should update the list cache
    const shouldUpdateListCache = options?.updateListCache !== false;
    
    if (shouldUpdateListCache) {
      queryClient.setQueryData(
        documentsQueryKey(organizationId!),
        (oldData: any) => {
          if (!oldData) return oldData;
          
          const updatedDocuments = oldData.documents.map((doc: any) => {
            if (doc.id === document.id) {
              // Update the document metadata in the list
              return {
                ...doc,
                title: document.title,
                updatedAt: document.updatedAt,
                folderId: document.folderId,
                // Don't include content in the list cache to keep it lightweight
              };
            }
            return doc;
          });
          
          return {
            ...oldData,
            documents: updatedDocuments,
          };
        }
      );
    }
  }, [organizationId, queryClient]);

  const updateFolderCache = useCallback((folder: any) => {
    queryClient.setQueryData(
      foldersQueryKey(organizationId!),
      (oldData: any) => {
        if (!oldData) return oldData;
        
        const updatedFolders = oldData.map((f: any) =>
          f.id === folder.id ? folder : f
        );
        
        return updatedFolders;
      }
    );
    
    // Invalidate folder tree to rebuild hierarchy
    queryClient.invalidateQueries({
      queryKey: folderTreeQueryKey(organizationId!),
    });
  }, [organizationId, queryClient]);

  // Smart cache warming based on user patterns
  useEffect(() => {
    if (!organizationId || !documentsQuery.data?.documents) return;

    // Get recently accessed documents from localStorage
    const recentDocuments = localStorage.getItem(`recent-docs-${organizationId}`);
    if (recentDocuments) {
      try {
        const documentIds = JSON.parse(recentDocuments) as string[];
        prefetchRecentDocuments(documentIds);
      } catch (error) {
        console.warn("Failed to parse recent documents from localStorage:", error);
      }
    }
  }, [organizationId, documentsQuery.data, prefetchRecentDocuments]);

  // Track document access for future prefetching
  const trackDocumentAccess = useCallback((documentId: string) => {
    if (!organizationId) return;

    const key = `recent-docs-${organizationId}`;
    const existing = localStorage.getItem(key);
    let recentDocs: string[] = [];
    
    if (existing) {
      try {
        recentDocs = JSON.parse(existing);
      } catch (error) {
        console.warn("Failed to parse existing recent docs:", error);
      }
    }
    
    // Add to front and limit to 20 most recent
    recentDocs = [documentId, ...recentDocs.filter(id => id !== documentId)].slice(0, 20);
    localStorage.setItem(key, JSON.stringify(recentDocs));
  }, [organizationId]);

  const isLoading = documentsQuery.isLoading || foldersQuery.isLoading || sourcesQuery.isLoading;
  const hasError = documentsQuery.error || foldersQuery.error || sourcesQuery.error;

  return {
    // Data
    documents: documentsQuery.data?.documents || [],
    folders: foldersQuery.data || [],
    sources: sourcesQuery.data?.sources || [],
    
    // Loading states
    isLoading,
    isDocumentsLoading: documentsQuery.isLoading,
    isFoldersLoading: foldersQuery.isLoading,
    isSourcesLoading: sourcesQuery.isLoading,
    
    // Error states
    hasError,
    documentsError: documentsQuery.error,
    foldersError: foldersQuery.error,
    sourcesError: sourcesQuery.error,
    
    // Cache management
    invalidateWorkspaceCache,
    updateDocumentCache,
    updateFolderCache,
    prefetchDocument,
    trackDocumentAccess,
    
    // Refetch functions
    refetchDocuments: documentsQuery.refetch,
    refetchFolders: foldersQuery.refetch,
    refetchSources: sourcesQuery.refetch,
  };
}

/**
 * Hook for getting cached workspace overview data
 * Returns immediately available cached data without triggering requests
 */
export function useWorkspaceCacheSnapshot(organizationId: string | null) {
  const queryClient = useQueryClient();

  if (!organizationId) {
    return {
      documents: [],
      folders: [],
      sources: [],
      isCached: false,
    };
  }

  const documentsData = queryClient.getQueryData(documentsQueryKey(organizationId));
  const foldersData = queryClient.getQueryData(foldersQueryKey(organizationId));
  const sourcesData = queryClient.getQueryData(sourcesQueryKey(organizationId));

  return {
    documents: (documentsData as any)?.documents || [],
    folders: (foldersData as any) || [],
    sources: (sourcesData as any)?.sources || [],
    isCached: !!(documentsData && foldersData && sourcesData),
  };
}