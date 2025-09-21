"use client";

import { useState } from "react";
import { useWorkspaceListQuery } from "@saas/workspaces/lib/api";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Card } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { Search, Grid3X3, List, Filter, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { config } from "@repo/config";

type ViewMode = "grid" | "list";
type SortOption = "name" | "created" | "updated";

export function WorkspaceDashboard() {
	const t = useTranslations();
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const [sortBy, setSortBy] = useState<SortOption>("updated");

	const { data: allWorkspaces } = useWorkspaceListQuery();

	// Filter and sort workspaces
	const filteredWorkspaces = allWorkspaces
		?.filter((workspace) =>
			workspace.name.toLowerCase().includes(searchQuery.toLowerCase()),
		)
		.sort((a, b) => {
			switch (sortBy) {
				case "name":
					return a.name.localeCompare(b.name);
				case "created":
					return (
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime()
					);
				case "updated":
					return (
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime()
					);
				default:
					return 0;
			}
		});

	if (!allWorkspaces?.length) {
		return (
			<div className="flex flex-col items-center justify-center h-full p-8 text-center">
				<div className="max-w-md">
					<div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
						<Grid3X3 className="w-8 h-8 text-primary" />
					</div>
					<h2 className="text-2xl font-semibold mb-2">
						{t("workspaces.dashboard.noWorkspaces", {
							default: "No workspaces yet",
						})}
					</h2>
					<p className="text-muted-foreground mb-6">
						{t("workspaces.dashboard.createFirstWorkspace", {
							default:
								"Create your first workspace to get started with collaborative writing.",
						})}
					</p>
					{config.workspaces.enableUsersToCreateWorkspaces && (
						<Link href="/new-workspace">
							<Button variant="primary" size="lg">
								<Plus className="h-4 w-4 mr-2" />
								{t("workspaces.dashboard.createWorkspace", {
									default: "Create Workspace",
								})}
							</Button>
						</Link>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6 h-full overflow-y-auto">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						{t("workspaces.dashboard.title", {
							default: "Workspaces",
						})}
					</h1>
					<p className="text-muted-foreground">
						{t("workspaces.dashboard.subtitle", {
							default: "Manage and access your workspaces",
						})}
					</p>
				</div>
				{config.workspaces.enableUsersToCreateWorkspaces && (
					<Link href="/new-workspace">
						<Button variant="primary">
							<Plus className="h-4 w-4 mr-2" />
							{t("workspaces.dashboard.createNew", {
								default: "New Workspace",
							})}
						</Button>
					</Link>
				)}
			</div>

			{/* Search and Filters */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="relative flex-1 max-w-2xl">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder={t(
							"workspaces.dashboard.searchPlaceholder",
							{
								default: "Search workspaces...",
							},
						)}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>

				<div className="flex items-center gap-3">
					<div className="relative">
						<Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<select
							value={sortBy}
							onChange={(e) =>
								setSortBy(e.target.value as SortOption)
							}
							className="rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm appearance-none"
						>
							<option value="updated">
								{t("workspaces.dashboard.sortByUpdated", {
									default: "Recently Updated",
								})}
							</option>
							<option value="created">
								{t("workspaces.dashboard.sortByCreated", {
									default: "Recently Created",
								})}
							</option>
							<option value="name">
								{t("workspaces.dashboard.sortByName", {
									default: "Name",
								})}
							</option>
						</select>
					</div>

					<div className="flex items-center justify-center gap-1">
						<Button
							variant={viewMode === "grid" ? "primary" : "ghost"}
							size="sm"
							onClick={() => setViewMode("grid")}
						>
							<Grid3X3 className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === "list" ? "primary" : "ghost"}
							size="sm"
							onClick={() => setViewMode("list")}
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Workspaces Display */}
			{viewMode === "grid" ? (
				<div className="@container">
					<div className="grid @2xl:grid-cols-3 @lg:grid-cols-2 grid-cols-1 gap-4">
						{filteredWorkspaces?.map((workspace) => (
							<Card
								key={workspace.id}
								className="flex cursor-pointer items-center gap-4 overflow-hidden p-4 hover:shadow-md transition-shadow"
							>
								<Link
									href={`/app/${workspace.slug}`}
									className="flex items-center gap-4 w-full"
								>
									<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border-0">
										<span className="font-semibold text-primary">
											{workspace.name
												.charAt(0)
												.toUpperCase()}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<h3 className="font-medium truncate">
											{workspace.name}
										</h3>
										<p className="text-sm text-muted-foreground">
											Created{" "}
											{new Date(
												workspace.createdAt,
											).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric'
											})}
										</p>
									</div>
								</Link>
							</Card>
						))}
					</div>
				</div>
			) : (
				<WorkspacesList workspaces={filteredWorkspaces || []} />
			)}
		</div>
	);
}

// List view component
function WorkspacesList({ workspaces }: { workspaces: any[] }) {
	const t = useTranslations();

	if (!workspaces?.length) {
		return (
			<Card className="p-8 text-center">
				<p className="text-muted-foreground">
					{t("workspaces.dashboard.noWorkspacesFound", {
						default: "No workspaces found",
					})}
				</p>
			</Card>
		);
	}

	return (
		<Card>
			<div className="divide-y">
				{workspaces.map((workspace) => (
					<div
						key={workspace.id}
						className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
					>
						<Link
							href={`/app/${workspace.slug}`}
							className="flex items-center gap-3 flex-1"
						>
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border-0">
								<span className="font-semibold text-primary">
									{workspace.name.charAt(0).toUpperCase()}
								</span>
							</div>
							<div>
								<h3 className="font-medium">
									{workspace.name}
								</h3>
								<p className="text-sm text-muted-foreground">
									Created{" "}
									{new Date(
										workspace.createdAt,
									).toLocaleDateString()}
								</p>
							</div>
						</Link>
						<div className="flex items-center gap-2">
							<Badge status="info">
								{workspace.memberCount || 1} member
								{workspace.memberCount !== 1 ? "s" : ""}
							</Badge>
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}
