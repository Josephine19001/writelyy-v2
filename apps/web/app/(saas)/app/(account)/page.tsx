import { config } from "@repo/config";
import { getWorkspaceList, getSession } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import UserStart from "@saas/start/UserStart";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function AppStartPage() {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	const workspaces = await getWorkspaceList();

	if (
		config.workspaces.enable &&
		config.workspaces.requireWorkspace
	) {
		const workspace =
			workspaces.find(
				(org) => org.id === session?.session.activeOrganizationId,
			) || workspaces[0];

		if (!workspace) {
			redirect("/new-workspace");
		}

		redirect(`/app/${workspace.slug}`);
	}

	const t = await getTranslations();

	return (
		<div className="">
			<PageHeader
				title={t("start.welcome", { name: session?.user.name })}
				subtitle={t("start.subtitle")}
			/>

			<UserStart />
		</div>
	);
}
