import { SettingsList } from "@saas/shared/components/SettingsList";
import { DeleteWorkspaceForm } from "@saas/workspaces/components/DeleteWorkspaceForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("workspaces.settings.dangerZone.title"),
	};
}

export default function WorkspaceSettingsPage() {
	return (
		<SettingsList>
			<DeleteWorkspaceForm />
		</SettingsList>
	);
}
