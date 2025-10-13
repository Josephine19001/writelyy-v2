import { orpcClient } from "@shared/lib/orpc-client";
import { cache } from "react";

export const getPurchases = cache(async (workspaceId?: string) => {
	const { purchases } = await orpcClient.payments.listPurchases({
		organizationId: workspaceId,
	});

	return purchases;
});
