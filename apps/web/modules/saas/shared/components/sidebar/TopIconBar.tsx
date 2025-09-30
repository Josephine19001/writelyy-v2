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
		<div className="flex items-center justify-between px-3 py-1 border-b bg-background">
			<div className="flex items-center space-x-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<IconButton
								variant="ghost"
								size="xs"
								icon={<Search />}
								onClick={openSearch}
								className="py-0"
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
									size="xs"
									icon={<FileText />}
									onClick={() =>
										onInlineCreate?.(
											"document",
											selectedFolderId || undefined,
										)
									}
									className="py-0"
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
									size="xs"
									icon={<FolderPlus />}
									onClick={() =>
										onInlineCreate?.(
											"folder",
											selectedFolderId || undefined,
										)
									}
									className="py-0"
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
