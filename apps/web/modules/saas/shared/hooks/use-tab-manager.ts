"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";

export interface TabItem {
  id: string;
  title: string;
  url: string;
  type: "document" | "folder" | "workspace";
  lastAccessed: number;
  isActive: boolean;
  documentId?: string;
  folderId?: string;
  workspaceId: string;
}

interface TabManagerState {
  tabs: TabItem[];
  activeTabId: string | null;
  maxTabs: number;
}

/**
 * Tab manager hook that provides ChatGPT-like tab functionality
 * - URL-based tab tracking
 * - Local storage persistence
 * - Tab switching with URL updates
 * - Automatic tab restoration on refresh
 */
export function useTabManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeWorkspace } = useActiveWorkspace();
  
  const [state, setState] = useState<TabManagerState>({
    tabs: [],
    activeTabId: null,
    maxTabs: 10,
  });

  const storageKey = `workspace-tabs-${activeWorkspace?.id || 'default'}`;

  // Load tabs from localStorage on mount
  useEffect(() => {
    if (!activeWorkspace) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: TabManagerState = JSON.parse(stored);
        
        // Filter out tabs for other workspaces
        const workspaceTabs = parsed.tabs.filter(tab => tab.workspaceId === activeWorkspace.id);
        
        setState(prev => ({
          ...prev,
          tabs: workspaceTabs,
          activeTabId: parsed.activeTabId,
        }));
      }
    } catch (error) {
      console.warn("Failed to load tabs from localStorage:", error);
    }
  }, [activeWorkspace?.id, storageKey]);

  // Save tabs to localStorage whenever state changes
  useEffect(() => {
    if (!activeWorkspace) return;

    try {
      const dataToStore = {
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        maxTabs: state.maxTabs,
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.warn("Failed to save tabs to localStorage:", error);
    }
  }, [state, storageKey, activeWorkspace]);

  // Parse current URL to determine tab info
  const parseUrlForTab = useCallback((url: string): Partial<TabItem> | null => {
    if (!activeWorkspace) return null;

    const urlParts = url.split('/');
    const workspaceIndex = urlParts.findIndex(part => part === activeWorkspace.slug);
    
    if (workspaceIndex === -1) return null;

    const baseTab = {
      url,
      workspaceId: activeWorkspace.id,
      lastAccessed: Date.now(),
    };

    // Document URL: /app/[workspaceSlug]/docs/[documentId]
    if (urlParts[workspaceIndex + 1] === 'docs' && urlParts[workspaceIndex + 2]) {
      return {
        ...baseTab,
        id: `doc-${urlParts[workspaceIndex + 2]}`,
        type: "document" as const,
        documentId: urlParts[workspaceIndex + 2],
        title: "Loading Document...", // Will be updated when document loads
      };
    }

    // Folder URL: /app/[workspaceSlug]/folders/[folderId]
    if (urlParts[workspaceIndex + 1] === 'folders' && urlParts[workspaceIndex + 2]) {
      return {
        ...baseTab,
        id: `folder-${urlParts[workspaceIndex + 2]}`,
        type: "folder" as const,
        folderId: urlParts[workspaceIndex + 2],
        title: "Loading Folder...", // Will be updated when folder loads
      };
    }

    // Workspace root URL: /app/[workspaceSlug]
    if (urlParts[workspaceIndex + 1] === undefined || urlParts[workspaceIndex + 1] === '') {
      return {
        ...baseTab,
        id: `workspace-${activeWorkspace.id}`,
        type: "workspace" as const,
        title: activeWorkspace.name,
      };
    }

    return null;
  }, [activeWorkspace]);

  // Add or update a tab
  const addOrUpdateTab = useCallback((tabData: Partial<TabItem> & { url: string }) => {
    if (!activeWorkspace) return;

    const parsedTab = parseUrlForTab(tabData.url);
    if (!parsedTab) return;

    const fullTab: TabItem = {
      ...tabData,
      id: parsedTab.id!,
      title: tabData.title || parsedTab.title || "Untitled",
      url: tabData.url,
      type: parsedTab.type!,
      lastAccessed: Date.now(),
      isActive: true,
      workspaceId: activeWorkspace.id,
      documentId: parsedTab.documentId,
      folderId: parsedTab.folderId,
    };

    setState(prev => {
      const existingIndex = prev.tabs.findIndex(tab => tab.id === fullTab.id);
      let newTabs = [...prev.tabs];

      // Update isActive status
      newTabs = newTabs.map(tab => ({ ...tab, isActive: false }));

      if (existingIndex >= 0) {
        // Update existing tab
        newTabs[existingIndex] = { ...newTabs[existingIndex], ...fullTab, isActive: true };
      } else {
        // Add new tab
        newTabs.unshift(fullTab);

        // Remove excess tabs if we exceed maxTabs
        if (newTabs.length > prev.maxTabs) {
          // Sort by last accessed and remove oldest
          newTabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
          newTabs = newTabs.slice(0, prev.maxTabs);
        }
      }

      return {
        ...prev,
        tabs: newTabs,
        activeTabId: fullTab.id,
      };
    });
  }, [activeWorkspace, parseUrlForTab]);

  // Remove a tab
  const removeTab = useCallback((tabId: string) => {
    setState(prev => {
      const newTabs = prev.tabs.filter(tab => tab.id !== tabId);
      
      // If we removed the active tab, set a new active tab
      let newActiveTabId = prev.activeTabId;
      if (prev.activeTabId === tabId) {
        newActiveTabId = newTabs.length > 0 ? newTabs[0].id : null;
        
        // Navigate to the new active tab
        if (newActiveTabId) {
          const newActiveTab = newTabs.find(tab => tab.id === newActiveTabId);
          if (newActiveTab) {
            router.push(newActiveTab.url);
          }
        } else {
          // No tabs left, navigate to workspace
          router.push(`/app/${activeWorkspace?.slug || ''}`);
        }
      }

      return {
        ...prev,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });
  }, [router, activeWorkspace?.slug]);

  // Switch to a tab
  const switchToTab = useCallback((tabId: string) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab) return;

    // Update last accessed time and active status
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => ({
        ...t,
        isActive: t.id === tabId,
        lastAccessed: t.id === tabId ? Date.now() : t.lastAccessed,
      })),
      activeTabId: tabId,
    }));

    // Navigate to the tab's URL
    router.push(tab.url);
  }, [state.tabs, router]);

  // Update tab title (useful when document/folder loads)
  const updateTabTitle = useCallback((tabId: string, title: string) => {
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(tab =>
        tab.id === tabId ? { ...tab, title } : tab
      ),
    }));
  }, []);

  // Clear all tabs
  const clearAllTabs = useCallback(() => {
    setState(prev => ({
      ...prev,
      tabs: [],
      activeTabId: null,
    }));
  }, []);

  // Get active tab
  const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);

  // Track URL changes to automatically manage tabs
  useEffect(() => {
    if (!activeWorkspace || !pathname) return;

    // Build full URL from pathname
    const fullUrl = pathname;
    
    // Add or update tab for current URL
    addOrUpdateTab({ url: fullUrl });
  }, [pathname, activeWorkspace, addOrUpdateTab]);

  return {
    // State
    tabs: state.tabs,
    activeTab,
    activeTabId: state.activeTabId,
    
    // Actions
    addOrUpdateTab,
    removeTab,
    switchToTab,
    updateTabTitle,
    clearAllTabs,
    
    // Utilities
    hasMultipleTabs: state.tabs.length > 1,
    canCloseActiveTab: state.tabs.length > 0,
  };
}

/**
 * Hook to automatically update document tab titles when documents load
 */
export function useDocumentTabTitle(documentId: string | null, document: any) {
  const { updateTabTitle } = useTabManager();

  useEffect(() => {
    if (documentId && document?.title) {
      const tabId = `doc-${documentId}`;
      updateTabTitle(tabId, document.title);
    }
  }, [documentId, document?.title, updateTabTitle]);
}

/**
 * Hook to automatically update folder tab titles when folders load
 */
export function useFolderTabTitle(folderId: string | null, folder: any) {
  const { updateTabTitle } = useTabManager();

  useEffect(() => {
    if (folderId && folder?.name) {
      const tabId = `folder-${folderId}`;
      updateTabTitle(tabId, folder.name);
    }
  }, [folderId, folder?.name, updateTabTitle]);
}