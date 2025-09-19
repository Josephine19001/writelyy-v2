import {
	getUserById,
	getWorkspaceById,
	updateUser,
	updateWorkspace,
} from "@repo/database";

export async function setCustomerIdToEntity(
	customerId: string,
	{ workspaceId, userId }: { workspaceId?: string; userId?: string },
) {
	if (workspaceId) {
		await updateWorkspace({
			id: workspaceId,
			paymentsCustomerId: customerId,
		});
	} else if (userId) {
		await updateUser({
			id: userId,
			paymentsCustomerId: customerId,
		});
	}
}

export const getCustomerIdFromEntity = async (
	props: { workspaceId: string } | { userId: string },
) => {
	if ("workspaceId" in props) {
		return (
			(await getWorkspaceById(props.workspaceId))?.paymentsCustomerId ??
			null
		);
	}

	return (await getUserById(props.userId))?.paymentsCustomerId ?? null;
};
