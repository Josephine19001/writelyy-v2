"use client";

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
} from "react";
import type { EditorTab, DocumentTab } from "../editor/types";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useTabManager } from "../../hooks/use-tab-manager";

interface TabContextType {
	// Tab management
	tabs: EditorTab[];
	activeTabId?: string;
	activeTab?: EditorTab;

	// Tab actions
	addOrSwitchToTab: (tab: EditorTab) => void;
	selectTab: (tabId: string) => void;
	closeTab: (tabId: string) => void;

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

	// Debug tabs changes
	React.useEffect(() => {
		console.log(
			"🔍 TABS STATE CHANGED:",
			tabs.map((t) => ({ id: t.id, title: t.title })),
		);
	}, [tabs]);

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
			console.log(
				"🔍 TAB PROVIDER: addOrSwitchToTab called with:",
				newTab.id,
				newTab.title,
			);

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
				console.log(
					"🔍 TAB PROVIDER: Found existing tab, setting active:",
					existingTab.id,
				);
				setActiveTabId(existingTab.id);
			} else {
				console.log(
					"🔍 TAB PROVIDER: Adding new tab and setting active:",
					newTab.id,
				);
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
			console.log("🔍 TAB PROVIDER: Manual tab selection:", tabId);

			const tab = tabs.find((t) => t.id === tabId);
			if (!tab) {
				return;
			}

			console.log("🔍 TAB PROVIDER: Setting active tab manually:", tabId);
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
		activeDocumentId,
	};

	return (
		<TabContext.Provider value={contextValue}>
			{children}
		</TabContext.Provider>
	);
}
