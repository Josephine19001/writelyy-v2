import { getActiveWorkspace } from "@saas/auth/lib/server";
import { PageHeader } from "@saas/shared/components/PageHeader";
import WorkspaceStart from "@saas/workspaces/components/WorkspaceStart";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;

	const activeWorkspace = await getActiveWorkspace(workspaceSlug as string);

	return {
		title: activeWorkspace?.name,
	};
}

export default async function WorkspacePage({
	params,
}: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;
	const t = await getTranslations();

	const activeWorkspace = await getActiveWorkspace(workspaceSlug as string);

	if (!activeWorkspace) {
		return notFound();
	}

	return (
		<div>
			<PageHeader
				title={activeWorkspace.name}
				subtitle={t("workspaces.start.subtitle")}
			/>

			<WorkspaceStart />
		</div>
	);
}
