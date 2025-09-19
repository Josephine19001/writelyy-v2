import { SettingsList } from "@saas/shared/components/SettingsList";
import { ChangeWorkspaceNameForm } from "@saas/workspaces/components/ChangeWorkspaceNameForm";
import { WorkspaceLogoForm } from "@saas/workspaces/components/WorkspaceLogoForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("workspaces.settings.title"),
	};
}

export default function WorkspaceSettingsPage() {
	return (
		<SettingsList>
			<WorkspaceLogoForm />
			<ChangeWorkspaceNameForm />
		</SettingsList>
	);
}
