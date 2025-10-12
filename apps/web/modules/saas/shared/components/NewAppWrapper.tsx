"use client";

import { FloatingAIButton } from "@saas/shared/components/FloatingAIButton";
import { LeftSidebar } from "@saas/shared/components/LeftSidebar";
import { RightAIPanel } from "@saas/shared/components/RightAIPanel";
import { TabProvider } from "@saas/shared/components/providers/TabProvider";
import { SearchModal } from "./search/SearchModal";
import { SearchProvider, useSearch } from "./search/SearchProvider";
import { WorkspaceWelcome } from "./WorkspaceWelcome";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { IconButton } from "@ui/components/icon-button";
import { cn } from "@ui/lib";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type PropsWithChildren,
} from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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
	onInlineCreate?: (
		type: "folder" | "document",
		parentFolderId?: string,
	) => void;
	registerInlineCreateHandler: (
		handler: (type: "folder" | "document", parentFolderId?: string) => void,
	) => void;
	// New source insertion handlers
	onInsertSource?: (source: any) => void;
	onUseAsAIContext?: (source: any) => void;
	registerInsertSourceHandler: (handler: (source: any) => void) => void;
	registerAIContextHandler: (handler: (source: any) => void) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const useEditorContext = () => {
	const context = useContext(EditorContext);
	if (!context) {
		throw new Error("useEditorContext must be used within NewAppWrapper");
	}
	return context;
};

// Collapse button component
function CollapseButton({
	isCollapsed,
	onClick,
}: {
	isCollapsed: boolean;
	onClick: () => void;
}) {
	return (
		<div className="absolute top-1/2 -translate-y-1/2 -right-4 z-20">
			<IconButton
				variant="outline"
				size="sm"
				icon={isCollapsed ? <ChevronRight /> : <ChevronLeft />}
				onClick={onClick}
				className="bg-background border-2 border-border shadow-lg hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
				title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
			/>
		</div>
	);
}

// Collapsed left panel component
function CollapsedLeftPanel({ onExpand }: { onExpand: () => void }) {
	const { openSearch } = useSearch();

	return (
		<div className="w-12 bg-muted/50 flex flex-col items-center pt-4 space-y-3 shadow-sm h-full">
			<IconButton
				variant="ghost"
				size="sm"
				icon={<ChevronRight className="h-4 w-4" />}
				onClick={onExpand}
				title="Open File Panel"
				className="bg-background hover:bg-primary hover:text-primary-foreground shadow-sm"
			/>
			<IconButton
				variant="ghost"
				size="sm"
				icon={<Search className="h-4 w-4" />}
				onClick={openSearch}
				title="Search"
				className="bg-background hover:bg-primary hover:text-primary-foreground shadow-sm"
			/>
		</div>
	);
}

function AppContent({ children }: PropsWithChildren) {
	const { activeWorkspace } = useActiveWorkspace();
	const [isAIOpen, setIsAIOpen] = useState(false);
	const [leftCollapsed, setLeftCollapsed] = useState(false);
	const [documentSelectHandler, setDocumentSelectHandler] = useState<
		((document: any) => void) | null
	>(null);
	const [sourceSelectHandler, setSourceSelectHandler] = useState<
		((sourceId: string) => void) | null
	>(null);
	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
		null,
	);
	const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
		null,
	);
	const [inlineCreateHandler, setInlineCreateHandler] = useState<
		((type: "folder" | "document", parentFolderId?: string) => void) | null
	>(null);
	// New source insertion handlers
	const [insertSourceHandler, setInsertSourceHandler] = useState<
		((source: any) => void) | null
	>(null);
	const [aiContextHandler, setAIContextHandler] = useState<
		((source: any) => void) | null
	>(null);

	// Search modal integration
	const { isSearchOpen, openSearch, closeSearch } = useSearch();

	// Keyboard shortcut for search
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd+K or Ctrl+K to open search
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				openSearch();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [openSearch]);

	const editorContextValue: EditorContextType = {
		onDocumentSelect: documentSelectHandler || undefined,
		onSourceSelect: sourceSelectHandler || undefined,
		registerDocumentHandler: (handler) =>
			setDocumentSelectHandler(() => handler),
		registerSourceHandler: (handler) =>
			setSourceSelectHandler(() => handler),
		selectedFolderId,
		setSelectedFolderId,
		selectedDocumentId,
		setSelectedDocumentId,
		onInlineCreate: inlineCreateHandler || undefined,
		registerInlineCreateHandler: (handler) =>
			setInlineCreateHandler(() => handler),
		// New source insertion handlers
		onInsertSource: insertSourceHandler || undefined,
		onUseAsAIContext: aiContextHandler || undefined,
		registerInsertSourceHandler: (handler) =>
			setInsertSourceHandler(() => handler),
		registerAIContextHandler: (handler) =>
			setAIContextHandler(() => handler),
	};

	const enhancedLeftSidebar = (
		<LeftSidebar
			onDocumentSelect={documentSelectHandler || (() => {})}
			onSourceSelect={sourceSelectHandler || (() => {})}
			selectedDocumentId={selectedDocumentId || undefined}
			onInsertSource={insertSourceHandler || undefined}
			onUseAsAIContext={aiContextHandler || undefined}
		/>
	);

	return (
		<EditorContext.Provider value={editorContextValue}>
			<div className="h-screen bg-background">
				<PanelGroup direction="horizontal" id="main-layout">
					{/* Left Panel - File Explorer or Collapsed */}
					{leftCollapsed ? (
						<Panel
							defaultSize={3}
							minSize={3}
							maxSize={3}
							id="left-panel-collapsed"
						>
							<CollapsedLeftPanel
								onExpand={() => setLeftCollapsed(false)}
							/>
						</Panel>
					) : (
						<>
							<Panel
								defaultSize={18}
								minSize={14}
								maxSize={30}
								className="min-w-[220px] relative overflow-visible"
								id="left-panel"
							>
								<div className="h-full bg-background border-r relative overflow-visible">
									{enhancedLeftSidebar}
									<CollapseButton
										isCollapsed={leftCollapsed}
										onClick={() => setLeftCollapsed(true)}
									/>
								</div>
							</Panel>

							{/* Resize Handle */}
							<PanelResizeHandle
								className="w-0 hover:w-0.5 hover:bg-primary/20 transition-all cursor-col-resize data-[resize-handle-active]:w-1 data-[resize-handle-active]:bg-primary/40"
								id="left-resize-handle"
							/>
						</>
					)}

					{/* Main Content Area */}
					<Panel
						defaultSize={
							leftCollapsed
								? isAIOpen
									? 67
									: 97
								: isAIOpen
									? 57
									: 82
						}
						minSize={30}
						id="main-panel"
					>
						<div className="h-full bg-card">
							{!activeWorkspace ? <WorkspaceWelcome /> : children}
						</div>
					</Panel>

					{/* Right AI Panel - Conditionally rendered */}
					{/* {isAIOpen && (
						<>
							<PanelResizeHandle className="w-0 hover:w-0.5 hover:bg-primary/20 transition-all cursor-col-resize data-[resize-handle-active]:w-1 data-[resize-handle-active]:bg-primary/40" id="right-resize-handle" />
							
							<Panel defaultSize={25} minSize={15} maxSize={40} className="min-w-[280px]" id="right-panel">
								<div className="h-full bg-background border-l relative">
									<RightAIPanel />
								
									<button
										onClick={() => setIsAIOpen(false)}
										className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted transition-colors z-10"
									>
										<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							</Panel>
						</>
					)} */}
				</PanelGroup>

				{/* Floating AI Button - only show when panel is closed */}
				{/* <FloatingAIButton
					onClick={() => setIsAIOpen(true)}
					isAIOpen={isAIOpen}
				/> */}

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
			<TabProvider>
				<AppContent>{children}</AppContent>
			</TabProvider>
		</SearchProvider>
	);
}
