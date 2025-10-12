"use client";

import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { CollapsibleSection } from "./sidebar/CollapsibleSection";
import { TopIconBar } from "./sidebar/TopIconBar";
import { WorkspaceDropdown } from "./sidebar/WorkspaceDropdown";
import { WorkspaceDocumentTree } from "./workspace/WorkspaceDocumentTree";
import { WorkspaceSourcesList } from "./workspace/WorkspaceSourcesList";
import { WorkspaceSnippetsList } from "./workspace/WorkspaceSnippetsList";

interface LeftSidebarProps {
	onDocumentSelect?: (document: any) => void;
	onSourceSelect?: (sourceId: string) => void;
	onSnippetSelect?: (snippetId: string) => void;
	selectedDocumentId?: string;
	selectedSourceId?: string;
	selectedSnippetId?: string;
	onInsertSource?: (source: any) => void;
	onInsertSnippet?: (snippet: any) => void;
	onUseAsAIContext?: (source: any) => void;
}

export function LeftSidebar({
	onDocumentSelect,
	onSourceSelect,
	onSnippetSelect,
	selectedDocumentId,
	selectedSourceId,
	selectedSnippetId,
	onInsertSource,
	onInsertSnippet,
	onUseAsAIContext,
}: LeftSidebarProps) {
	const { activeWorkspace } = useActiveWorkspace();

	return (
		<div className="flex flex-col h-full relative backdrop-blur-xl bg-gradient-to-b from-background/95 via-background/90 to-background/95 before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:via-transparent before:to-primary/5 before:opacity-50">
			<TopIconBar />

			{/* Documents Section - Scrollable */}
			<div className="flex-1 overflow-y-auto min-h-0 relative z-10">
				<div className="p-3">
					<div className="text-xs font-semibold text-foreground/70 tracking-wider mb-3 uppercase">
						{activeWorkspace?.name || "Documents"}
					</div>
					{activeWorkspace ? (
						<WorkspaceDocumentTree
							onDocumentSelect={onDocumentSelect}
							selectedDocumentId={selectedDocumentId}
						/>
					) : (
						<div className="text-center py-8">
							<div className="text-sm text-muted-foreground">
								Select a workspace to view documents
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Bottom Collapsible Sections */}
			<div className="relative z-10 px-3 pb-3 backdrop-blur-sm">
				<CollapsibleSection title="Sources">
					{activeWorkspace ? (
						<WorkspaceSourcesList
							onSourceSelect={onSourceSelect}
							selectedSourceId={selectedSourceId}
							onInsertSource={onInsertSource}
							onUseAsAIContext={onUseAsAIContext}
						/>
					) : (
						<div className="text-center py-4">
							<div className="text-xs text-muted-foreground">
								Select a workspace to view sources
							</div>
						</div>
					)}
				</CollapsibleSection>

				<CollapsibleSection title="Snippets">
					{activeWorkspace ? (
						<WorkspaceSnippetsList
							onSnippetSelect={onSnippetSelect}
							selectedSnippetId={selectedSnippetId}
							onInsertSnippet={onInsertSnippet}
							onUseAsAIContext={onUseAsAIContext}
						/>
					) : (
						<div className="text-center py-4">
							<div className="text-xs text-muted-foreground">
								Select a workspace to view snippets
							</div>
						</div>
					)}
				</CollapsibleSection>
			</div>
			<WorkspaceDropdown />
		</div>
	);
}
