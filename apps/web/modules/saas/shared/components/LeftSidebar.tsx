"use client";

import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { CollapsibleSection } from "./sidebar/CollapsibleSection";
import { TopIconBar } from "./sidebar/TopIconBar";
import { WorkspaceDropdown } from "./sidebar/WorkspaceDropdown";
import { WorkspaceDocumentTree } from "./workspace/WorkspaceDocumentTree";
import { WorkspaceSourcesList } from "./workspace/WorkspaceSourcesList";

export function LeftSidebar() {
	const { activeWorkspace } = useActiveWorkspace();

	return (
		<div className="flex flex-col h-full">
			<TopIconBar />
			<WorkspaceDropdown />

			{/* Documents Section - Scrollable */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="p-3">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Documents
					</div>
					{activeWorkspace ? (
						<WorkspaceDocumentTree />
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
			<div className="border-t bg-background">
				<CollapsibleSection title="Sources" defaultOpen={false}>
					{activeWorkspace ? (
						<WorkspaceSourcesList />
					) : (
						<div className="text-center py-4">
							<div className="text-xs text-muted-foreground">
								Select a workspace to view sources
							</div>
						</div>
					)}
				</CollapsibleSection>
			</div>
		</div>
	);
}
