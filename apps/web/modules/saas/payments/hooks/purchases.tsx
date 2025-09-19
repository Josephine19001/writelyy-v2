import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQuery } from "@tanstack/react-query";

export const usePurchases = (workspaceId?: string) => {
	const { data } = useQuery(
		orpc.payments.listPurchases.queryOptions({
			input: {
				workspaceId,
			},
		}),
	);

	const purchases = data?.purchases ?? [];

	const { activePlan, hasSubscription, hasPurchase } =
		createPurchasesHelper(purchases);

	return { purchases, activePlan, hasSubscription, hasPurchase };
};

export const useUserPurchases = () => usePurchases();

export const useWorkspacePurchases = (workspaceId: string) =>
	usePurchases(workspaceId);
