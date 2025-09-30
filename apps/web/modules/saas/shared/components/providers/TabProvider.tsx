"use client";

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import type { EditorTab, DocumentTab } from "../editor/types";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useTabManager } from "../../hooks/use-tab-manager";

// localStorage helpers
const getStorageKey = (workspaceId: string) => `writely-tabs-${workspaceId}`;

const loadTabsFromStorage = (workspaceId: string): { tabs: EditorTab[]; activeTabId?: string } => {
	try {
		const stored = localStorage.getItem(getStorageKey(workspaceId));
		if (stored) {
			const parsed = JSON.parse(stored);
			return { tabs: parsed.tabs || [], activeTabId: parsed.activeTabId };
		}
	} catch (error) {
		console.warn("Failed to load tabs from localStorage:", error);
	}
	return { tabs: [], activeTabId: undefined };
};

const saveTabsToStorage = (workspaceId: string, tabs: EditorTab[], activeTabId?: string) => {
	try {
		localStorage.setItem(getStorageKey(workspaceId), JSON.stringify({
			tabs,
			activeTabId,
			timestamp: Date.now()
		}));
	} catch (error) {
		console.warn("Failed to save tabs to localStorage:", error);
	}
};

interface TabContextType {
	// Tab management
	tabs: EditorTab[];
	activeTabId?: string;
	activeTab?: EditorTab;

	// Tab actions
	addOrSwitchToTab: (tab: EditorTab) => void;
	selectTab: (tabId: string) => void;
	closeTab: (tabId: string) => void;
	updateTabDocument: (documentId: string, updatedDocument: any) => void;

	// Active content
	activeDocumentId?: string;
}

const TabContext = createContext<TabContextType | null>(null);

export const useTabContext = () => {
	const context = useContext(TabContext);
	if (!context) {
		throw new Error("useTabContext must be used within TabProvider");
	}
	return context;
};

interface TabProviderProps {
	children: React.ReactNode;
}

export function TabProvider({ children }: TabProviderProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const { addOrUpdateTab } = useTabManager();

	const [tabs, setTabs] = useState<EditorTab[]>([]);
	const [activeTabId, setActiveTabId] = useState<string>();

	// Load tabs from localStorage when workspace changes
	useEffect(() => {
		if (activeWorkspace?.id) {
			const { tabs: storedTabs, activeTabId: storedActiveTabId } = loadTabsFromStorage(activeWorkspace.id);
			setTabs(storedTabs);
			setActiveTabId(storedActiveTabId);
		} else {
			// Clear tabs when no workspace is selected
			setTabs([]);
			setActiveTabId(undefined);
		}
	}, [activeWorkspace?.id]);

	// Save tabs to localStorage whenever tabs or activeTabId changes
	useEffect(() => {
		if (activeWorkspace?.id) {
			saveTabsToStorage(activeWorkspace.id, tabs, activeTabId);
		}
	}, [activeWorkspace?.id, tabs, activeTabId]);


	// Get active tab
	const activeTab = tabs.find((tab) => tab.id === activeTabId);

	// Get active document ID from active tab only
	const activeDocumentId =
		activeTab?.type === "document"
			? (activeTab.content as DocumentTab).documentId
			: undefined;

	// Add or switch to tab - SIMPLIFIED
	const addOrSwitchToTab = useCallback(
		(newTab: EditorTab) => {
			// Check if tab already exists
			const existingTab = tabs.find((tab) => {
				if (newTab.type === "document" && tab.type === "document") {
					const newDocTab = newTab.content as DocumentTab;
					const existingDocTab = tab.content as DocumentTab;
					return existingDocTab.documentId === newDocTab.documentId;
				}
				return tab.id === newTab.id;
			});

			if (existingTab) {
				setActiveTabId(existingTab.id);
			} else {
				setTabs((currentTabs) => [...currentTabs, newTab]);
				setActiveTabId(newTab.id);
			}

			// No URL updates - tabs are pure UI state like VS Code

			// Update browser tab manager
			if (newTab.type === "document" && activeWorkspace) {
				const documentTab = newTab.content as DocumentTab;
				const url = `/app/${activeWorkspace.slug}/docs/${documentTab.documentId}`;
				addOrUpdateTab({
					url,
					title: newTab.title,
				});
			}
		},
		[activeWorkspace, addOrUpdateTab, tabs],
	);

	// Select tab
	const selectTab = useCallback(
		(tabId: string) => {
			const tab = tabs.find((t) => t.id === tabId);
			if (!tab) {
				return;
			}

			setActiveTabId(tabId);
			// No URL updates - tabs are pure UI state like VS Code
		},
		[tabs],
	);

	// Close tab
	const closeTab = useCallback(
		(tabId: string) => {
			const newTabs = tabs.filter((tab) => tab.id !== tabId);
			let newActiveTabId = activeTabId;

			// Determine new active tab
			if (activeTabId === tabId && newTabs.length > 0) {
				const newActiveTab = newTabs[newTabs.length - 1];
				newActiveTabId = newActiveTab.id;

				// No URL updates - tabs are pure UI state
			} else if (newTabs.length === 0) {
				newActiveTabId = undefined;
				// No navigation - just clear active tab
			}

			setTabs(newTabs);
			setActiveTabId(newActiveTabId);
		},
		[tabs, activeTabId],
	);

	// Update tab document content when cache changes
	const updateTabDocument = useCallback(
		(documentId: string, updatedDocument: any) => {
			setTabs((currentTabs) =>
				currentTabs.map((tab) => {
					if (tab.type === "document") {
						const documentTab = tab.content as DocumentTab;
						if (documentTab.documentId === documentId) {
							return {
								...tab,
								title: updatedDocument.title,
								content: {
									...documentTab,
									document: {
										...documentTab.document,
										...updatedDocument,
									},
								},
							};
						}
					}
					return tab;
				})
			);
		},
		[]
	);

	// Simplified: URL and tabs are independent
	// URL just shows current document for sharing/bookmarking
	// Tabs are pure UI state like VS Code

	// No direct navigation - workspace URLs only, tabs managed by sidebar clicks

	const contextValue: TabContextType = {
		tabs,
		activeTabId,
		activeTab,
		addOrSwitchToTab,
		selectTab,
		closeTab,
		updateTabDocument,
		activeDocumentId,
	};

	return (
		<TabContext.Provider value={contextValue}>
			{children}
		</TabContext.Provider>
	);
}
