import { auth } from "@repo/auth";
import { getWorkspaceById } from "@repo/database";
import { AuthWrapper } from "@saas/shared/components/AuthWrapper";
import { WorkspaceInvitationModal } from "@saas/workspaces/components/WorkspaceInvitationModal";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function WorkspaceInvitationPage({
	params,
}: {
	params: Promise<{ invitationId: string }>;
}) {
	const { invitationId } = await params;

	const invitation = await auth.api.getInvitation({
		query: {
			id: invitationId,
		},
		headers: await headers(),
	});

	if (!invitation) {
		redirect("/app");
	}

	const workspace = await getWorkspaceById(invitation.workspaceId);

	return (
		<AuthWrapper>
			<WorkspaceInvitationModal
				workspaceName={invitation.workspaceName}
				workspaceSlug={invitation.workspaceSlug}
				logoUrl={workspace?.logo || undefined}
				invitationId={invitationId}
			/>
		</AuthWrapper>
	);
}
