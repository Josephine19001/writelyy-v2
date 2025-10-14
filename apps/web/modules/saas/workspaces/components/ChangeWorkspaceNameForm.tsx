"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@repo/auth/client";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { workspaceListQueryKey } from "@saas/workspaces/lib/api";
import { useRouter } from "@shared/hooks/router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(3),
});

type FormSchema = z.infer<typeof formSchema>;

export function ChangeWorkspaceNameForm() {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { activeWorkspace } = useActiveWorkspace();

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: activeWorkspace?.name ?? "",
		},
	});

	const onSubmit = form.handleSubmit(async ({ name }) => {
		if (!activeWorkspace) {
			return;
		}

		try {
			const { error } = await authClient.organization.update({
				organizationId: activeWorkspace.id,
				data: {
					name,
				},
			});

			if (error) {
				throw error;
			}

			toast.success(
				t("workspaces.settings.notifications.workspaceNameUpdated"),
			);

			queryClient.invalidateQueries({
				queryKey: workspaceListQueryKey,
			});
			router.refresh();
		} catch {
			toast.error(
				t("workspaces.settings.notifications.workspaceNameNotUpdated"),
			);
		}
	});

	return (
		<SettingsItem title={t("workspaces.settings.changeName.title")}>
			<form onSubmit={onSubmit}>
				<Input {...form.register("name")} />

				<div className="mt-4 flex justify-end">
					<Button
						type="submit"
						disabled={
							!(
								form.formState.isValid &&
								form.formState.dirtyFields.name
							)
						}
						loading={form.formState.isSubmitting}
					>
						{t("settings.save")}
					</Button>
				</div>
			</form>
		</SettingsItem>
	);
}
