import { getWorkspaceMembership } from "@repo/database";

export async function verifyWorkspaceMembership(
	workspaceId: string,
	userId: string,
) {
	const membership = await getWorkspaceMembership(workspaceId, userId);

	if (!membership) {
		return null;
	}

	return {
		workspace: membership.workspace,
		role: membership.role,
	};
}
