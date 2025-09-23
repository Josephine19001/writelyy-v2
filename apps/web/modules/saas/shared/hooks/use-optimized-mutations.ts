"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpcClient } from "@shared/lib/orpc-client";
import {
  documentQueryKey,
  documentsQueryKey,
  foldersQueryKey,
  folderTreeQueryKey,
} from "@saas/lib/api";

/**
 * Optimized document mutations with intelligent cache management
 */
export function useOptimizedDocumentMutations(organizationId: string) {
  const queryClient = useQueryClient();

  // Optimistic update helper
  const optimisticUpdateDocument = (documentId: string, updates: Partial<any>) => {
    queryClient.setQueryData(documentQueryKey(documentId), (oldDoc: any) => ({
      ...oldDoc,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));

    // Update in documents list
    queryClient.setQueryData(documentsQueryKey(organizationId), (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        documents: oldData.documents.map((doc: any) =>
          doc.id === documentId ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
        ),
      };
    });
  };

  // Create document with optimistic updates
  const createDocument = useMutation({
    mutationFn: async (data: {
      title: string;
      folderId?: string;
      content?: any;
      description?: string;
      isTemplate?: boolean;
    }) => {
      const { document } = await orpcClient.documents.create({
        ...data,
        organizationId,
        isTemplate: data.isTemplate || false,
      });
      return document;
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: documentsQueryKey(organizationId) });

      // Snapshot previous value
      const previousDocuments = queryClient.getQueryData(documentsQueryKey(organizationId));

      // Optimistically update
      const tempId = `temp-${Date.now()}`;
      const optimisticDocument = {
        id: tempId,
        title: variables.title,
        content: variables.content,
        description: variables.description,
        folderId: variables.folderId,
        isTemplate: variables.isTemplate || false,
        organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOptimistic: true,
      };

      queryClient.setQueryData(documentsQueryKey(organizationId), (old: any) => ({
        ...old,
        documents: [optimisticDocument, ...(old?.documents || [])],
        total: (old?.total || 0) + 1,
      }));

      return { previousDocuments, tempId };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousDocuments) {
        queryClient.setQueryData(documentsQueryKey(organizationId), context.previousDocuments);
      }
    },
    onSuccess: (document, variables, context) => {
      // Replace temp document with real one
      queryClient.setQueryData(documentsQueryKey(organizationId), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          documents: old.documents.map((doc: any) =>
            doc.id === context?.tempId ? document : doc
          ),
        };
      });

      // Set individual document cache
      queryClient.setQueryData(documentQueryKey(document.id), document);

      // Track document creation
      localStorage.setItem(`last-created-doc-${organizationId}`, document.id);
    },
  });

  // Update document with optimistic updates
  const updateDocument = useMutation({
    mutationFn: async (data: {
      id: string;
      title?: string;
      content?: any;
      description?: string;
      tags?: string[];
      folderId?: string | null;
      createVersion?: boolean;
    }) => {
      const { document } = await orpcClient.documents.update(data);
      return document;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: documentQueryKey(variables.id) });
      await queryClient.cancelQueries({ queryKey: documentsQueryKey(organizationId) });

      const previousDocument = queryClient.getQueryData(documentQueryKey(variables.id));
      const previousDocuments = queryClient.getQueryData(documentsQueryKey(organizationId));

      // Optimistic update
      optimisticUpdateDocument(variables.id, variables);

      return { previousDocument, previousDocuments };
    },
    onError: (err, variables, context) => {
      // Revert optimistic updates
      if (context?.previousDocument) {
        queryClient.setQueryData(documentQueryKey(variables.id), context.previousDocument);
      }
      if (context?.previousDocuments) {
        queryClient.setQueryData(documentsQueryKey(organizationId), context.previousDocuments);
      }
    },
    onSuccess: (document) => {
      // Update caches with real data
      queryClient.setQueryData(documentQueryKey(document.id), document);
      
      queryClient.setQueryData(documentsQueryKey(organizationId), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          documents: old.documents.map((doc: any) =>
            doc.id === document.id ? document : doc
          ),
        };
      });

      // Update access tracking
      const accessKey = `doc-access-${organizationId}`;
      const existing = localStorage.getItem(accessKey);
      let accessData: Record<string, any> = {};
      
      if (existing) {
        try {
          accessData = JSON.parse(existing);
        } catch (error) {
          console.warn("Failed to parse access data:", error);
        }
      }
      
      accessData[document.id] = {
        ...accessData[document.id],
        lastModified: Date.now(),
      };
      
      localStorage.setItem(accessKey, JSON.stringify(accessData));
    },
  });

  // Delete document with optimistic updates
  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      await orpcClient.documents.delete({ id: documentId });
      return { id: documentId };
    },
    onMutate: async (documentId) => {
      await queryClient.cancelQueries({ queryKey: documentsQueryKey(organizationId) });

      const previousDocuments = queryClient.getQueryData(documentsQueryKey(organizationId));
      const previousDocument = queryClient.getQueryData(documentQueryKey(documentId));

      // Optimistically remove document
      queryClient.setQueryData(documentsQueryKey(organizationId), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          documents: old.documents.filter((doc: any) => doc.id !== documentId),
          total: Math.max(0, (old.total || 0) - 1),
        };
      });

      return { previousDocuments, previousDocument, documentId };
    },
    onError: (err, documentId, context) => {
      // Revert optimistic updates
      if (context?.previousDocuments) {
        queryClient.setQueryData(documentsQueryKey(organizationId), context.previousDocuments);
      }
      if (context?.previousDocument) {
        queryClient.setQueryData(documentQueryKey(documentId), context.previousDocument);
      }
    },
    onSuccess: (result, documentId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: documentQueryKey(documentId) });
      
      // Clean up access tracking
      const accessKey = `doc-access-${organizationId}`;
      const existing = localStorage.getItem(accessKey);
      
      if (existing) {
        try {
          const accessData = JSON.parse(existing);
          delete accessData[documentId];
          localStorage.setItem(accessKey, JSON.stringify(accessData));
        } catch (error) {
          console.warn("Failed to clean up access data:", error);
        }
      }
    },
  });

  return {
    createDocument,
    updateDocument,
    deleteDocument,
  };
}

/**
 * Optimized folder mutations with cache management
 */
export function useOptimizedFolderMutations(organizationId: string) {
  const queryClient = useQueryClient();

  const createFolder = useMutation({
    mutationFn: async (data: {
      name: string;
      parentFolderId?: string;
      description?: string;
    }) => {
      const { folder } = await orpcClient.folders.create({
        ...data,
        organizationId,
      });
      return folder;
    },
    onSuccess: (folder) => {
      // Invalidate folder-related queries
      queryClient.invalidateQueries({ queryKey: foldersQueryKey(organizationId) });
      queryClient.invalidateQueries({ queryKey: folderTreeQueryKey(organizationId) });
    },
  });

  const updateFolder = useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      description?: string;
      parentFolderId?: string | null;
    }) => {
      const { folder } = await orpcClient.folders.update(data);
      return folder;
    },
    onSuccess: (folder) => {
      // Update folder in cache
      queryClient.setQueryData(foldersQueryKey(organizationId), (old: any) => {
        if (!old) return old;
        
        return old.map((f: any) => f.id === folder.id ? folder : f);
      });
      
      // Invalidate tree to rebuild hierarchy
      queryClient.invalidateQueries({ queryKey: folderTreeQueryKey(organizationId) });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      await orpcClient.folders.delete({ id: folderId });
      return { id: folderId };
    },
    onSuccess: ({ id }) => {
      // Remove folder from cache
      queryClient.setQueryData(foldersQueryKey(organizationId), (old: any) => {
        if (!old) return old;
        return old.filter((f: any) => f.id !== id);
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: folderTreeQueryKey(organizationId) });
      queryClient.invalidateQueries({ queryKey: documentsQueryKey(organizationId) });
    },
  });

  return {
    createFolder,
    updateFolder,
    deleteFolder,
  };
}

/**
 * Cache warming after mutations
 */
export function useMutationCacheWarmer(organizationId: string) {
  const queryClient = useQueryClient();

  const warmCacheAfterMutation = async () => {
    // Warm up recently accessed documents
    const accessKey = `doc-access-${organizationId}`;
    const accessData = localStorage.getItem(accessKey);
    
    if (accessData) {
      try {
        const parsed = JSON.parse(accessData);
        const recentDocs = Object.entries(parsed)
          .sort(([, a], [, b]) => (b as any).lastAccess - (a as any).lastAccess)
          .slice(0, 5)
          .map(([id]) => id);

        // Prefetch recent documents
        recentDocs.forEach(docId => {
          queryClient.prefetchQuery({
            queryKey: documentQueryKey(docId),
            queryFn: async () => {
              const { document } = await orpcClient.documents.find({ id: docId });
              return document;
            },
            staleTime: 5 * 60 * 1000, // 5 minutes
          });
        });
      } catch (error) {
        console.warn("Failed to warm cache after mutation:", error);
      }
    }
  };

  return { warmCacheAfterMutation };
}