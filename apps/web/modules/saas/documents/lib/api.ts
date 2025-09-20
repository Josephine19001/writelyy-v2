import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/*
 * Query Keys
 */
export const documentsQueryKey = (organizationId: string) =>
	["documents", organizationId] as const;
export const documentQueryKey = (id: string) => ["document", id] as const;
export const documentsByFolderQueryKey = (organizationId: string, folderId?: string) =>
	["documents", organizationId, "folder", folderId] as const;

/*
 * List Documents
 */
export const useDocumentsQuery = (
	organizationId: string,
	options?: {
		folderId?: string;
		isTemplate?: boolean;
		search?: string;
		limit?: number;
		offset?: number;
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: documentsQueryKey(organizationId),
		queryFn: async () => {
			const { documents, total, hasMore } = await orpcClient.documents.list({
				organizationId,
				folderId: options?.folderId,
				isTemplate: options?.isTemplate,
				search: options?.search,
				limit: options?.limit || 50,
				offset: options?.offset || 0,
			});

			return { documents, total, hasMore };
		},
		enabled: options?.enabled !== false,
	});
};

/*
 * Get Single Document
 */
export const useDocumentQuery = (
	id: string,
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: documentQueryKey(id),
		queryFn: async () => {
			const { document } = await orpcClient.documents.find({ id });
			return document;
		},
		enabled: options?.enabled !== false && !!id,
	});
};

/*
 * Create Document
 */
export const createDocumentMutationKey = ["create-document"] as const;
export const useCreateDocumentMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createDocumentMutationKey,
		mutationFn: async ({
			title,
			organizationId,
			folderId,
			content,
			description,
			isTemplate,
		}: {
			title: string;
			organizationId: string;
			folderId?: string;
			content?: any;
			description?: string;
			isTemplate?: boolean;
		}) => {
			const { document } = await orpcClient.documents.create({
				title,
				organizationId,
				folderId,
				content,
				description,
				isTemplate: isTemplate || false,
			});

			return document;
		},
		onSuccess: (document) => {
			// Invalidate documents list
			queryClient.invalidateQueries({
				queryKey: documentsQueryKey(document.organizationId),
			});
			
			// Set document cache
			queryClient.setQueryData(documentQueryKey(document.id), document);
		},
	});
};

/*
 * Update Document
 */
export const updateDocumentMutationKey = ["update-document"] as const;
export const useUpdateDocumentMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateDocumentMutationKey,
		mutationFn: async ({
			id,
			title,
			content,
			description,
			tags,
			folderId,
			createVersion,
		}: {
			id: string;
			title?: string;
			content?: any;
			description?: string;
			tags?: string[];
			folderId?: string | null;
			createVersion?: boolean;
		}) => {
			const { document } = await orpcClient.documents.update({
				id,
				title,
				content,
				description,
				tags,
				folderId,
				createVersion: createVersion || false,
			});

			return document;
		},
		onSuccess: (document) => {
			// Update document cache
			queryClient.setQueryData(documentQueryKey(document.id), document);
			
			// Invalidate documents list
			queryClient.invalidateQueries({
				queryKey: documentsQueryKey(document.organizationId),
			});
		},
	});
};

/*
 * Delete Document
 */
export const deleteDocumentMutationKey = ["delete-document"] as const;
export const useDeleteDocumentMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteDocumentMutationKey,
		mutationFn: async ({ id }: { id: string }) => {
			await orpcClient.documents.delete({ id });
			return { id };
		},
		onSuccess: ({ id }) => {
			// Remove document from cache
			queryClient.removeQueries({ queryKey: documentQueryKey(id) });
			
			// Invalidate all documents lists
			queryClient.invalidateQueries({
				queryKey: ["documents"],
			});
		},
	});
};

/*
 * Documents by Folder (for folder tree view)
 */
export const useDocumentsByFolderQuery = (
	organizationId: string,
	folderId?: string,
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: documentsByFolderQueryKey(organizationId, folderId),
		queryFn: async () => {
			const { documents } = await orpcClient.documents.list({
				organizationId,
				folderId,
				limit: 100, // Get all documents in folder
			});

			return documents;
		},
		enabled: options?.enabled !== false,
	});
};