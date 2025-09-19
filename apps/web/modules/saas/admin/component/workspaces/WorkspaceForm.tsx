"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getAdminPath } from "@saas/admin/lib/links";
import { InviteMemberForm } from "@saas/workspaces/components/InviteMemberForm";
import { WorkspaceMembersBlock } from "@saas/workspaces/components/WorkspaceMembersBlock";
import {
	fullWorkspaceQueryKey,
	useCreateWorkspaceMutation,
	useFullWorkspaceQuery,
	useUpdateWorkspaceMutation,
} from "@saas/workspaces/lib/api";
import { useRouter } from "@shared/hooks/router";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const workspaceFormSchema = z.object({
	name: z.string().min(1),
});

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>;

export function WorkspaceForm({ workspaceId }: { workspaceId: string }) {
	const t = useTranslations();
	const router = useRouter();

	const { data: workspace } = useFullWorkspaceQuery(workspaceId);

	const updateWorkspaceMutation = useUpdateWorkspaceMutation();
	const createWorkspaceMutation = useCreateWorkspaceMutation();
	const queryClient = useQueryClient();

	const form = useForm<WorkspaceFormValues>({
		resolver: zodResolver(workspaceFormSchema),
		defaultValues: {
			name: workspace?.name ?? "",
		},
	});

	const onSubmit = form.handleSubmit(async ({ name }) => {
		try {
			const newWorkspace = workspace
				? await updateWorkspaceMutation.mutateAsync({
						id: workspace.id,
						name,
						updateSlug: workspace.name !== name,
					})
				: await createWorkspaceMutation.mutateAsync({
						name,
					});

			if (!newWorkspace) {
				throw new Error("Could not save workspace");
			}

			queryClient.setQueryData(
				fullWorkspaceQueryKey(workspaceId),
				newWorkspace,
			);

			queryClient.invalidateQueries({
				queryKey: orpc.admin.workspaces.list.key(),
			});

			toast.success(t("admin.workspaces.form.notifications.success"));

			if (!workspace) {
				router.replace(getAdminPath(`/workspaces/${newWorkspace.id}`));
			}
		} catch {
			toast.error(t("admin.workspaces.form.notifications.error"));
		}
	});

	return (
		<div className="grid grid-cols-1 gap-4">
			<Card>
				<CardHeader>
					<CardTitle>
						{workspace
							? t("admin.workspaces.form.updateTitle")
							: t("admin.workspaces.form.createTitle")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={onSubmit}
							className="grid grid-cols-1 gap-4"
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											{t("admin.workspaces.form.name")}
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="flex justify-end">
								<Button
									type="submit"
									loading={
										updateWorkspaceMutation.isPending ||
										createWorkspaceMutation.isPending
									}
								>
									{t("admin.workspaces.form.save")}
								</Button>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>

			{workspace && (
				<>
					<WorkspaceMembersBlock workspaceId={workspace.id} />
					<InviteMemberForm workspaceId={workspace.id} />
				</>
			)}
		</div>
	);
}
