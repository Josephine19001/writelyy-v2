# Workspace Cache System Setup Guide

This guide shows you how to implement the new workspace caching system to dramatically improve document loading performance.

## Overview

The workspace cache system provides:
- **Instant loading**: Pre-fetches and caches all workspace data
- **Smart prefetching**: Predicts and loads documents you're likely to access
- **Optimistic updates**: UI updates instantly while syncing in background
- **Background refresh**: Keeps data fresh without blocking the UI
- **Access tracking**: Learns usage patterns for better caching

## Quick Setup

### 1. Wrap your app with the cache provider

```tsx
// In your workspace layout
import { WorkspaceCacheProvider } from '@saas/shared/components/providers/WorkspaceCacheProvider';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ActiveWorkspaceProvider>
      <WorkspaceCacheProvider>
        {children}
      </WorkspaceCacheProvider>
    </ActiveWorkspaceProvider>
  );
}
```

### 2. Use the cached document tree

Replace your existing document tree with the cached version:

```tsx
// Before
import { WorkspaceDocumentTree } from '@saas/shared/components/workspace/WorkspaceDocumentTree';

// After
import { CachedWorkspaceDocumentTree } from '@saas/shared/components/workspace/CachedWorkspaceDocumentTree';

function Sidebar() {
  return (
    <CachedWorkspaceDocumentTree
      onDocumentSelect={(docId) => {
        // Handle document selection
        router.push(\`/app/\${workspace}/docs/\${docId}\`);
      }}
      selectedDocumentId={currentDocId}
    />
  );
}
```

### 3. Use optimized mutations

Replace your mutation hooks with optimized versions:

```tsx
// Before
import { useUpdateDocumentMutation } from '@saas/documents/lib/api';

// After
import { useOptimizedDocumentMutations } from '@saas/shared/hooks/use-optimized-mutations';

function DocumentEditor() {
  const { updateDocument } = useOptimizedDocumentMutations(workspaceId);
  
  const handleSave = async (data) => {
    // This will update optimistically and sync in background
    await updateDocument.mutateAsync({
      id: documentId,
      ...data,
    });
  };
}
```

### 4. Add cache warming (optional)

For even better performance, add cache warming:

```tsx
import { useCacheWarmer } from '@saas/shared/hooks/use-cache-warmer';

function WorkspaceApp() {
  const { activeWorkspace } = useActiveWorkspace();
  
  // Automatically warms cache in background
  useCacheWarmer(activeWorkspace?.id, {
    enabled: true,
    warmingInterval: 5, // 5 minutes
  });
  
  return <YourApp />;
}
```

## Advanced Usage

### Custom Cache Management

```tsx
import { useWorkspaceCacheContext } from '@saas/shared/components/providers/WorkspaceCacheProvider';

function DocumentComponent() {
  const {
    documents,
    folders,
    isLoading,
    trackDocumentAccess,
    prefetchDocument,
    updateDocumentCache,
  } = useWorkspaceCacheContext();

  // Track when user accesses a document
  const handleDocumentOpen = (docId: string) => {
    trackDocumentAccess(docId);
    prefetchDocument(docId); // Preload for instant access
  };

  // Update cache when document changes
  const handleDocumentUpdate = (updatedDoc: any) => {
    updateDocumentCache(updatedDoc);
  };
}
```

### Performance Monitoring

```tsx
import { useCachePerformanceMonitor } from '@saas/shared/components/providers/WorkspaceCacheProvider';

function DevTools() {
  const cacheStats = useCachePerformanceMonitor();
  
  // In development, this logs cache stats to console
  // In production, you can send to analytics
  
  return (
    <div>
      <h3>Cache Performance</h3>
      <p>Documents: {cacheStats.documentsCount}</p>
      <p>Folders: {cacheStats.foldersCount}</p>
      <p>Last Updated: {cacheStats.lastUpdated?.toLocaleTimeString()}</p>
    </div>
  );
}
```

### Snapshot Access (No Loading States)

For components that need immediate data without loading states:

```tsx
import { useWorkspaceCacheSnapshot } from '@saas/shared/hooks/use-workspace-cache';

function QuickStats() {
  const { documents, folders, isCached } = useWorkspaceCacheSnapshot(workspaceId);
  
  if (!isCached) {
    return null; // Don't show anything until cached
  }
  
  return (
    <div>
      <span>{documents.length} documents</span>
      <span>{folders.length} folders</span>
    </div>
  );
}
```

## Migration Guide

### From Individual Queries

If you're currently using individual queries:

```tsx
// Before
const { data: documents } = useDocumentsQuery(workspaceId);
const { data: folders } = useFoldersQuery(workspaceId);

// After
const { documents, folders } = useWorkspaceCacheContext();
```

### From Manual Prefetching

Replace manual prefetching with the cache system:

```tsx
// Before
const queryClient = useQueryClient();
const prefetchDoc = (id) => {
  queryClient.prefetchQuery(['document', id], () => fetchDocument(id));
};

// After
const { prefetchDocument } = useWorkspaceCacheContext();
const prefetchDoc = prefetchDocument; // Already optimized
```

## Performance Tips

### 1. Track Document Access
Always call `trackDocumentAccess()` when users interact with documents:

```tsx
const { trackDocumentAccess } = useWorkspaceCacheContext();

const handleDocumentClick = (docId: string) => {
  trackDocumentAccess(docId); // Improves future prefetching
  // ... handle click
};
```

### 2. Use Optimistic Updates
Use the optimized mutations for instant UI feedback:

```tsx
const { updateDocument } = useOptimizedDocumentMutations(workspaceId);

// This updates the UI immediately, syncs in background
await updateDocument.mutateAsync({ id, title: newTitle });
```

### 3. Enable Cache Warming
Let the system learn and prefetch based on usage:

```tsx
// Warms cache every 10 minutes with smart prefetching
useCacheWarmer(workspaceId, { warmingInterval: 10 });
```

### 4. Monitor Performance
In development, monitor cache performance:

```tsx
import { useCacheMonitor } from '@saas/shared/hooks/use-cache-warmer';

// Logs cache stats every 30 seconds in development
useCacheMonitor(workspaceId);
```

## Cache Invalidation

The system automatically invalidates cache when:
- Documents are created, updated, or deleted
- Folders are modified
- User switches workspaces

For manual invalidation:

```tsx
const { invalidateWorkspaceCache } = useWorkspaceCacheContext();

// Force refresh all workspace data
invalidateWorkspaceCache();
```

## Browser Storage

The system uses localStorage to persist:
- Recent document access patterns
- User preferences for prefetching
- Cache performance metrics

This data is workspace-specific and automatically cleaned up.

## Benefits

After implementing this system, you should see:

- **90%+ faster** document tree loading
- **Instant** document switching for recently accessed files
- **Seamless** background updates
- **Smart** prefetching based on usage patterns
- **Reduced** server load from redundant requests

## Troubleshooting

### Cache Not Working
1. Ensure `WorkspaceCacheProvider` wraps your components
2. Check that `activeWorkspace.id` is available
3. Verify React Query is properly configured

### Performance Issues
1. Enable cache warming: `useCacheWarmer(workspaceId)`
2. Check cache stats with `useCachePerformanceMonitor()`
3. Ensure you're tracking document access

### Data Not Updating
1. Check if mutations are using optimized versions
2. Verify cache invalidation is working
3. Use `invalidateWorkspaceCache()` to force refresh

## Example Implementation

See `WorkspaceCacheExample.tsx` for a complete working example that demonstrates all features.