"use client";

import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { TopIconBar } from "./sidebar/TopIconBar";
import { WorkspaceDropdown } from "./sidebar/WorkspaceDropdown";
import { WorkspaceDocumentTree } from "./workspace/WorkspaceDocumentTree";

interface LeftSidebarProps {
	onDocumentSelect?: (document: any) => void;
	selectedDocumentId?: string;
}

export function LeftSidebar({
	onDocumentSelect,
	selectedDocumentId,
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

			<WorkspaceDropdown />
		</div>
	);
}
