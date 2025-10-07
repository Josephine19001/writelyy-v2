import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/*
 * Query Keys
 */
export const documentsQueryKey = (organizationId: string) =>
	["documents", organizationId] as const;
export const documentQueryKey = (id: string) => ["document", id] as const;
export const documentsByFolderQueryKey = (organizationId: string, folderId?: string | null) =>
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
			// Validate organizationId before making the request
			if (!organizationId || organizationId.trim() === '') {
				throw new Error('Organization ID is required');
			}
			// Build the request params, only including defined values
			const params: any = {
				organizationId,
				limit: options?.limit || 50,
				offset: options?.offset || 0,
			};

			// Only add optional parameters if they're defined
			if (options?.folderId !== undefined) {
				params.folderId = options.folderId;
			}
			if (options?.isTemplate !== undefined) {
				params.isTemplate = options.isTemplate;
			}
			if (options?.search !== undefined) {
				params.search = options.search;
			}
			
			// Don't pass rootOnly or folderId when we want ALL documents
			// The backend will return all documents when neither is specified

			const { documents, total, hasMore } = await orpcClient.documents.list(params);

			return { documents, total, hasMore };
		},
		enabled: options?.enabled !== false && !!organizationId && organizationId.trim() !== '',
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
	folderId?: string | null,
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: documentsByFolderQueryKey(organizationId, folderId),
		queryFn: async () => {
			const { documents } = await orpcClient.documents.list({
				organizationId,
				folderId: folderId || undefined,
				rootOnly: folderId === null, // Use rootOnly flag when folderId is null
				limit: 100, // Get all documents in folder
			});

			return documents;
		},
		enabled: options?.enabled !== false,
	});
};