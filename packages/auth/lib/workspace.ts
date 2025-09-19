import { getWorkspaceWithPurchasesAndMembersCount } from "@repo/database";
import { logger } from "@repo/logs";
import { setSubscriptionSeats } from "@repo/payments";

export async function updateSeatsInWorkspaceSubscription(workspaceId: string) {
	const workspace =
		await getWorkspaceWithPurchasesAndMembersCount(workspaceId);

	if (!workspace?.purchases.length) {
		return;
	}

	const activeSubscription = workspace.purchases.find(
		(purchase) => purchase.type === "SUBSCRIPTION",
	);

	if (!activeSubscription?.subscriptionId) {
		return;
	}

	try {
		await setSubscriptionSeats({
			id: activeSubscription.subscriptionId,
			seats: workspace.membersCount,
		});
	} catch (error) {
		logger.error("Could not update seats in workspace subscription", {
			workspaceId,
			error,
		});
	}
}
