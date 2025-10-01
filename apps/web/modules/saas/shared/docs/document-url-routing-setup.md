# Document URL Routing Setup Guide

This guide shows how to implement URL-based document navigation with deep linking, shareable URLs, and browser history support.

## Overview

The document URL routing system provides:
- **Deep linking**: Direct URLs to specific documents (`/app/workspace/docs/doc-id`)
- **Browser history**: Back/forward navigation between documents
- **Shareable URLs**: Copy and share direct links to documents
- **Refresh persistence**: Document state preserved on page refresh
- **Keyboard shortcuts**: Navigate with Escape or Ctrl+Left Arrow
- **Breadcrumb navigation**: Visual path with clickable navigation

## URL Structure

```
/app/{workspaceSlug}/docs/{documentId}     # View specific document
/app/{workspaceSlug}/folders/{folderId}    # View folder contents
/app/{workspaceSlug}                       # Workspace root
```

## Quick Setup

### 1. Update your Next.js routing structure

Create these route files in your `app` directory:

```typescript
// app/app/[workspaceSlug]/page.tsx
import { WorkspaceRootPage } from '@saas/shared/components/pages/WorkspaceRootPage';

export default function WorkspacePage() {
  return <WorkspaceRootPage />;
}

// app/app/[workspaceSlug]/docs/[documentId]/page.tsx
import { DocumentPage } from '@saas/shared/components/pages/DocumentPage';

export default function DocumentViewPage() {
  return <DocumentPage />;
}

// app/app/[workspaceSlug]/folders/[folderId]/page.tsx
import { FolderPage } from '@saas/shared/components/pages/FolderPage';

export default function FolderViewPage() {
  return <FolderPage />;
}
```

### 2. Wrap your app with providers

```tsx
// app/app/[workspaceSlug]/layout.tsx
import { WorkspaceCacheProvider } from '@saas/shared/components/providers/WorkspaceCacheProvider';
import { ActiveWorkspaceProvider } from '@saas/workspaces/components/ActiveWorkspaceProvider';

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

### 3. Use the document router in your components

```tsx
import { useDocumentRouter } from '@saas/shared/hooks/use-document-router';
import { DocumentBreadcrumbs } from '@saas/shared/components/navigation/DocumentBreadcrumbs';
import { CachedWorkspaceDocumentTree } from '@saas/shared/components/workspace/CachedWorkspaceDocumentTree';

function MyWorkspaceComponent() {
  const { currentDocumentId, navigateToDocument } = useDocumentRouter();

  return (
    <div>
      <DocumentBreadcrumbs />
      
      <CachedWorkspaceDocumentTree
        useUrlRouting={true} // Enable URL-based navigation
      />
      
      {currentDocumentId && (
        <DocumentEditor documentId={currentDocumentId} />
      )}
    </div>
  );
}
```

## Advanced Usage

### Document Navigation

```tsx
import { useDocumentRouter, useDocumentUrl } from '@saas/shared/hooks/use-document-router';

function DocumentComponent({ documentId }: { documentId: string }) {
  const { navigateToDocument, getShareableUrl } = useDocumentRouter();
  const { shareableUrl, openDocument } = useDocumentUrl(documentId);

  const handleShare = () => {
    navigator.clipboard.writeText(shareableUrl!);
  };

  const handleOpen = () => {
    openDocument(); // Navigates to document with URL update
  };

  return (
    <div>
      <button onClick={handleOpen}>Open Document</button>
      <button onClick={handleShare}>Share Document</button>
    </div>
  );
}
```

### Keyboard Navigation

```tsx
import { useDocumentKeyboardNavigation } from '@saas/shared/hooks/use-document-router';

function DocumentEditor() {
  // Enables keyboard shortcuts:
  // - Escape: Go back to previous page
  // - Ctrl/Cmd + Left Arrow: Go back
  useDocumentKeyboardNavigation();

  return <div>Document content...</div>;
}
```

### Breadcrumb Navigation

```tsx
import { DocumentBreadcrumbs, CompactDocumentBreadcrumbs } from '@saas/shared/components/navigation/DocumentBreadcrumbs';

function MyHeader() {
  return (
    <header>
      {/* Full breadcrumbs */}
      <DocumentBreadcrumbs 
        showIcons={true}
        maxItems={5}
        separator="/"
      />
      
      {/* Or compact version for mobile */}
      <CompactDocumentBreadcrumbs className="mobile-only" />
    </header>
  );
}
```

### Path Information

```tsx
import { useDocumentRouter } from '@saas/shared/hooks/use-document-router';

function PathDisplay() {
  const {
    documentPath,
    currentDocument,
    currentFolder,
    isInDocumentView,
    isInFolderView,
    isAtRoot,
    canNavigateBack,
  } = useDocumentRouter();

  return (
    <div>
      <h3>Current Location:</h3>
      {documentPath.map(item => (
        <span key={item.id}>
          {item.name} ({item.type})
        </span>
      ))}
      
      {canNavigateBack && (
        <button onClick={() => navigateBack()}>
          ← Back
        </button>
      )}
    </div>
  );
}
```

### Creating Documents in Context

```tsx
import { useDocumentRouter } from '@saas/shared/hooks/use-document-router';
import { useOptimizedDocumentMutations } from '@saas/shared/hooks/use-optimized-mutations';

function CreateDocumentButton() {
  const { createDocumentInCurrentContext, navigateToDocument } = useDocumentRouter();
  const { createDocument } = useOptimizedDocumentMutations(workspaceId);

  const handleCreate = async () => {
    const documentData = createDocumentInCurrentContext();
    if (documentData) {
      const newDoc = await createDocument.mutateAsync(documentData);
      navigateToDocument(newDoc.id); // Navigate to new document
    }
  };

  return (
    <button onClick={handleCreate}>
      Create Document Here
    </button>
  );
}
```

## Router State Management

### URL Synchronization

The router automatically:
- Updates URL when navigating programmatically
- Reads URL parameters on page load
- Maintains browser history
- Handles back/forward navigation

### Cache Integration

```tsx
import { useWorkspaceCacheContext } from '@saas/shared/components/providers/WorkspaceCacheProvider';
import { useDocumentRouter } from '@saas/shared/hooks/use-document-router';

function IntegratedComponent() {
  const { trackDocumentAccess, prefetchDocument } = useWorkspaceCacheContext();
  const { currentDocumentId } = useDocumentRouter();

  useEffect(() => {
    if (currentDocumentId) {
      // Automatically track access and prefetch related documents
      trackDocumentAccess(currentDocumentId);
      prefetchDocument(currentDocumentId);
    }
  }, [currentDocumentId]);
}
```

## SEO and Metadata

### Dynamic Page Titles

```tsx
// app/app/[workspaceSlug]/docs/[documentId]/page.tsx
import { Metadata } from 'next';
import { orpcClient } from '@shared/lib/orpc-client';

export async function generateMetadata({ params }): Promise<Metadata> {
  try {
    const { document } = await orpcClient.documents.find({ 
      id: params.documentId 
    });
    
    return {
      title: `${document.title} - ${workspaceName}`,
      description: document.description || `Document in ${workspaceName}`,
    };
  } catch {
    return {
      title: 'Document Not Found',
    };
  }
}
```

### Open Graph Tags

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { document } = await orpcClient.documents.find({ 
    id: params.documentId 
  });
  
  return {
    title: document.title,
    description: document.description,
    openGraph: {
      title: document.title,
      description: document.description,
      url: `/app/${params.workspaceSlug}/docs/${params.documentId}`,
      type: 'article',
    },
  };
}
```

## Error Handling

### Missing Documents

```tsx
// app/app/[workspaceSlug]/docs/[documentId]/not-found.tsx
export default function DocumentNotFound() {
  return (
    <div>
      <h1>Document Not Found</h1>
      <p>The document you're looking for doesn't exist or you don't have access to it.</p>
      <Link href="/app">Back to Dashboard</Link>
    </div>
  );
}
```

### Permission Handling

```tsx
import { useDocumentQuery } from '@saas/lib/api';
import { useDocumentRouter } from '@saas/shared/hooks/use-document-router';

function ProtectedDocumentView() {
  const { currentDocumentId, navigateToWorkspace } = useDocumentRouter();
  const { data: document, error } = useDocumentQuery(currentDocumentId!);

  if (error?.message.includes('permission')) {
    return (
      <div>
        <h2>Access Denied</h2>
        <p>You don't have permission to view this document.</p>
        <button onClick={() => navigateToWorkspace()}>
          Back to Workspace
        </button>
      </div>
    );
  }

  return <DocumentEditor document={document} />;
}
```

## Testing

### Unit Tests

```typescript
import { renderHook } from '@testing-library/react';
import { useDocumentRouter } from '@saas/shared/hooks/use-document-router';

describe('useDocumentRouter', () => {
  it('should extract document ID from URL', () => {
    // Mock Next.js router
    jest.mock('next/navigation', () => ({
      useParams: () => ({ documentId: 'doc-123' }),
      useRouter: () => ({ push: jest.fn() }),
    }));

    const { result } = renderHook(() => useDocumentRouter());
    expect(result.current.currentDocumentId).toBe('doc-123');
  });
});
```

### E2E Tests

```typescript
// cypress/e2e/document-navigation.cy.ts
describe('Document Navigation', () => {
  it('should navigate to document via URL', () => {
    cy.visit('/app/my-workspace/docs/doc-123');
    cy.url().should('include', '/docs/doc-123');
    cy.get('[data-testid="document-title"]').should('contain', 'My Document');
  });

  it('should update URL when navigating', () => {
    cy.visit('/app/my-workspace');
    cy.get('[data-testid="document-item"]').first().click();
    cy.url().should('match', /\/docs\/[a-zA-Z0-9-]+$/);
  });
});
```

## Performance Considerations

### Prefetching

The router automatically:
- Prefetches documents when URLs change
- Tracks access patterns for smart prefetching
- Caches navigation history

### Bundle Splitting

```tsx
// Lazy load document editor for better performance
const DocumentEditor = lazy(() => import('@saas/shared/components/DocumentEditor'));

function DocumentPage() {
  return (
    <Suspense fallback={<DocumentLoadingSkeleton />}>
      <DocumentEditor />
    </Suspense>
  );
}
```

## Migration Guide

### From State-Based Navigation

```tsx
// Before: State-based
const [selectedDocumentId, setSelectedDocumentId] = useState(null);

// After: URL-based
const { currentDocumentId, navigateToDocument } = useDocumentRouter();
```

### From Manual URL Management

```tsx
// Before: Manual
router.push(`/docs/${documentId}`);

// After: Integrated
navigateToDocument(documentId);
```

This system provides a complete URL-based document navigation solution with excellent performance, user experience, and developer experience!
