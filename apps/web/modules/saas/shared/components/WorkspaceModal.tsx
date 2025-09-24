"use client";

import { config } from "@repo/config";
import { WorkspaceLogo } from "@saas/workspaces/components/WorkspaceLogo";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useWorkspaceListQuery } from "@saas/workspaces/lib/api";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import {
	ChevronRightIcon,
	PlusCircleIcon,
	SearchIcon,
	XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

interface WorkspaceModalProps {
	isOpen: boolean;
	onClose: () => void;
}

type SortOption = "name" | "recent";

export function WorkspaceModal({ isOpen, onClose }: WorkspaceModalProps) {
	const { setActiveWorkspace } = useActiveWorkspace();
	const { data: allWorkspaces, isLoading } = useWorkspaceListQuery();
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<SortOption>("recent");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [loadingWorkspaceId, setLoadingWorkspaceId] = useState<string | null>(null);

	const filteredAndSortedWorkspaces = useMemo(() => {
		if (!allWorkspaces) return [];

		let filtered = allWorkspaces;

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = allWorkspaces.filter((workspace) =>
				workspace.name.toLowerCase().includes(query),
			);
		}

		// Apply sorting
		const sorted = [...filtered].sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.name.localeCompare(b.name);
				case "recent":
				default:
					// For now, keep original order (recent is the default from API)
					return 0;
			}
		});

		return sorted;
	}, [allWorkspaces, searchQuery, sortBy]);

	const handleWorkspaceSelect = async (workspaceSlug: string, workspaceId: string) => {
		setLoadingWorkspaceId(workspaceId);
		try {
			await setActiveWorkspace(workspaceSlug);
			onClose();
		} catch (error) {
			console.error("Failed to switch workspace:", error);
			// Loading will be cleared in finally block, no need for toast since user will see the URL didn't change
		} finally {
			setLoadingWorkspaceId(null);
		}
	};

	const clearSearch = () => {
		setSearchQuery("");
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="max-w-2xl h-[80vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>All Workspaces</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-4 flex-1 min-h-0">
						{/* Search and Filter Controls */}
						<div className="flex gap-3 flex-col sm:flex-row">
							<div className="relative flex-1">
								<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									placeholder="Search workspaces..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									className="pl-10 pr-10"
								/>
								{searchQuery && (
									<Button
										variant="ghost"
										size="sm"
										className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
										onClick={clearSearch}
									>
										<XIcon className="size-3" />
									</Button>
								)}
							</div>

							<div className="flex gap-2">
								<Button
									variant={
										sortBy === "recent"
											? "secondary"
											: "outline"
									}
									size="sm"
									onClick={() => setSortBy("recent")}
									className="text-xs"
								>
									Recent
								</Button>
								<Button
									variant={
										sortBy === "name"
											? "secondary"
											: "outline"
									}
									size="sm"
									onClick={() => setSortBy("name")}
									className="text-xs"
								>
									Name
								</Button>
							</div>
						</div>

						{/* Results */}
						<div className="flex-1 overflow-auto">
							{isLoading ? (
								<div className="flex items-center justify-center py-12">
									<div className="text-center">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
										<p className="text-muted-foreground">
											Loading workspaces...
										</p>
									</div>
								</div>
							) : filteredAndSortedWorkspaces.length === 0 ? (
								<div className="flex items-center justify-center py-12 text-center">
									<div className="text-center">
										<SearchIcon className="size-12 text-muted-foreground mx-auto mb-4" />
										<h3 className="font-medium text-lg mb-2">
											{searchQuery
												? "No workspaces found"
												: "No workspaces available"}
										</h3>
										<p className="text-muted-foreground mb-4">
											{searchQuery
												? `No workspaces match "${searchQuery}"`
												: "You don't have access to any workspaces yet."}
										</p>
										{searchQuery && (
											<div>
												<Button
													variant="outline"
													onClick={clearSearch}
												>
													Clear search
												</Button>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className="grid gap-3">
									{filteredAndSortedWorkspaces.map(
										(workspace) => (
											<Card
												key={workspace.id}
												className="flex cursor-pointer items-center gap-4 p-4 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
												onClick={() =>
													loadingWorkspaceId !== workspace.id &&
													handleWorkspaceSelect(
														workspace.slug,
														workspace.id
													)
												}
											>
												<WorkspaceLogo
													name={workspace.name}
													logoUrl={workspace.logo}
													className="size-12"
												/>
												<div className="flex-1">
													<h3 className="font-medium text-base">
														{workspace.name}
													</h3>
													<p className="text-sm text-muted-foreground mt-1">
														Workspace
													</p>
												</div>
												{loadingWorkspaceId === workspace.id ? (
													<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
												) : (
													<ChevronRightIcon className="size-4 text-muted-foreground" />
												)}
											</Card>
										),
									)}
								</div>
							)}
						</div>

						{/* Create New Workspace Button */}
						{config.workspaces.enableUsersToCreateWorkspaces && (
							<div className="border-t pt-4">
								<Button
									className="w-full gap-2"
									onClick={() => setIsCreateModalOpen(true)}
								>
									<PlusCircleIcon className="size-4" />
									Create New Workspace
								</Button>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>

			<CreateWorkspaceModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</>
	);
}
