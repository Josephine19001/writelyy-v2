"use client";

import type { ActiveWorkspace } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { isWorkspaceAdmin } from "@repo/auth/lib/helper";
import { useSession } from "@saas/auth/hooks/use-session";
import {
	fullWorkspaceQueryKey,
	useFullWorkspaceQuery,
} from "@saas/workspaces/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Table, TableBody, TableCell, TableRow } from "@ui/components/table";
import { cn } from "@ui/lib";
import {
	CheckIcon,
	ClockIcon,
	MailXIcon,
	MoreVerticalIcon,
	XIcon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";
import { WorkspaceRoleSelect } from "./WorkspaceRoleSelect";
export function WorkspaceInvitationsList({
	workspaceId,
}: {
	workspaceId: string;
}) {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { user } = useSession();
	const formatter = useFormatter();
	const { data: workspace } = useFullWorkspaceQuery(workspaceId);

	const canUserEditInvitations = isWorkspaceAdmin(workspace, user);

	const invitations = useMemo(
		() =>
			workspace?.invitations
				?.filter((invitation) => invitation.status === "pending")
				.sort(
					(a, b) =>
						new Date(a.expiresAt).getTime() -
						new Date(b.expiresAt).getTime(),
				),
		[workspace?.invitations],
	);

	const revokeInvitation = (invitationId: string) => {
		toast.promise(
			async () => {
				const { error } = await authClient.workspace.cancelInvitation({
					invitationId,
				});

				if (error) {
					throw error;
				}
			},
			{
				loading: t(
					"workspaces.settings.members.notifications.revokeInvitation.loading.description",
				),
				success: () => {
					queryClient.invalidateQueries({
						queryKey: fullWorkspaceQueryKey(workspaceId),
					});
					return t(
						"workspaces.settings.members.notifications.revokeInvitation.success.description",
					);
				},
				error: t(
					"workspaces.settings.members.notifications.revokeInvitation.error.description",
				),
			},
		);
	};

	const columns: ColumnDef<
		NonNullable<ActiveWorkspace["invitations"]>[number]
	>[] = [
		{
			accessorKey: "email",
			accessorFn: (row) => row.email,
			cell: ({ row }) => {
				const InvitationStatusIcon = {
					pending: ClockIcon,
					accepted: CheckIcon,
					rejected: XIcon,
					canceled: XIcon,
				}[row.original.status];
				return (
					<div className="leading-normal">
						<strong
							className={cn("block", {
								"opacity-50":
									row.original.status === "canceled",
							})}
						>
							{row.original.email}
						</strong>
						<small className="flex flex-wrap gap-1 text-foreground/60">
							<span className="flex items-center gap-0.5">
								<InvitationStatusIcon className="size-3" />
								{t(
									`workspaces.settings.members.invitations.invitationStatus.${row.original.status}`,
								)}
							</span>
							<span>-</span>
							<span>
								{t(
									"workspaces.settings.members.invitations.expiresAt",
									{
										date: formatter.dateTime(
											new Date(row.original.expiresAt),
											{
												dateStyle: "medium",
												timeStyle: "short",
											},
										),
									},
								)}
							</span>
						</small>
					</div>
				);
			},
		},
		{
			accessorKey: "actions",
			cell: ({ row }) => {
				const isPending = row.original.status === "pending";

				return (
					<div className="flex flex-row justify-end gap-2">
						<WorkspaceRoleSelect
							value={row.original.role}
							disabled
							onSelect={() => {
								return;
							}}
						/>

						{canUserEditInvitations && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size="icon" variant="ghost">
										<MoreVerticalIcon className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem
										disabled={!isPending}
										onClick={() =>
											revokeInvitation(row.original.id)
										}
									>
										<MailXIcon className="mr-2 size-4" />
										{t(
											"workspaces.settings.members.invitations.revoke",
										)}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				);
			},
		},
	];

	const table = useReactTable({
		data: invitations ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	return (
		<div className="rounded-md border">
			<Table>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() && "selected"}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center"
							>
								{t(
									"workspaces.settings.members.invitations.empty",
								)}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
