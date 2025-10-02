"use client";

import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { CollapsibleSection } from "./sidebar/CollapsibleSection";
import { TopIconBar } from "./sidebar/TopIconBar";
import { WorkspaceDropdown } from "./sidebar/WorkspaceDropdown";
import { WorkspaceDocumentTree } from "./workspace/WorkspaceDocumentTree";
import { WorkspaceSourcesList } from "./workspace/WorkspaceSourcesList";

interface LeftSidebarProps {
	onDocumentSelect?: (document: any) => void;
	onSourceSelect?: (sourceId: string) => void;
	selectedDocumentId?: string;
	selectedSourceId?: string;
	onInsertSource?: (source: any) => void;
	onUseAsAIContext?: (source: any) => void;
}

export function LeftSidebar({
	onDocumentSelect,
	onSourceSelect,
	selectedDocumentId,
	selectedSourceId,
	onInsertSource,
	onUseAsAIContext,
}: LeftSidebarProps) {
	const { activeWorkspace } = useActiveWorkspace();

	return (
		<div className="flex flex-col h-full">
			<TopIconBar />

			{/* Documents Section - Scrollable */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="p-3">
					<div className="text-xs font-medium text-muted-foreground mb-2">
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
			<div className="border-b bg-background">
				<CollapsibleSection title="Sources" defaultOpen={false}>
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
			</div>
			<WorkspaceDropdown />
		</div>
	);
}
