"use client";

import { ThreePanelLayout } from "@saas/shared/components/ThreePanelLayout";
import { LeftSidebar } from "@saas/shared/components/LeftSidebar";
import { RightAIPanel } from "@saas/shared/components/RightAIPanel";
import { useState, useEffect, type PropsWithChildren, createContext, useContext } from "react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { WorkspaceWelcome } from "./WorkspaceWelcome";
import { SearchProvider, useSearch } from "./search/SearchProvider";
import { SearchModal } from "./search/SearchModal";

// Context for editor interactions
interface EditorContextType {
	onDocumentSelect?: (document: any) => void;
	onSourceSelect?: (sourceId: string) => void;
	registerDocumentHandler: (handler: (document: any) => void) => void;
	registerSourceHandler: (handler: (sourceId: string) => void) => void;
	selectedFolderId?: string | null;
	setSelectedFolderId: (folderId: string | null) => void;
	selectedDocumentId?: string | null;
	setSelectedDocumentId: (documentId: string | null) => void;
	onInlineCreate?: (type: "folder" | "document", parentFolderId?: string) => void;
	registerInlineCreateHandler: (handler: (type: "folder" | "document", parentFolderId?: string) => void) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const useEditorContext = () => {
	const context = useContext(EditorContext);
	if (!context) {
		throw new Error("useEditorContext must be used within NewAppWrapper");
	}
	return context;
};

function AppContent({ children }: PropsWithChildren) {
	const { activeWorkspace } = useActiveWorkspace();
	const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
	const [documentSelectHandler, setDocumentSelectHandler] = useState<((document: any) => void) | null>(null);
	const [sourceSelectHandler, setSourceSelectHandler] = useState<((sourceId: string) => void) | null>(null);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
	const [inlineCreateHandler, setInlineCreateHandler] = useState<((type: "folder" | "document", parentFolderId?: string) => void) | null>(null);

	// Search modal integration
	const { isSearchOpen, openSearch, closeSearch } = useSearch();

	// Keyboard shortcut for search
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd+K or Ctrl+K to open search
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				openSearch();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [openSearch]);

	// Collapse AI panel when no workspace is selected
	useEffect(() => {
		if (!activeWorkspace) {
			setIsAIPanelOpen(false);
		} else {
			setIsAIPanelOpen(true);
		}
	}, [activeWorkspace]);

	const editorContextValue: EditorContextType = {
		onDocumentSelect: documentSelectHandler || undefined,
		onSourceSelect: sourceSelectHandler || undefined,
		registerDocumentHandler: (handler) => setDocumentSelectHandler(() => handler),
		registerSourceHandler: (handler) => setSourceSelectHandler(() => handler),
		selectedFolderId,
		setSelectedFolderId,
		selectedDocumentId,
		setSelectedDocumentId,
		onInlineCreate: inlineCreateHandler || undefined,
		registerInlineCreateHandler: (handler) => setInlineCreateHandler(() => handler),
	};

	const enhancedLeftSidebar = (
		<LeftSidebar 
			onDocumentSelect={documentSelectHandler || (() => {})}
			onSourceSelect={sourceSelectHandler || (() => {})}
			selectedDocumentId={selectedDocumentId || undefined}
		/>
	);

	return (
		<EditorContext.Provider value={editorContextValue}>
			<div className="h-screen bg-background">
				<ThreePanelLayout
					leftPanel={enhancedLeftSidebar}
					rightPanel={<RightAIPanel />}
					onAIToggle={setIsAIPanelOpen}
					initialRightPanelCollapsed={true}
					initialLeftPanelCollapsed={!activeWorkspace}
				>
					{!activeWorkspace ? <WorkspaceWelcome /> : children}
				</ThreePanelLayout>

				{/* Search Modal */}
				<SearchModal
					open={isSearchOpen}
					onOpenChange={closeSearch}
					onDocumentSelect={documentSelectHandler || (() => {})}
					onSourceSelect={sourceSelectHandler || (() => {})}
				/>
			</div>
		</EditorContext.Provider>
	);
}

export function NewAppWrapper({ children }: PropsWithChildren) {
	return (
		<SearchProvider>
			<AppContent>{children}</AppContent>
		</SearchProvider>
	);
}