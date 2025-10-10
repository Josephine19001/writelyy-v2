import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/*
 * Query Keys
 */
export const snippetsQueryKey = (organizationId: string) =>
	["snippets", organizationId] as const;
export const snippetQueryKey = (id: string) => ["snippet", id] as const;
export const snippetsByCategoryQueryKey = (organizationId: string, category?: string) =>
	["snippets", organizationId, "category", category] as const;

/*
 * List Snippets
 */
export const useSnippetsQuery = (
	organizationId: string,
	options?: {
		category?: string;
		search?: string;
		tags?: string[];
		limit?: number;
		offset?: number;
		isPublic?: boolean;
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: snippetsQueryKey(organizationId),
		queryFn: async () => {
			const { snippets, total, hasMore } = await orpcClient.snippets.list({
				organizationId,
				category: options?.category,
				search: options?.search,
				tags: options?.tags,
				limit: options?.limit || 50,
				offset: options?.offset || 0,
				isPublic: options?.isPublic,
			});

			return { snippets, total, hasMore };
		},
		enabled: options?.enabled !== false,
		// Snippets change less frequently than documents
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});
};

/*
 * Get Single Snippet
 */
export const useSnippetQuery = (
	id: string,
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: snippetQueryKey(id),
		queryFn: async () => {
			const { snippet } = await orpcClient.snippets.find({ id });
			return snippet;
		},
		enabled: options?.enabled !== false && !!id,
		// Individual snippets change rarely
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});
};

/*
 * Snippets by Category (for categorized views)
 */
export const useSnippetsByCategoryQuery = (
	organizationId: string,
	category: string,
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: snippetsByCategoryQueryKey(organizationId, category),
		queryFn: async () => {
			const { snippets } = await orpcClient.snippets.list({
				organizationId,
				category,
				limit: 100, // Get all of this category
			});

			return snippets;
		},
		enabled: options?.enabled !== false,
		// Snippets by category for categorized views - cache longer
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 15 * 60 * 1000, // 15 minutes
	});
};

/*
 * Create Snippet
 */
export const createSnippetMutationKey = ["create-snippet"] as const;
export const useCreateSnippetMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createSnippetMutationKey,
		mutationFn: async ({
			title,
			content,
			organizationId,
			category,
			tags,
			metadata,
			aiContext,
			isPublic,
		}: {
			title: string;
			content: string;
			organizationId: string;
			category?: string;
			tags?: string[];
			metadata?: Record<string, any>;
			aiContext?: string;
			isPublic?: boolean;
		}) => {
			const { snippet } = await orpcClient.snippets.create({
				title,
				content,
				organizationId,
				category,
				tags,
				metadata,
				aiContext,
				isPublic,
			});

			return snippet;
		},
		onSuccess: (snippet) => {
			// Invalidate snippets list
			queryClient.invalidateQueries({
				queryKey: snippetsQueryKey(snippet.organizationId),
			});
			
			// Set snippet cache
			queryClient.setQueryData(snippetQueryKey(snippet.id), snippet);
		},
	});
};

/*
 * Update Snippet
 */
export const updateSnippetMutationKey = ["update-snippet"] as const;
export const useUpdateSnippetMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateSnippetMutationKey,
		mutationFn: async ({ 
			id, 
			title,
			content,
			category,
			tags,
			metadata,
			aiContext,
			isPublic,
		}: { 
			id: string; 
			title?: string;
			content?: string;
			category?: string;
			tags?: string[];
			metadata?: Record<string, any>;
			aiContext?: string;
			isPublic?: boolean;
		}) => {
			const { snippet } = await orpcClient.snippets.update({ 
				id, 
				title,
				content,
				category,
				tags,
				metadata,
				aiContext,
				isPublic,
			});
			return snippet;
		},
		onSuccess: (snippet) => {
			// Update snippet cache
			queryClient.setQueryData(snippetQueryKey(snippet.id), snippet);
			
			// Invalidate snippets list
			queryClient.invalidateQueries({
				queryKey: snippetsQueryKey(snippet.organizationId),
			});
		},
	});
};

/*
 * Delete Snippet
 */
export const deleteSnippetMutationKey = ["delete-snippet"] as const;
export const useDeleteSnippetMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteSnippetMutationKey,
		mutationFn: async ({ id }: { id: string }) => {
			await orpcClient.snippets.delete({ id });
			return { id };
		},
		onSuccess: ({ id }) => {
			// Remove snippet from cache
			queryClient.removeQueries({ queryKey: snippetQueryKey(id) });
			
			// Invalidate all snippets lists
			queryClient.invalidateQueries({
				queryKey: ["snippets"],
			});
		},
	});
};

/*
 * Link Snippet to Document
 */
export const linkSnippetToDocumentMutationKey = ["link-snippet-to-document"] as const;
export const useLinkSnippetToDocumentMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: linkSnippetToDocumentMutationKey,
		mutationFn: async ({
			snippetId,
			documentId,
			context,
			usage,
		}: {
			snippetId: string;
			documentId: string;
			context?: "inserted" | "referenced" | "ai-context";
			usage?: Record<string, any>;
		}) => {
			const { documentSnippet } = await orpcClient.snippets.linkToDocument({
				snippetId,
				documentId,
				context,
				usage,
			});

			return documentSnippet;
		},
		onSuccess: (documentSnippet) => {
			// Invalidate snippet queries to refresh linked documents
			queryClient.invalidateQueries({
				queryKey: snippetQueryKey(documentSnippet.snippetId),
			});
			
			// Invalidate document queries to refresh linked snippets
			queryClient.invalidateQueries({
				queryKey: ["document", documentSnippet.documentId],
			});
		},
	});
};

/*
 * Helper: Group snippets by category
 */
export const groupSnippetsByCategory = (snippets: any[]) => {
	return snippets.reduce((groups, snippet) => {
		const category = snippet.category || "Uncategorized";
		if (!groups[category]) {
			groups[category] = [];
		}
		groups[category].push(snippet);
		return groups;
	}, {} as Record<string, any[]>);
};

/*
 * Hook to get snippets grouped by category
 */
export const useSnippetsGroupedByCategoryQuery = (
	organizationId: string,
	options?: {
		enabled?: boolean;
	}
) => {
	const { data, ...rest } = useSnippetsQuery(organizationId, {
		limit: 100, // Get all snippets for grouping
		...options,
	});
	
	const groupedSnippets = data?.snippets ? groupSnippetsByCategory(data.snippets) : {};
	
	return {
		data: groupedSnippets,
		snippets: data?.snippets || [],
		...rest,
	};
};