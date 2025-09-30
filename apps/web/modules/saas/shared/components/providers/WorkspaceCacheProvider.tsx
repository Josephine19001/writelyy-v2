"use client";

import { useWorkspaceCache } from "@saas/shared/hooks/use-workspace-cache";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect } from "react";

type WorkspaceCacheContextValue = {
	// Data
	documents: any[];
	folders: any[];
	sources: any[];

	// Loading states
	isLoading: boolean;
	isDocumentsLoading: boolean;
	isFoldersLoading: boolean;
	isSourcesLoading: boolean;

	// Error states
	hasError: any;
	documentsError: any;
	foldersError: any;
	sourcesError: any;

	// Cache management
	invalidateWorkspaceCache: () => void;
	updateDocumentCache: (document: any, options?: { updateListCache?: boolean }) => void;
	updateFolderCache: (folder: any) => void;
	prefetchDocument: (documentId: string) => Promise<void>;
	trackDocumentAccess: (documentId: string) => void;

	// Refetch functions
	refetchDocuments: () => void;
	refetchFolders: () => void;
	refetchSources: () => void;

	// Cache stats
	cacheStats: {
		documentsCount: number;
		foldersCount: number;
		sourcesCount: number;
		lastUpdated: Date | null;
	};
};

const WorkspaceCacheContext = createContext<WorkspaceCacheContextValue | null>(
	null,
);

export function useWorkspaceCacheContext() {
	const context = useContext(WorkspaceCacheContext);
	if (!context) {
		throw new Error(
			"useWorkspaceCacheContext must be used within a WorkspaceCacheProvider",
		);
	}
	return context;
}

interface WorkspaceCacheProviderProps {
	children: React.ReactNode;
}

export function WorkspaceCacheProvider({
	children,
}: WorkspaceCacheProviderProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const queryClient = useQueryClient();

	const cacheHook = useWorkspaceCache(activeWorkspace?.id || null);

	// Track cache statistics
	const cacheStats = React.useMemo(
		() => ({
			documentsCount: cacheHook.documents.length,
			foldersCount: cacheHook.folders.length,
			sourcesCount: cacheHook.sources.length,
			lastUpdated: new Date(),
		}),
		[
			cacheHook.documents.length,
			cacheHook.folders.length,
			cacheHook.sources.length,
		],
	);

	// Aggressive prefetching strategy
	useEffect(() => {
		if (!activeWorkspace?.id || cacheHook.isLoading) {
			return;
		}

		// Prefetch folder tree structure using the existing query
		queryClient.prefetchQuery({
			queryKey: ["folders", activeWorkspace.id, "tree"],
			queryFn: async () => {
				const { orpcClient } = await import("@shared/lib/orpc-client");
				const { folders } = await orpcClient.folders.list({
					organizationId: activeWorkspace.id,
					includeDocuments: false,
				});
				return folders;
			},
			staleTime: 10 * 60 * 1000, // 10 minutes
		});

		// Prefetch workspace AI chats if available
		queryClient.prefetchQuery({
			queryKey: ["workspaceAiChats", activeWorkspace.id],
			queryFn: async () => {
				const { orpcClient } = await import("@shared/lib/orpc-client");
				try {
					const { chats } = await orpcClient.ai.chats.list({
						organizationId: activeWorkspace.id,
					});
					return chats;
				} catch {
					// AI chats might not be available, that's okay
					return [];
				}
			},
			staleTime: 5 * 60 * 1000, // 5 minutes
		});
	}, [activeWorkspace?.id, cacheHook.isLoading, queryClient]);

	// Preload recent documents when documents list becomes available
	useEffect(() => {
		if (!activeWorkspace?.id || !cacheHook.documents.length) {
			return;
		}

		// Get recently modified documents (last 7 days)
		const recentDocuments = cacheHook.documents
			.filter((doc) => {
				const updatedAt = new Date(doc.updatedAt);
				const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
				return updatedAt > weekAgo;
			})
			.slice(0, 5); // Limit to 5 most recent

		// Prefetch these documents
		recentDocuments.forEach((doc) => {
			cacheHook.prefetchDocument(doc.id);
		});
	}, [activeWorkspace?.id, cacheHook.documents, cacheHook.prefetchDocument]);

	// Enhanced document access tracking with analytics
	const enhancedTrackDocumentAccess = React.useCallback(
		(documentId: string) => {
			cacheHook.trackDocumentAccess(documentId);

			// Track access patterns for better prefetching
			const accessKey = `doc-access-${activeWorkspace?.id}`;
			const now = Date.now();
			const existing = localStorage.getItem(accessKey);

			let accessData: Record<
				string,
				{ count: number; lastAccess: number }
			> = {};
			if (existing) {
				try {
					accessData = JSON.parse(existing);
				} catch (error) {
					console.warn("Failed to parse access data:", error);
				}
			}

			accessData[documentId] = {
				count: (accessData[documentId]?.count || 0) + 1,
				lastAccess: now,
			};

			// Clean up old access data (older than 30 days)
			const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
			Object.keys(accessData).forEach((id) => {
				if (accessData[id].lastAccess < thirtyDaysAgo) {
					delete accessData[id];
				}
			});

			localStorage.setItem(accessKey, JSON.stringify(accessData));
		},
		[activeWorkspace?.id, cacheHook.trackDocumentAccess],
	);

	// Smart cache warming based on access patterns
	const warmCache = React.useCallback(() => {
		if (!activeWorkspace?.id) {
			return;
		}

		const accessKey = `doc-access-${activeWorkspace.id}`;
		const accessData = localStorage.getItem(accessKey);

		if (accessData) {
			try {
				const parsed = JSON.parse(accessData);
				// Get top 10 most accessed documents
				const topDocuments = Object.entries(parsed)
					.sort(([, a], [, b]) => (b as any).count - (a as any).count)
					.slice(0, 10)
					.map(([id]) => id);

				topDocuments.forEach((docId) => {
					cacheHook.prefetchDocument(docId);
				});
			} catch (error) {
				console.warn(
					"Failed to warm cache from access patterns:",
					error,
				);
			}
		}
	}, [activeWorkspace?.id, cacheHook.prefetchDocument]);

	// Warm cache when workspace changes
	useEffect(() => {
		if (activeWorkspace?.id && !cacheHook.isLoading) {
			const timer = setTimeout(warmCache, 1000); // Delay to let initial data load
			return () => clearTimeout(timer);
		}
	}, [activeWorkspace?.id, cacheHook.isLoading, warmCache]);

	const contextValue: WorkspaceCacheContextValue = {
		...cacheHook,
		trackDocumentAccess: enhancedTrackDocumentAccess,
		cacheStats,
	};

	return (
		<WorkspaceCacheContext.Provider value={contextValue}>
			{children}
		</WorkspaceCacheContext.Provider>
	);
}

/**
 * Development helper to monitor cache performance
 */
export function useCachePerformanceMonitor() {
	const { cacheStats, isLoading } = useWorkspaceCacheContext();

	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			console.log("📊 Workspace Cache Stats:", {
				documents: cacheStats.documentsCount,
				folders: cacheStats.foldersCount,
				sources: cacheStats.sourcesCount,
				isLoading,
				lastUpdated: cacheStats.lastUpdated,
			});
		}
	}, [cacheStats, isLoading]);

	return cacheStats;
}
