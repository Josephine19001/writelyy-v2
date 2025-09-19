"use client";

import { authClient } from "@repo/auth/client";
import { getAdminPath } from "@saas/admin/lib/links";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { Pagination } from "@saas/shared/components/Pagination";
import { WorkspaceLogo } from "@saas/workspaces/components/WorkspaceLogo";
import { Spinner } from "@shared/components/Spinner";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Input } from "@ui/components/input";
import { Table, TableBody, TableCell, TableRow } from "@ui/components/table";
import { EditIcon, MoreVerticalIcon, PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { withQuery } from "ufo";
import { useDebounceValue } from "usehooks-ts";

const ITEMS_PER_PAGE = 10;

export function WorkspaceList() {
	const t = useTranslations();
	const { confirm } = useConfirmationAlert();
	const queryClient = useQueryClient();
	const [currentPage, setCurrentPage] = useQueryState(
		"currentPage",
		parseAsInteger.withDefault(1),
	);
	const [searchTerm, setSearchTerm] = useQueryState(
		"query",
		parseAsString.withDefault(""),
	);
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useDebounceValue(
		searchTerm,
		300,
		{
			leading: true,
			trailing: false,
		},
	);

	const getPathWithBackToParemeter = (path: string) => {
		const searchParams = new URLSearchParams(window.location.search);
		return withQuery(path, {
			backTo: `${window.location.pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`,
		});
	};

	const getWorkspaceEditPath = (id: string) => {
		return getPathWithBackToParemeter(getAdminPath(`/workspaces/${id}`));
	};

	useEffect(() => {
		setDebouncedSearchTerm(searchTerm);
	}, [searchTerm]);

	const { data, isLoading } = useQuery(
		orpc.admin.workspaces.list.queryOptions({
			input: {
				itemsPerPage: ITEMS_PER_PAGE,
				currentPage,
				searchTerm: debouncedSearchTerm,
			},
		}),
	);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchTerm]);

	const deleteWorkspace = async (id: string) => {
		toast.promise(
			async () => {
				const { error } = await authClient.workspace.delete({
					workspaceId: id,
				});

				if (error) {
					throw error;
				}
			},
			{
				loading: t("admin.workspaces.deleteWorkspace.deleting"),
				success: () => {
					queryClient.invalidateQueries({
						queryKey: orpc.admin.workspaces.list.key(),
					});
					return t("admin.workspaces.deleteWorkspace.deleted");
				},
				error: t("admin.workspaces.deleteWorkspace.notDeleted"),
			},
		);
	};

	const columns: ColumnDef<NonNullable<typeof data>["workspaces"][number]>[] =
		useMemo(
			() => [
				{
					accessorKey: "user",
					header: "",
					accessorFn: (row) => row.name,
					cell: ({
						row: {
							original: { id, name, logo, membersCount },
						},
					}) => (
						<div className="flex items-center gap-2">
							<WorkspaceLogo name={name} logoUrl={logo} />
							<div className="leading-tight">
								<Link
									href={getWorkspaceEditPath(id)}
									className="block font-bold"
								>
									{name}
								</Link>
								<small>
									{t("admin.workspaces.membersCount", {
										count: membersCount,
									})}
								</small>
							</div>
						</div>
					),
				},
				{
					accessorKey: "actions",
					header: "",
					cell: ({
						row: {
							original: { id },
						},
					}) => {
						return (
							<div className="flex flex-row justify-end gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size="icon" variant="ghost">
											<MoreVerticalIcon className="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem asChild>
											<Link
												href={getWorkspaceEditPath(id)}
												className="flex items-center"
											>
												<EditIcon className="mr-2 size-4" />
												{t("admin.workspaces.edit")}
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												confirm({
													title: t(
														"admin.workspaces.confirmDelete.title",
													),
													message: t(
														"admin.workspaces.confirmDelete.message",
													),
													confirmLabel: t(
														"admin.workspaces.confirmDelete.confirm",
													),
													destructive: true,
													onConfirm: () =>
														deleteWorkspace(id),
												})
											}
										>
											<span className="flex items-center text-destructive hover:text-destructive">
												<TrashIcon className="mr-2 size-4" />
												{t("admin.workspaces.delete")}
											</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						);
					},
				},
			],
			[],
		);

	const workspaces = useMemo(
		() => data?.workspaces ?? [],
		[data?.workspaces],
	);

	const table = useReactTable({
		data: workspaces,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
	});

	return (
		<Card className="p-6">
			<div className="mb-4 flex items-center justify-between gap-6">
				<h2 className="font-semibold text-2xl">
					{t("admin.workspaces.title")}
				</h2>

				<Button asChild>
					<Link href={getAdminPath("/workspaces/new")}>
						<PlusIcon className="mr-1.5 size-4" />
						{t("admin.workspaces.create")}
					</Link>
				</Button>
			</div>
			<Input
				type="search"
				placeholder={t("admin.workspaces.search")}
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="mb-4"
			/>

			<div className="rounded-md border">
				<Table>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={
										row.getIsSelected() && "selected"
									}
									className="group"
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className="py-2 group-first:rounded-t-md group-last:rounded-b-md"
										>
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
									{isLoading ? (
										<div className="flex h-full items-center justify-center">
											<Spinner className="mr-2 size-4 text-primary" />
											{t("admin.workspaces.loading")}
										</div>
									) : (
										<p>No results.</p>
									)}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{!!data?.total && data.total > ITEMS_PER_PAGE && (
				<Pagination
					className="mt-4"
					totalItems={data.total}
					itemsPerPage={ITEMS_PER_PAGE}
					currentPage={currentPage}
					onChangeCurrentPage={setCurrentPage}
				/>
			)}
		</Card>
	);
}
