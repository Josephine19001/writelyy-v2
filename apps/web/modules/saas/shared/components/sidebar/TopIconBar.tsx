"use client";

import { UserMenu } from "@saas/shared/components/UserMenu";
import { Button } from "@ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@ui/components/tooltip";
import { Search } from "lucide-react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { QuickCreateDialog } from "./QuickCreateDialog";

export function TopIconBar() {
	const { activeWorkspace } = useActiveWorkspace();
	
	return (
		<div className="flex items-center justify-between p-3 border-b bg-background">
			<div className="flex items-center space-x-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
								disabled={!activeWorkspace}
							>
								<Search className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Search workspace</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				{activeWorkspace && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<QuickCreateDialog type="document" />
							</TooltipTrigger>
							<TooltipContent>
								<p>New document</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}

				{activeWorkspace && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<QuickCreateDialog type="folder" />
							</TooltipTrigger>
							<TooltipContent>
								<p>New folder</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>

			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="h-8 w-8">
							<UserMenu />
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>User menu</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}