import { isWorkspaceAdmin } from "@repo/auth/lib/helper";
import { getActiveWorkspace, getSession } from "@saas/auth/lib/server";
import { SettingsList } from "@saas/shared/components/SettingsList";
import { InviteMemberForm } from "@saas/workspaces/components/InviteMemberForm";
import { WorkspaceMembersBlock } from "@saas/workspaces/components/WorkspaceMembersBlock";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("workspaces.settings.title"),
	};
}

export default async function WorkspaceSettingsPage({
	params,
}: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const session = await getSession();
	const { workspaceSlug } = await params;
	const workspace = await getActiveWorkspace(workspaceSlug);

	if (!workspace) {
		return notFound();
	}

	return (
		<SettingsList>
			{isWorkspaceAdmin(workspace, session?.user) && (
				<InviteMemberForm workspaceId={workspace.id} />
			)}
			<WorkspaceMembersBlock workspaceId={workspace.id} />
		</SettingsList>
	);
}
