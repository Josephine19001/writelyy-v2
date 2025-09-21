import { getActiveWorkspace } from "@saas/auth/lib/server";
import { WorkspaceEditor } from "@saas/shared/components/WorkspaceEditor";
import { notFound } from "next/navigation";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;

	const activeWorkspace = await getActiveWorkspace(workspaceSlug as string);

	return {
		title: activeWorkspace?.name || "Workspace",
	};
}

export default async function WorkspacePage({
	params,
}: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;

	const activeWorkspace = await getActiveWorkspace(workspaceSlug as string);

	if (!activeWorkspace) {
		return notFound();
	}

	// Return the workspace editor that can interact with the sidebar
	return <WorkspaceEditor />;
}
