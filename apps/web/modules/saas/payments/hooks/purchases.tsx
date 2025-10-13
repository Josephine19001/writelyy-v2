import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { orpcClient } from "@shared/lib/orpc-client";
import { useQuery } from "@tanstack/react-query";

export const usePurchases = (workspaceId?: string) => {
	const { data } = useQuery({
		queryKey: ['payments', 'listPurchases', workspaceId],
		queryFn: async () => {
			return await orpcClient.payments.listPurchases({
				organizationId: workspaceId,
			});
		},
		// Disable retries for unauthorized errors
		retry: (failureCount, error: any) => {
			if (error?.message === "Unauthorized") {
				return false;
			}
			return failureCount < 3;
		},
		// Don't throw on error, just return empty data
		throwOnError: false,
		// Only run if we have a workspaceId or it's undefined (for user purchases)
		enabled: workspaceId !== null,
	});

	const purchases = data?.purchases ?? [];

	const { activePlan, hasSubscription, hasPurchase } =
		createPurchasesHelper(purchases);

	return { purchases, activePlan, hasSubscription, hasPurchase };
};

export const useUserPurchases = () => usePurchases();

export const useWorkspacePurchases = (workspaceId: string) =>
	usePurchases(workspaceId);
