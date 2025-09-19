"use client";

import { authClient } from "@repo/auth/client";
import { useConfirmationAlert } from "@saas/shared/components/ConfirmationAlertProvider";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useWorkspaceListQuery } from "@saas/workspaces/lib/api";
import { useRouter } from "@shared/hooks/router";
import { Button } from "@ui/components/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function DeleteWorkspaceForm() {
	const t = useTranslations();
	const router = useRouter();
	const { confirm } = useConfirmationAlert();
	const { refetch: reloadWorkspaces } = useWorkspaceListQuery();
	const { activeWorkspace, setActiveWorkspace } = useActiveWorkspace();

	if (!activeWorkspace) {
		return null;
	}

	const handleDelete = async () => {
		confirm({
			title: t("workspaces.settings.deleteWorkspace.title"),
			message: t("workspaces.settings.deleteWorkspace.confirmation"),
			destructive: true,
			onConfirm: async () => {
				const { error } = await authClient.workspace.delete({
					workspaceId: activeWorkspace.id,
				});

				if (error) {
					toast.error(
						t(
							"workspaces.settings.notifications.workspaceNotDeleted",
						),
					);
					return;
				}

				toast.success(
					t("workspaces.settings.notifications.workspaceDeleted"),
				);
				await setActiveWorkspace(null);
				await reloadWorkspaces();
				router.replace("/app");
			},
		});
	};

	return (
		<SettingsItem
			danger
			title={t("workspaces.settings.deleteWorkspace.title")}
			description={t("workspaces.settings.deleteWorkspace.description")}
		>
			<div className="mt-4 flex justify-end">
				<Button variant="error" onClick={handleDelete}>
					{t("workspaces.settings.deleteWorkspace.submit")}
				</Button>
			</div>
		</SettingsItem>
	);
}
