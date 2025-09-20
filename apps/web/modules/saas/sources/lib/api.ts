import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/*
 * Query Keys
 */
export const sourcesQueryKey = (organizationId: string) =>
	["sources", organizationId] as const;
export const sourceQueryKey = (id: string) => ["source", id] as const;
export const sourcesByTypeQueryKey = (organizationId: string, type?: string) =>
	["sources", organizationId, "type", type] as const;

/*
 * List Sources
 */
export const useSourcesQuery = (
	organizationId: string,
	options?: {
		type?: "pdf" | "doc" | "docx" | "image" | "url";
		processingStatus?: "pending" | "processing" | "completed" | "failed";
		search?: string;
		limit?: number;
		offset?: number;
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: sourcesQueryKey(organizationId),
		queryFn: async () => {
			const { sources, total, hasMore } = await orpcClient.sources.list({
				organizationId,
				type: options?.type,
				processingStatus: options?.processingStatus,
				search: options?.search,
				limit: options?.limit || 50,
				offset: options?.offset || 0,
			});

			return { sources, total, hasMore };
		},
		enabled: options?.enabled !== false,
	});
};

/*
 * Get Single Source
 */
export const useSourceQuery = (
	id: string,
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: sourceQueryKey(id),
		queryFn: async () => {
			const { source } = await orpcClient.sources.find({ id });
			return source;
		},
		enabled: options?.enabled !== false && !!id,
	});
};

/*
 * Sources by Type (for categorized views)
 */
export const useSourcesByTypeQuery = (
	organizationId: string,
	type: "pdf" | "doc" | "docx" | "image" | "url",
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: sourcesByTypeQueryKey(organizationId, type),
		queryFn: async () => {
			const { sources } = await orpcClient.sources.list({
				organizationId,
				type,
				limit: 100, // Get all of this type
			});

			return sources;
		},
		enabled: options?.enabled !== false,
	});
};

/*
 * Create Source
 */
export const createSourceMutationKey = ["create-source"] as const;
export const useCreateSourceMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createSourceMutationKey,
		mutationFn: async ({
			name,
			organizationId,
			type,
			url,
			filePath,
			originalFileName,
			metadata,
		}: {
			name: string;
			organizationId: string;
			type: "pdf" | "doc" | "docx" | "image" | "url";
			url?: string;
			filePath?: string;
			originalFileName?: string;
			metadata?: Record<string, any>;
		}) => {
			const { source } = await orpcClient.sources.create({
				name,
				organizationId,
				type,
				url,
				filePath,
				originalFileName,
				metadata,
			});

			return source;
		},
		onSuccess: (source) => {
			// Invalidate sources list
			queryClient.invalidateQueries({
				queryKey: sourcesQueryKey(source.organizationId),
			});
			
			// Set source cache
			queryClient.setQueryData(sourceQueryKey(source.id), source);
		},
	});
};

/*
 * Delete Source
 */
export const deleteSourceMutationKey = ["delete-source"] as const;
export const useDeleteSourceMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteSourceMutationKey,
		mutationFn: async ({ id }: { id: string }) => {
			await orpcClient.sources.delete({ id });
			return { id };
		},
		onSuccess: ({ id }) => {
			// Remove source from cache
			queryClient.removeQueries({ queryKey: sourceQueryKey(id) });
			
			// Invalidate all sources lists
			queryClient.invalidateQueries({
				queryKey: ["sources"],
			});
		},
	});
};

/*
 * Link Source to Document
 */
export const linkSourceToDocumentMutationKey = ["link-source-to-document"] as const;
export const useLinkSourceToDocumentMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: linkSourceToDocumentMutationKey,
		mutationFn: async ({
			sourceId,
			documentId,
			context,
			usage,
		}: {
			sourceId: string;
			documentId: string;
			context?: "reference" | "quote" | "inspiration" | "fact-check";
			usage?: Record<string, any>;
		}) => {
			const { documentSource } = await orpcClient.sources.linkToDocument({
				sourceId,
				documentId,
				context,
				usage,
			});

			return documentSource;
		},
		onSuccess: (documentSource) => {
			// Invalidate source queries to refresh linked documents
			queryClient.invalidateQueries({
				queryKey: sourceQueryKey(documentSource.sourceId),
			});
			
			// Invalidate document queries to refresh linked sources
			queryClient.invalidateQueries({
				queryKey: ["document", documentSource.documentId],
			});
		},
	});
};

/*
 * Helper: Group sources by type
 */
export const groupSourcesByType = (sources: any[]) => {
	return sources.reduce((groups, source) => {
		const type = source.type;
		if (!groups[type]) {
			groups[type] = [];
		}
		groups[type].push(source);
		return groups;
	}, {} as Record<string, any[]>);
};

/*
 * Hook to get sources grouped by type
 */
export const useSourcesGroupedByTypeQuery = (
	organizationId: string,
	options?: {
		enabled?: boolean;
	}
) => {
	const { data, ...rest } = useSourcesQuery(organizationId, {
		limit: 100, // Get all sources for grouping
		...options,
	});
	
	const groupedSources = data?.sources ? groupSourcesByType(data.sources) : {};
	
	return {
		data: groupedSources,
		sources: data?.sources || [],
		...rest,
	};
};