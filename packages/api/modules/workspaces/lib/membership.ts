import { getWorkspaceMembership } from "@repo/database";

export async function verifyWorkspaceMembership(
	organizationId: string,
	userId: string,
) {
	const membership = await getWorkspaceMembership(organizationId, userId);

	if (!membership) {
		return null;
	}

	return {
		workspace: membership.organization,
		role: membership.role,
	};
}
