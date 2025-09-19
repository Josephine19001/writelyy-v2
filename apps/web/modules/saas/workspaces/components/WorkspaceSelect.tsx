"use client";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { ActivePlanBadge } from "@saas/payments/components/ActivePlanBadge";
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
import { useTranslations } from "next-intl";
import { WorkspaceLogo } from "./WorkspaceLogo";

export function OrganzationSelect({ className }: { className?: string }) {
	const t = useTranslations();
	const { user } = useSession();
	const router = useRouter();
	const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();
	const { data: allWorkspaces } = useWorkspaceListQuery();

	if (!user) {
		return null;
	}

	return (
		<div className={className}>
			<DropdownMenu>
				<DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-md border p-2 text-left outline-none focus-visible:bg-primary/10 focus-visible:ring-none">
					<div className="flex flex-1 items-center justify-start gap-2 text-sm overflow-hidden">
						{activeWorkspace ? (
							<>
								<WorkspaceLogo
									name={activeWorkspace.name}
									logoUrl={activeWorkspace.logo}
									className="hidden size-6 sm:block"
								/>
								<span className="block flex-1 truncate">
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
									className="hidden size-6 sm:block"
									name={user.name ?? ""}
									avatarUrl={user.image}
								/>
								<span className="block truncate">
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

					<ChevronsUpDownIcon className="block size-4 opacity-50" />
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
									<div className="size-8 rounded-md bg-muted flex items-center justify-center">
										<ChevronsUpDownIcon className="size-4" />
									</div>
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
									<WorkspaceLogo
										className="size-8"
										name={workspace.name}
										logoUrl={workspace.logo}
									/>
									{workspace.name}
								</div>
							</DropdownMenuRadioItem>
						))}
					</DropdownMenuRadioGroup>

					{config.workspaces.enableUsersToCreateWorkspaces && (
						<DropdownMenuGroup>
							<DropdownMenuItem
								asChild
								className="text-primary! cursor-pointer text-sm"
							>
								<Link href="/new-workspace">
									<PlusIcon className="mr-2 size-6 rounded-md bg-primary/20 p-1" />
									{t(
										"workspaces.workspaceSelect.createNewWorkspace",
									)}
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
