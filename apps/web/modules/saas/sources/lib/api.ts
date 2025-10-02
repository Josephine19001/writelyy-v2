import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/*
 * Cache management helpers
 */
const cleanupOldSourcesCache = () => {
	try {
		const keys = Object.keys(localStorage);
		const maxAge = 24 * 60 * 60 * 1000; // 24 hours
		const now = Date.now();
		
		keys.forEach(key => {
			if (key.startsWith('sources-cache-')) {
				try {
					const cached = localStorage.getItem(key);
					if (cached) {
						const parsed = JSON.parse(cached);
						if (now - parsed.timestamp > maxAge) {
							localStorage.removeItem(key);
						}
					}
				} catch (error) {
					// Remove corrupted cache entries
					localStorage.removeItem(key);
				}
			}
		});
	} catch (error) {
		console.warn("Failed to cleanup old sources cache:", error);
	}
};

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
				search: options?.search,
				limit: options?.limit || 50,
				offset: options?.offset || 0,
			});

			// Cache sources to localStorage for better persistence across reloads
			try {
				const cacheKey = `sources-cache-${organizationId}`;
				const cacheData = {
					sources,
					total,
					hasMore,
					timestamp: Date.now(),
					organizationId
				};
				localStorage.setItem(cacheKey, JSON.stringify(cacheData));
			} catch (error) {
				console.warn("Failed to cache sources to localStorage:", error);
			}

			return { sources, total, hasMore };
		},
		enabled: options?.enabled !== false,
		// Sources don't change often, so we can cache them for longer
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes (increased for better persistence)
		// Add initial data from localStorage if available
		initialData: () => {
			// Clean up old cache entries periodically
			if (Math.random() < 0.1) { // 10% chance to run cleanup
				cleanupOldSourcesCache();
			}
			
			try {
				const cacheKey = `sources-cache-${organizationId}`;
				const cached = localStorage.getItem(cacheKey);
				if (cached) {
					const parsed = JSON.parse(cached);
					// Use cached data if it's less than 10 minutes old
					const maxAge = 10 * 60 * 1000; // 10 minutes
					if (Date.now() - parsed.timestamp < maxAge && parsed.organizationId === organizationId) {
						return { sources: parsed.sources, total: parsed.total, hasMore: parsed.hasMore };
					}
				}
			} catch (error) {
				console.warn("Failed to restore sources from localStorage:", error);
			}
			return undefined;
		},
		// Mark initial data as stale so it still refetches in background
		initialDataUpdatedAt: () => {
			try {
				const cacheKey = `sources-cache-${organizationId}`;
				const cached = localStorage.getItem(cacheKey);
				if (cached) {
					const parsed = JSON.parse(cached);
					return parsed.timestamp;
				}
			} catch (error) {
				console.warn("Failed to get cache timestamp:", error);
			}
			return 0;
		},
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
		// Individual sources change rarely
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
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
		// Sources by type for categorized views - cache longer
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 15 * 60 * 1000, // 15 minutes
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
			// Invalidate localStorage cache
			try {
				localStorage.removeItem(`sources-cache-${source.organizationId}`);
			} catch (error) {
				console.warn("Failed to invalidate sources cache:", error);
			}
			
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
 * Update Source
 */
export const updateSourceMutationKey = ["update-source"] as const;
export const useUpdateSourceMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateSourceMutationKey,
		mutationFn: async ({ id, name, metadata }: { id: string; name?: string; metadata?: Record<string, any> }) => {
			const { source } = await orpcClient.sources.update({ id, name, metadata });
			return source;
		},
		onSuccess: (source) => {
			// Invalidate localStorage cache
			try {
				localStorage.removeItem(`sources-cache-${source.organizationId}`);
			} catch (error) {
				console.warn("Failed to invalidate sources cache:", error);
			}
			
			// Update source cache
			queryClient.setQueryData(sourceQueryKey(source.id), source);
			
			// Invalidate sources list
			queryClient.invalidateQueries({
				queryKey: sourcesQueryKey(source.organizationId),
			});
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
			// Invalidate localStorage cache for all organizations (since we don't have org ID)
			try {
				const keys = Object.keys(localStorage);
				keys.forEach(key => {
					if (key.startsWith('sources-cache-')) {
						localStorage.removeItem(key);
					}
				});
			} catch (error) {
				console.warn("Failed to invalidate sources cache:", error);
			}
			
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