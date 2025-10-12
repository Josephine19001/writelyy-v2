"use client";

import { UserMenu } from "@saas/shared/components/UserMenu";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { IconButton } from "@ui/components/icon-button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@ui/components/tooltip";
import { FileText, FolderPlus, Search } from "lucide-react";
import { useEditorContext } from "../NewAppWrapper";
import { useSearch } from "../search/SearchProvider";

export function TopIconBar() {
	const { activeWorkspace } = useActiveWorkspace();
	const { onInlineCreate, selectedFolderId } = useEditorContext();
	const { openSearch } = useSearch();

	return (
		<div className="flex items-center justify-between px-3 py-2.5 border-b border-primary/10 bg-background/50 backdrop-blur-md relative z-20">
			<div className="flex items-center gap-1">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<IconButton
								variant="ghost"
								size="sm"
								icon={<Search className="h-4 w-4" />}
								onClick={openSearch}
								className="h-8 w-8 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent transition-all duration-300"
							/>
						</TooltipTrigger>
						<TooltipContent>
							<p>Search workspace (⌘K)</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				{activeWorkspace && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<IconButton
									variant="ghost"
									size="sm"
									icon={<FileText className="h-4 w-4" />}
									onClick={() =>
										onInlineCreate?.(
											"document",
											selectedFolderId || undefined,
										)
									}
									className="h-8 w-8 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent transition-all duration-300"
								/>
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
								<IconButton
									variant="ghost"
									size="sm"
									icon={<FolderPlus className="h-4 w-4" />}
									onClick={() =>
										onInlineCreate?.(
											"folder",
											selectedFolderId || undefined,
										)
									}
									className="h-8 w-8 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent transition-all duration-300"
								/>
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
						<div>
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
