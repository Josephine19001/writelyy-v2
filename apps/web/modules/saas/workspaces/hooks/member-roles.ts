import type { WorkspaceMemberRole } from "@repo/auth";
import { useTranslations } from "next-intl";

export function useWorkspaceMemberRoles() {
	const t = useTranslations();

	return {
		member: t("workspaces.roles.member"),
		owner: t("workspaces.roles.owner"),
		admin: t("workspaces.roles.admin"),
	} satisfies Record<WorkspaceMemberRole, string>;
}
