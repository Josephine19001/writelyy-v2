/**
 * Centralized exports for all workspace API queries
 * This file provides easy access to all React Query hooks for the workspace features
 */

// Document API exports
export {
  // Mutations
  createDocumentMutationKey,
  deleteDocumentMutationKey,
  updateDocumentMutationKey,
  useCreateDocumentMutation,
  useDeleteDocumentMutation,
  useUpdateDocumentMutation,
  
  // Queries
  useDocumentQuery,
  useDocumentsByFolderQuery,
  useDocumentsQuery,
  
  // Query keys
  documentQueryKey,
  documentsByFolderQueryKey,
  documentsQueryKey,
} from "../documents/lib/api";

// Folder API exports
export {
  // Helpers
  buildFolderTree,
  
  // Mutations
  createFolderMutationKey,
  deleteFolderMutationKey,
  updateFolderMutationKey,
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useUpdateFolderMutation,
  
  // Queries
  useAllFoldersQuery,
  useFolderTreeQuery,
  useFoldersQuery,
  
  // Query keys
  folderQueryKey,
  foldersQueryKey,
  folderTreeQueryKey,
} from "../folders/lib/api";

// Source API exports
export {
  // Helpers
  groupSourcesByType,
  
  // Mutations
  createSourceMutationKey,
  deleteSourceMutationKey,
  linkSourceToDocumentMutationKey,
  updateSourceMutationKey,
  useCreateSourceMutation,
  useDeleteSourceMutation,
  useLinkSourceToDocumentMutation,
  useUpdateSourceMutation,
  updateProcessingStatusMutationKey,
  useUpdateProcessingStatusMutation,
  fixPendingSourcesMutationKey,
  useFixPendingSourcesMutation,
  
  // Queries
  useSourceQuery,
  useSourcesByTypeQuery,
  useSourcesGroupedByTypeQuery,
  useSourcesQuery,
  
  // Query keys
  sourceQueryKey,
  sourcesByTypeQueryKey,
  sourcesQueryKey,
} from "../sources/lib/api";

// Snippet API exports
export {
  // Helpers
  groupSnippetsByCategory,
  
  // Mutations
  createSnippetMutationKey,
  deleteSnippetMutationKey,
  linkSnippetToDocumentMutationKey,
  updateSnippetMutationKey,
  useCreateSnippetMutation,
  useDeleteSnippetMutation,
  useLinkSnippetToDocumentMutation,
  useUpdateSnippetMutation,
  
  // Queries
  useSnippetQuery,
  useSnippetsByCategoryQuery,
  useSnippetsGroupedByCategoryQuery,
  useSnippetsQuery,
  
  // Query keys
  snippetQueryKey,
  snippetsByCategoryQueryKey,
  snippetsQueryKey,
} from "../snippets/lib/api";

// Workspace AI Context exports
export {
  // Mutations
  sendAiMessageWithContextMutationKey,
  useSendAiMessageWithContextMutation,
  
  // Queries
  useDocumentAiContextQuery,
  useWorkspaceAiContextQuery,
  
  // Query keys
  documentContextQueryKey,
  workspaceAiContextQueryKey,
  
  // Tiptap AI Tools
  buildWorkspaceAiTools,
  buildWorkspaceContextPrompt,
  createDocumentReferenceTool,
  createGetSourceContentTool,
  createSearchDocumentsTool,
} from "../ai/lib/workspace-context";

// Workspace API exports (existing)
export {
  // Mutations
  createWorkspaceMutationKey,
  updateWorkspaceMutationKey,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  
  // Queries
  useActiveWorkspaceQuery,
  useFullWorkspaceQuery,
  useWorkspaceListQuery,
  
  // Query keys
  activeWorkspaceQueryKey,
  fullWorkspaceQueryKey,
  workspaceListQueryKey,
} from "../workspaces/lib/api";

/**
 * Convenience exports for common patterns
 */

// Type definitions for common use cases
export type DocumentWithContext = {
  document: any;
  relatedDocuments: any[];
  linkedSources: any[];
  folderContext?: any;
};

export type WorkspaceContext = {
  documents: any[];
  folders: any[];
  sources: any[];
  totalDocuments: number;
  totalSources: number;
};

export type FolderTree = {
  id: string;
  name: string;
  subFolders: FolderTree[];
  documents: any[];
  parentFolderId?: string;
};

/**
 * Helper hooks for common patterns
 * 
 * Note: Import the individual hooks from their respective modules to use these helpers:
 * 
 * Example:
 * import { useDocumentsQuery, useFoldersQuery, useSourcesQuery } from "@saas/lib/api";
 * 
 * const useWorkspaceOverview = (organizationId: string) => {
 *   const documentsQuery = useDocumentsQuery(organizationId, { limit: 10 });
 *   const foldersQuery = useFoldersQuery(organizationId);
 *   const sourcesQuery = useSourcesQuery(organizationId, { limit: 10 });
 *   
 *   return {
 *     documents: documentsQuery.data?.documents || [],
 *     folders: foldersQuery.data || [],
 *     sources: sourcesQuery.data?.sources || [],
 *     isLoading: documentsQuery.isLoading || foldersQuery.isLoading || sourcesQuery.isLoading,
 *     error: documentsQuery.error || foldersQuery.error || sourcesQuery.error,
 *   };
 * };
 */