import type { WorkspaceMemberRole } from "@repo/auth";
import { useWorkspaceMemberRoles } from "@saas/workspaces/hooks/member-roles";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";

export function WorkspaceRoleSelect({
	value,
	onSelect,
	disabled,
}: {
	value: WorkspaceMemberRole;
	onSelect: (value: WorkspaceMemberRole) => void;
	disabled?: boolean;
}) {
	const workspaceMemberRoles = useWorkspaceMemberRoles();

	const roleOptions = Object.entries(workspaceMemberRoles).map(
		([value, label]) => ({
			value,
			label,
		}),
	);

	return (
		<Select value={value} onValueChange={onSelect} disabled={disabled}>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{roleOptions.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
