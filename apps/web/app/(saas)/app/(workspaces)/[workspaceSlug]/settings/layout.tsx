import { isWorkspaceAdmin } from "@repo/auth/lib/helper";
import { config } from "@repo/config";
import { getActiveWorkspace, getSession } from "@saas/auth/lib/server";
import { SettingsMenu } from "@saas/settings/components/SettingsMenu";
import { PageHeader } from "@saas/shared/components/PageHeader";
import { SidebarContentLayout } from "@saas/shared/components/SidebarContentLayout";
import { WorkspaceLogo } from "@saas/workspaces/components/WorkspaceLogo";
import {
	CreditCardIcon,
	Settings2Icon,
	TriangleAlertIcon,
	Users2Icon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

export default async function SettingsLayout({
	children,
	params,
}: PropsWithChildren<{
	params: Promise<{ workspaceSlug: string }>;
}>) {
	const t = await getTranslations();
	const session = await getSession();
	const { workspaceSlug } = await params;
	const workspace = await getActiveWorkspace(workspaceSlug);

	if (!workspace) {
		redirect("/app");
	}

	const userIsWorkspaceAdmin = isWorkspaceAdmin(workspace, session?.user);

	const workspaceSettingsBasePath = `/app/${workspaceSlug}/settings`;

	const menuItems = [
		{
			title: t("settings.menu.workspace.title"),
			avatar: (
				<WorkspaceLogo name={workspace.name} logoUrl={workspace.logo} />
			),
			items: [
				{
					title: t("settings.menu.workspace.general"),
					href: `${workspaceSettingsBasePath}/general`,
					icon: <Settings2Icon className="size-4 opacity-50" />,
				},
				{
					title: t("settings.menu.workspace.members"),
					href: `${workspaceSettingsBasePath}/members`,
					icon: <Users2Icon className="size-4 opacity-50" />,
				},
				...(config.workspaces.enable &&
				config.workspaces.enableBilling &&
				userIsWorkspaceAdmin
					? [
							{
								title: t("settings.menu.workspace.billing"),
								href: `${workspaceSettingsBasePath}/billing`,
								icon: (
									<CreditCardIcon className="size-4 opacity-50" />
								),
							},
						]
					: []),
				...(userIsWorkspaceAdmin
					? [
							{
								title: t("settings.menu.workspace.dangerZone"),
								href: `${workspaceSettingsBasePath}/danger-zone`,
								icon: (
									<TriangleAlertIcon className="size-4 opacity-50" />
								),
							},
						]
					: []),
			],
		},
	];

	return (
		<>
			<PageHeader
				title={t("workspaces.settings.title")}
				subtitle={t("workspaces.settings.subtitle")}
			/>
			<SidebarContentLayout
				sidebar={<SettingsMenu menuItems={menuItems} />}
			>
				{children}
			</SidebarContentLayout>
		</>
	);
}
