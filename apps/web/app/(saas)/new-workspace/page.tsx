import { config } from "@repo/config";
import { getWorkspaceList } from "@saas/auth/lib/server";
import { AuthWrapper } from "@saas/shared/components/AuthWrapper";
import { CreateWorkspaceForm } from "@saas/workspaces/components/CreateWorkspaceForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewWorkspacePage() {
	const workspaces = await getWorkspaceList();

	if (
		!config.workspaces.enable ||
		(!config.workspaces.enableUsersToCreateWorkspaces &&
			(!config.workspaces.requireWorkspace || workspaces.length > 0))
	) {
		redirect("/app");
	}

	return (
		<AuthWrapper>
			<CreateWorkspaceForm />
		</AuthWrapper>
	);
}
