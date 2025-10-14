"use client";

import { orpcClient } from "@shared/lib/orpc-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

interface WorkspaceData {
	documents: any[];
	folders: any[];
	sources: any[];
	totalDocuments: number;
	totalSources: number;
}

interface CacheState {
	isInitializing: boolean;
	isReady: boolean;
	data: WorkspaceData | null;
	error: Error | null;
	lastUpdated: Date | null;
}

/**
 * Aggressive workspace cache that loads ALL data in a single request
 * Eliminates cascading loading states by fetching everything upfront
 */
export function useAggressiveWorkspaceCache(organizationId: string | null) {
	const queryClient = useQueryClient();
	const [cacheState, setCacheState] = useState<CacheState>({
		isInitializing: false,
		isReady: false,
		data: null,
		error: null,
		lastUpdated: null,
	});

	// Single query that fetches ALL workspace data at once
	const workspaceDataQuery = useQuery({
		queryKey: ["workspaceData", organizationId],
		queryFn: async (): Promise<WorkspaceData> => {
			if (!organizationId) throw new Error("No organization ID");

			const startTime = performance.now();

			// Fetch all data in parallel
			const [documentsResult, foldersResult, sourcesResult] =
				await Promise.all([
					orpcClient.documents.list({
						organizationId,
						limit: 1000, // Get everything
						offset: 0,
					}),
					orpcClient.folders.list({
						organizationId,
						includeDocuments: false,
					}),
					orpcClient.sources.list({
						organizationId,
						limit: 1000,
						offset: 0,
					}),
				]);

			const endTime = performance.now();

			const workspaceData: WorkspaceData = {
				documents: documentsResult.documents,
				folders: foldersResult.folders,
				sources: sourcesResult.sources,
				totalDocuments: documentsResult.total,
				totalSources: sourcesResult.total,
			};

			return workspaceData;
		},
		enabled: !!organizationId,
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
		refetchOnWindowFocus: false,
		retry: 3,
	});

	// Update local cache state
	useEffect(() => {
		setCacheState({
			isInitializing:
				workspaceDataQuery.isLoading && !workspaceDataQuery.data,
			isReady: !!workspaceDataQuery.data && !workspaceDataQuery.isLoading,
			data: workspaceDataQuery.data || null,
			error: (workspaceDataQuery.error as Error) || null,
			lastUpdated: workspaceDataQuery.dataUpdatedAt
				? new Date(workspaceDataQuery.dataUpdatedAt)
				: null,
		});
	}, [
		workspaceDataQuery.data,
		workspaceDataQuery.isLoading,
		workspaceDataQuery.error,
		workspaceDataQuery.dataUpdatedAt,
	]);

	// Immediately populate individual query caches when data arrives
	useEffect(() => {
		if (!workspaceDataQuery.data || !organizationId) return;

		const { documents, folders, sources } = workspaceDataQuery.data;

		// Populate documents cache
		queryClient.setQueryData(["documents", organizationId], {
			documents,
			total: documents.length,
			hasMore: false,
		});

		// Populate folders cache
		queryClient.setQueryData(["folders", organizationId], folders);

		// Populate sources cache
		queryClient.setQueryData(["sources", organizationId], {
			sources,
			total: sources.length,
			hasMore: false,
		});
	}, [workspaceDataQuery.data, organizationId, queryClient]);

	// Aggressive document prefetching based on recent access
	useEffect(() => {
		if (!cacheState.isReady || !organizationId || !cacheState.data) return;

		const prefetchTopDocuments = async () => {
			// Get access patterns
			const accessKey = `doc-access-${organizationId}`;
			const accessData = localStorage.getItem(accessKey);

			let documentsToPreload: string[] = [];

			if (accessData) {
				try {
					const parsed = JSON.parse(accessData);
					// Get top 10 most accessed documents
					documentsToPreload = Object.entries(parsed)
						.sort(
							([, a], [, b]) =>
								(b as any).count - (a as any).count,
						)
						.slice(0, 10)
						.map(([id]) => id);
				} catch (error) {
					console.warn("Failed to parse access data:", error);
				}
			}

			// If no access data, preload recent documents
			if (documentsToPreload.length === 0) {
				const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
				documentsToPreload = (cacheState.data?.documents || [])
					.filter((doc) => new Date(doc.updatedAt) > weekAgo)
					.sort(
						(a, b) =>
							new Date(b.updatedAt).getTime() -
							new Date(a.updatedAt).getTime(),
					)
					.slice(0, 5)
					.map((doc) => doc.id);
			}

			// Prefetch documents in batches
			const batchSize = 3;
			for (let i = 0; i < documentsToPreload.length; i += batchSize) {
				const batch = documentsToPreload.slice(i, i + batchSize);
				await Promise.allSettled(
					batch.map((docId) =>
						queryClient.prefetchQuery({
							queryKey: ["document", docId],
							queryFn: async () => {
								const { document } =
									await orpcClient.documents.find({
										id: docId,
									});
								return document;
							},
							staleTime: 15 * 60 * 1000, // 15 minutes
						}),
					),
				);

				// Small delay between batches to avoid overwhelming the server
				if (i + batchSize < documentsToPreload.length) {
					await new Promise((resolve) => setTimeout(resolve, 100));
				}
			}
		};

		// Start prefetching after a short delay
		const timer = setTimeout(prefetchTopDocuments, 500);
		return () => clearTimeout(timer);
	}, [cacheState.isReady, organizationId, cacheState.data, queryClient]);

	// Fast document lookup (no loading state)
	const getDocument = useCallback(
		(documentId: string) => {
			return queryClient.getQueryData(["document", documentId]);
		},
		[queryClient],
	);

	// Instant document access with fallback prefetch
	const accessDocument = useCallback(
		async (documentId: string) => {
			// Track access immediately
			if (organizationId) {
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

				accessData[documentId] = {
					count: (accessData[documentId]?.count || 0) + 1,
					lastAccess: Date.now(),
				};

				localStorage.setItem(accessKey, JSON.stringify(accessData));
			}

			// Check if document is already cached
			const cachedDoc = getDocument(documentId);
			if (cachedDoc) {
				return cachedDoc;
			}

			// If not cached, fetch it immediately
			try {
				await queryClient.prefetchQuery({
					queryKey: ["document", documentId],
					queryFn: async () => {
						const { document } = await orpcClient.documents.find({
							id: documentId,
						});
						return document;
					},
					staleTime: 15 * 60 * 1000,
				});
				return getDocument(documentId);
			} catch (error) {
				console.error("Failed to fetch document:", error);
				return null;
			}
		},
		[organizationId, getDocument, queryClient],
	);

	// Update document in cache
	const updateDocument = useCallback(
		(documentId: string, updates: Partial<any>) => {
			if (!organizationId) return;

			// Update individual document cache
			queryClient.setQueryData(
				["document", documentId],
				(oldDoc: any) => ({
					...oldDoc,
					...updates,
					updatedAt: new Date().toISOString(),
				}),
			);

			// Update in documents list
			queryClient.setQueryData(
				["documents", organizationId],
				(oldData: any) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						documents: oldData.documents.map((doc: any) =>
							doc.id === documentId
								? {
										...doc,
										...updates,
										updatedAt: new Date().toISOString(),
									}
								: doc,
						),
					};
				},
			);

			// Update workspace data cache
			queryClient.setQueryData(
				["workspaceData", organizationId],
				(oldData: WorkspaceData | undefined) => {
					if (!oldData) return oldData;

					return {
						...oldData,
						documents: oldData.documents.map((doc: any) =>
							doc.id === documentId
								? {
										...doc,
										...updates,
										updatedAt: new Date().toISOString(),
									}
								: doc,
						),
					};
				},
			);
		},
		[organizationId, queryClient],
	);

	// Force refresh all data
	const refreshWorkspace = useCallback(async () => {
		if (!organizationId) return;

		await workspaceDataQuery.refetch();
	}, [organizationId, workspaceDataQuery]);

	// Get cached snapshot (no loading)
	const getSnapshot = useCallback(() => {
		if (!cacheState.data) {
			return {
				documents: [],
				folders: [],
				sources: [],
				isCached: false,
			};
		}

		return {
			documents: cacheState.data.documents,
			folders: cacheState.data.folders,
			sources: cacheState.data.sources,
			isCached: true,
		};
	}, [cacheState.data]);

	return {
		// Loading states
		isInitializing: cacheState.isInitializing,
		isReady: cacheState.isReady,
		hasError: !!cacheState.error,
		error: cacheState.error,

		// Data access (always instant after initial load)
		documents: cacheState.data?.documents || [],
		folders: cacheState.data?.folders || [],
		sources: cacheState.data?.sources || [],

		// Stats
		totalDocuments: cacheState.data?.totalDocuments || 0,
		totalSources: cacheState.data?.totalSources || 0,
		lastUpdated: cacheState.lastUpdated,

		// Document operations
		getDocument,
		accessDocument,
		updateDocument,

		// Cache management
		refreshWorkspace,
		getSnapshot,

		// Performance metrics
		cacheStats: {
			documentsCount: cacheState.data?.documents.length || 0,
			foldersCount: cacheState.data?.folders.length || 0,
			sourcesCount: cacheState.data?.sources.length || 0,
			isReady: cacheState.isReady,
			lastUpdated: cacheState.lastUpdated,
		},
	};
}
