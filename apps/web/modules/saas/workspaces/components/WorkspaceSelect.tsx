"use client";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { ActivePlanBadge } from "@saas/payments/components/ActivePlanBadge";
import { CreateWorkspaceModal } from "@saas/shared/components/CreateWorkspaceModal";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useWorkspaceListQuery } from "@saas/workspaces/lib/api";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useRouter } from "@shared/hooks/router";
import { clearCache } from "@shared/lib/cache";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { WorkspaceLogo } from "./WorkspaceLogo";

export function OrganzationSelect({ className }: { className?: string }) {
	const t = useTranslations();
	const { user } = useSession();
	const router = useRouter();
	const pathname = usePathname();
	const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();
	const { data: allWorkspaces } = useWorkspaceListQuery();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const isOnAllWorkspacesRoute = pathname === "/app";

	if (!user) {
		return null;
	}

	return (
		<div className={className}>
			<DropdownMenu>
				<DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-xl border border-primary/20 bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-md hover:from-primary/5 hover:via-background/70 hover:to-primary/5 p-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all duration-300 shadow-lg shadow-primary/5">
					<div className="flex flex-1 items-center justify-start gap-2.5 text-sm overflow-hidden">
						{isOnAllWorkspacesRoute ? (
							<>
								<div className="hidden size-7 sm:flex rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center">
									<ChevronsUpDownIcon className="size-4 text-white" />
								</div>
								<span className="block flex-1 truncate font-medium">
									All Workspaces
								</span>
							</>
						) : activeWorkspace ? (
							<>
								<WorkspaceLogo
									name={activeWorkspace.name}
									logoUrl={activeWorkspace.logo}
									className="hidden size-7 sm:block"
								/>
								<span className="block flex-1 truncate font-medium">
									{activeWorkspace.name}
								</span>
								{config.workspaces.enableBilling && (
									<ActivePlanBadge
										workspaceId={activeWorkspace.id}
									/>
								)}
							</>
						) : (
							<>
								<UserAvatar
									className="hidden size-7 sm:block"
									name={user.name ?? ""}
									avatarUrl={user.image}
								/>
								<span className="block truncate font-medium">
									{t(
										"workspaces.workspaceSelect.personalAccount",
									)}
								</span>
								{config.users.enableBilling && (
									<ActivePlanBadge />
								)}
							</>
						)}
					</div>

					<ChevronsUpDownIcon className="block size-4 text-muted-foreground" />
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-full">
					{/* Commented out personal account section - workspace-only context
					{!config.workspaces.requireWorkspace && (
						<>
							<DropdownMenuRadioGroup
								value={activeWorkspace?.id ?? user.id}
								onValueChange={async (value: string) => {
									if (value === user.id) {
										await clearCache();
										router.replace("/app");
									}
								}}
							>
								<DropdownMenuLabel className="text-foreground/60 text-xs">
									{t(
										"workspaces.workspaceSelect.personalAccount",
									)}
								</DropdownMenuLabel>
								<DropdownMenuRadioItem
									value={user.id}
									className="flex cursor-pointer items-center justify-center gap-2 pl-3"
								>
									<div className="flex flex-1 items-center justify-start gap-2">
										<UserAvatar
											className="size-8"
											name={user.name ?? ""}
											avatarUrl={user.image}
										/>
										{user.name}
									</div>
								</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
							<DropdownMenuSeparator />
						</>
					)}
					*/}

					{/* All Workspaces Option */}
					<DropdownMenuGroup>
						<DropdownMenuItem
							asChild
							className="cursor-pointer text-sm"
						>
							<Link href="/app">
								<div className="flex flex-1 items-center justify-start gap-2">
									All Workspaces
								</div>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuRadioGroup
						value={activeWorkspace?.slug}
						onValueChange={async (workspaceSlug: string) => {
							await clearCache();
							setActiveWorkspace(workspaceSlug);
						}}
					>
						<DropdownMenuLabel className="text-foreground/60 text-xs">
							{t("workspaces.workspaceSelect.workspaces")}
						</DropdownMenuLabel>
						{allWorkspaces?.map((workspace) => (
							<DropdownMenuRadioItem
								key={workspace.slug}
								value={workspace.slug}
								className="flex cursor-pointer items-center justify-center gap-2 pl-3"
							>
								<div className="flex flex-1 items-center justify-start gap-2">
									{/* <WorkspaceLogo
										className="size-8"
										name={workspace.name}
										logoUrl={workspace.logo}
									/> */}
									{workspace.name}
								</div>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>

					{config.workspaces.enableUsersToCreateWorkspaces && (
						<DropdownMenuGroup>
							<DropdownMenuItem
								className="text-primary! cursor-pointer text-sm"
								onClick={() => setIsCreateModalOpen(true)}
							>
								<PlusIcon className="mr-2 size-6 rounded-md bg-primary/20 p-1" />
								{t(
									"workspaces.workspaceSelect.createNewWorkspace",
								)}
							</DropdownMenuItem>
						</DropdownMenuGroup>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<CreateWorkspaceModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</div>
	);
}
