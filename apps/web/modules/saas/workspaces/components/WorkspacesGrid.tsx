"use client";

import { config } from "@repo/config";
import { WorkspaceLogo } from "@saas/workspaces/components/WorkspaceLogo";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useWorkspaceListQuery } from "@saas/workspaces/lib/api";
import { Card } from "@ui/components/card";
import { ChevronRightIcon, PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function WorkspacesGrid() {
	const t = useTranslations();
	const { setActiveWorkspace } = useActiveWorkspace();
	const { data: allWorkspaces } = useWorkspaceListQuery();

	return (
		<div className="@container">
			<h2 className="mb-2 font-semibold text-lg">
				{t("workspaces.workspacesGrid.title")}
			</h2>
			<div className="grid @2xl:grid-cols-3 @lg:grid-cols-2 grid-cols-1 gap-4">
				{allWorkspaces?.map((workspace) => (
					<Card
						key={workspace.id}
						className="flex cursor-pointer items-center gap-4 overflow-hidden p-4"
						onClick={() => setActiveWorkspace(workspace.slug)}
					>
						<WorkspaceLogo
							name={workspace.name}
							logoUrl={workspace.logo}
							className="size-12"
						/>
						<span className="flex items-center gap-1 text-base leading-tight">
							<span className="block font-medium">
								{workspace.name}
							</span>
							<ChevronRightIcon className="size-4" />
						</span>
					</Card>
				))}

				{config.workspaces.enableUsersToCreateWorkspaces && (
					<Link
						href="/new-workspace"
						className="flex h-full items-center justify-center gap-2 rounded-2xl bg-primary/5 p-4 text-primary transition-colors duration-150 hover:bg-primary/10"
					>
						<PlusCircleIcon />
						<span className="font-medium text-sm">
							{t("workspaces.workspacesGrid.createNewWorkspace")}
						</span>
					</Link>
				)}
			</div>
		</div>
	);
}
