"use client";

import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { WorkspaceLogo } from "../../workspaces/components/WorkspaceLogo";
import { Button } from "@ui/components/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export function CurrentWorkspaceDisplay() {
	const { activeWorkspace } = useActiveWorkspace();

	if (!activeWorkspace) {
		return (
			<div className="p-3 text-center">
				<div className="text-sm text-muted-foreground mb-2">No workspace selected</div>
				<Button asChild size="sm" className="w-full">
					<Link href="/app">
						<ExternalLink className="h-4 w-4 mr-2" />
						View All Workspaces
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="p-3">
			<div className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
				<WorkspaceLogo
					name={activeWorkspace.name}
					logoUrl={activeWorkspace.logo}
					className="size-8 flex-shrink-0"
				/>
				<div className="flex-1 min-w-0">
					<div className="font-medium text-sm truncate">
						{activeWorkspace.name}
					</div>
					<div className="text-xs text-muted-foreground truncate">
						Current workspace
					</div>
				</div>
				<Button asChild variant="ghost" size="sm" className="flex-shrink-0">
					<Link href="/app" title="View all workspaces">
						<ExternalLink className="h-3 w-3" />
					</Link>
				</Button>
			</div>
		</div>
	);
}