import { getActiveWorkspace } from "@saas/auth/lib/server";
import { WorkspaceEditorWithTabs } from "@saas/shared/components/WorkspaceEditorWithTabs";
import { WorkspaceCacheProvider } from "@saas/shared/components/providers/WorkspaceCacheProvider";
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

	// Return the workspace editor wrapped with necessary providers
	return (
		<WorkspaceCacheProvider>
			<WorkspaceEditorWithTabs />
		</WorkspaceCacheProvider>
	);
}
