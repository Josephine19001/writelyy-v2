"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  documentsQueryKey,
  foldersQueryKey,
  sourcesQueryKey,
} from "@saas/lib/api";

interface CacheWarmerOptions {
  enabled?: boolean;
  warmingInterval?: number; // in minutes
  backgroundRefreshThreshold?: number; // in minutes
  maxConcurrentPrefetches?: number;
}

/**
 * Hook for warming and maintaining workspace cache in the background
 * Keeps data fresh without blocking the UI
 */
export function useCacheWarmer(
  organizationId: string | null,
  options: CacheWarmerOptions = {}
) {
  const {
    enabled = true,
    warmingInterval = 10, // 10 minutes
    backgroundRefreshThreshold = 5, // 5 minutes
    maxConcurrentPrefetches = 3,
  } = options;

  const queryClient = useQueryClient();
  const warmerIntervalRef = useRef<NodeJS.Timeout>();
  const prefetchQueueRef = useRef<string[]>([]);
  const activePrefetchesRef = useRef<Set<string>>(new Set());

  // Check if data is stale and needs refreshing
  const isDataStale = useCallback((queryKey: string[]) => {
    const queryState = queryClient.getQueryState(queryKey);
    if (!queryState?.dataUpdatedAt) return true;
    
    const threshold = backgroundRefreshThreshold * 60 * 1000; // Convert to ms
    return Date.now() - queryState.dataUpdatedAt > threshold;
  }, [backgroundRefreshThreshold, queryClient]);

  // Background refresh for stale data
  const refreshStaleData = useCallback(async () => {
    if (!organizationId || !enabled) return;

    const queries = [
      { key: documentsQueryKey(organizationId), name: "documents" },
      { key: foldersQueryKey(organizationId), name: "folders" },
      { key: sourcesQueryKey(organizationId), name: "sources" },
    ];

    for (const query of queries) {
      if (isDataStale(query.key)) {
        console.debug(`🔄 Background refresh: ${query.name}`);
        try {
          await queryClient.refetchQueries({
            queryKey: query.key,
            type: "active",
          });
        } catch (error) {
          console.warn(`Failed to refresh ${query.name}:`, error);
        }
      }
    }
  }, [organizationId, enabled, isDataStale, queryClient]);

  // Smart document prefetching based on usage patterns
  const prefetchSmartDocuments = useCallback(async () => {
    if (!organizationId || !enabled) return;

    try {
      // Get access patterns from localStorage
      const accessKey = `doc-access-${organizationId}`;
      const accessData = localStorage.getItem(accessKey);
      
      if (!accessData) return;

      const parsed = JSON.parse(accessData);
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;

      // Get documents accessed in the last 24 hours, sorted by frequency
      const recentlyAccessed = Object.entries(parsed)
        .filter(([, data]: [string, any]) => data.lastAccess > dayAgo)
        .sort(([, a], [, b]) => (b as any).count - (a as any).count)
        .slice(0, maxConcurrentPrefetches)
        .map(([id]) => id);

      // Prefetch these documents if not already cached
      for (const docId of recentlyAccessed) {
        const cachedDoc = queryClient.getQueryData(["document", docId]);
        if (!cachedDoc && !activePrefetchesRef.current.has(docId)) {
          prefetchQueueRef.current.push(docId);
        }
      }

      // Process prefetch queue
      while (
        prefetchQueueRef.current.length > 0 &&
        activePrefetchesRef.current.size < maxConcurrentPrefetches
      ) {
        const docId = prefetchQueueRef.current.shift()!;
        activePrefetchesRef.current.add(docId);

        queryClient.prefetchQuery({
          queryKey: ["document", docId],
          queryFn: async () => {
            const { orpcClient } = await import("@shared/lib/orpc-client");
            const { document } = await orpcClient.documents.find({ id: docId });
            return document;
          },
          staleTime: 10 * 60 * 1000, // 10 minutes
        }).finally(() => {
          activePrefetchesRef.current.delete(docId);
        });
      }
    } catch (error) {
      console.warn("Failed to prefetch smart documents:", error);
    }
  }, [organizationId, enabled, maxConcurrentPrefetches, queryClient]);

  // Prefetch folder trees for navigation
  const prefetchFolderTrees = useCallback(async () => {
    if (!organizationId || !enabled) return;

    try {
      const folderTreeKey = ["folders", organizationId, "tree"];
      if (isDataStale(folderTreeKey)) {
        console.debug("🌳 Prefetching folder tree");
        await queryClient.prefetchQuery({
          queryKey: folderTreeKey,
          queryFn: async () => {
            const { orpcClient } = await import("@shared/lib/orpc-client");
            const { folders } = await orpcClient.folders.list({
              organizationId,
              includeDocuments: false,
            });
            return folders;
          },
          staleTime: 15 * 60 * 1000, // 15 minutes
        });
      }
    } catch (error) {
      console.warn("Failed to prefetch folder tree:", error);
    }
  }, [organizationId, enabled, isDataStale, queryClient]);

  // Main warming function
  const warmCache = useCallback(async () => {
    if (!organizationId || !enabled) return;

    console.debug("🔥 Starting cache warming cycle");
    
    const startTime = performance.now();
    
    try {
      await Promise.allSettled([
        refreshStaleData(),
        prefetchSmartDocuments(),
        prefetchFolderTrees(),
      ]);
      
      const duration = performance.now() - startTime;
      console.debug(`✅ Cache warming completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error("Cache warming failed:", error);
    }
  }, [
    organizationId,
    enabled,
    refreshStaleData,
    prefetchSmartDocuments,
    prefetchFolderTrees,
  ]);

  // Set up warming interval
  useEffect(() => {
    if (!enabled || !organizationId) {
      if (warmerIntervalRef.current) {
        clearInterval(warmerIntervalRef.current);
      }
      return;
    }

    // Initial warm-up after a short delay
    const initialTimer = setTimeout(warmCache, 2000);

    // Set up regular warming interval
    warmerIntervalRef.current = setInterval(
      warmCache,
      warmingInterval * 60 * 1000
    );

    return () => {
      clearTimeout(initialTimer);
      if (warmerIntervalRef.current) {
        clearInterval(warmerIntervalRef.current);
      }
    };
  }, [enabled, organizationId, warmCache, warmingInterval]);

  // Manual cache warming trigger
  const manualWarmCache = useCallback(() => {
    console.debug("🔥 Manual cache warming triggered");
    warmCache();
  }, [warmCache]);

  // Cache statistics
  const getCacheStats = useCallback(() => {
    if (!organizationId) return null;

    const documentsState = queryClient.getQueryState(documentsQueryKey(organizationId));
    const foldersState = queryClient.getQueryState(foldersQueryKey(organizationId));
    const sourcesState = queryClient.getQueryState(sourcesQueryKey(organizationId));

    return {
      documents: {
        cached: !!documentsState?.data,
        lastUpdated: documentsState?.dataUpdatedAt,
        isStale: documentsState ? isDataStale(documentsQueryKey(organizationId)) : true,
      },
      folders: {
        cached: !!foldersState?.data,
        lastUpdated: foldersState?.dataUpdatedAt,
        isStale: foldersState ? isDataStale(foldersQueryKey(organizationId)) : true,
      },
      sources: {
        cached: !!sourcesState?.data,
        lastUpdated: sourcesState?.dataUpdatedAt,
        isStale: sourcesState ? isDataStale(sourcesQueryKey(organizationId)) : true,
      },
      activePrefetches: activePrefetchesRef.current.size,
      queuedPrefetches: prefetchQueueRef.current.length,
    };
  }, [organizationId, queryClient, isDataStale]);

  return {
    warmCache: manualWarmCache,
    getCacheStats,
    isEnabled: enabled,
  };
}

/**
 * Development-only cache monitoring hook
 */
export function useCacheMonitor(organizationId: string | null) {
  const { getCacheStats } = useCacheWarmer(organizationId, { enabled: false });

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const interval = setInterval(() => {
      const stats = getCacheStats();
      if (stats) {
        console.table({
          Documents: {
            Cached: stats.documents.cached ? "✅" : "❌",
            Stale: stats.documents.isStale ? "⚠️" : "✅",
            "Last Updated": stats.documents.lastUpdated
              ? new Date(stats.documents.lastUpdated).toLocaleTimeString()
              : "Never",
          },
          Folders: {
            Cached: stats.folders.cached ? "✅" : "❌",
            Stale: stats.folders.isStale ? "⚠️" : "✅",
            "Last Updated": stats.folders.lastUpdated
              ? new Date(stats.folders.lastUpdated).toLocaleTimeString()
              : "Never",
          },
          Sources: {
            Cached: stats.sources.cached ? "✅" : "❌",
            Stale: stats.sources.isStale ? "⚠️" : "✅",
            "Last Updated": stats.sources.lastUpdated
              ? new Date(stats.sources.lastUpdated).toLocaleTimeString()
              : "Never",
          },
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [getCacheStats]);
}