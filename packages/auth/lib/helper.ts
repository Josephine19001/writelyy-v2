import type { ActiveWorkspace } from "../auth";

export function isWorkspaceAdmin(
	workspace?: ActiveWorkspace | null,
	user?: {
		id: string;
		role?: string | null;
	} | null,
) {
	const userWorkspaceRole = workspace?.members.find(
		(member) => member.userId === user?.id,
	)?.role;

	return (
		["owner", "admin"].includes(userWorkspaceRole ?? "") ||
		user?.role === "admin"
	);
}
