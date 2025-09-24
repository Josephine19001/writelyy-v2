"use client";

import { config } from "@repo/config";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useWorkspaceListQuery } from "@saas/workspaces/lib/api";
import { Button } from "@ui/components/button";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { WorkspaceModal } from "./WorkspaceModal";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

export function WorkspaceWelcome() {
	const { setActiveWorkspace } = useActiveWorkspace();
	const { data: allWorkspaces, isLoading } = useWorkspaceListQuery();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [loadingWorkspaceId, setLoadingWorkspaceId] = useState<string | null>(null);

	// Show recently used workspaces (first 3)
	const recentWorkspaces = allWorkspaces?.slice(0, 3) || [];

	const handleWorkspaceSelect = async (workspaceSlug: string, workspaceId: string) => {
		setLoadingWorkspaceId(workspaceId);
		try {
			await setActiveWorkspace(workspaceSlug);
		} catch (error) {
			console.error("Failed to switch workspace:", error);
			// Loading will be cleared in finally block, no need for toast since user will see the URL didn't change
		} finally {
			setLoadingWorkspaceId(null);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
					<p className="text-muted-foreground">
						Loading workspaces...
					</p>
				</div>
			</div>
		);
	}

	if (!allWorkspaces || allWorkspaces.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center max-w-lg mx-auto px-6">
					<h2 className="font-semibold text-2xl mb-3">
						No Workspaces
					</h2>
					<p className="text-muted-foreground mb-8">
						Create your first workspace to get started.
					</p>
					{config.workspaces.enableUsersToCreateWorkspaces && (
						<Button size="lg" onClick={() => setIsCreateModalOpen(true)}>
							<PlusCircleIcon className="size-4 mr-2" />
							Create Workspace
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="flex h-full items-center justify-center">
				<div className="text-left max-w-lg mx-auto px-6">
					<h1 className="font-semibold text-2xl mb-2">Open Recent</h1>
					<p className="text-muted-foreground mb-8">
						Choose a workspace to continue.
					</p>

					<div className="space-y-1 mb-8">
						{recentWorkspaces.map((workspace) => (
							<button
								key={workspace.id}
								type="button"
								className="w-full p-4 text-left hover:bg-muted rounded-lg transition-colors cursor-pointer border border-border bg-background shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() =>
									handleWorkspaceSelect(workspace.slug, workspace.id)
								}
								disabled={loadingWorkspaceId === workspace.id}
							>
								<div className="flex items-center justify-between">
									<div className="font-medium">
										{workspace.name}
									</div>
									{loadingWorkspaceId === workspace.id && (
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
									)}
								</div>
							</button>
						))}
					</div>

					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => setIsModalOpen(true)}
							className="flex-1"
						>
							View All Workspaces
						</Button>
						{config.workspaces.enableUsersToCreateWorkspaces && (
							<Button onClick={() => setIsCreateModalOpen(true)}>
								<PlusCircleIcon className="size-4 mr-2" />
								New Workspace
							</Button>
						)}
					</div>
				</div>
			</div>

			<WorkspaceModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
			<CreateWorkspaceModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</>
	);
}
