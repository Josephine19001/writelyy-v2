import { db } from "@repo/database";
import { getAvailableCredits, getCreditLimitForPlan } from "@repo/database/lib/credits";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { protectedProcedure } from "../../../orpc/procedures";

export const getUserCredits = protectedProcedure
	.route({
		method: "GET",
		path: "/users/credits",
		tags: ["Users"],
		summary: "Get user credits",
		description: "Get the current user's credit balance and usage information",
	})
	.handler(async ({ context }) => {
		const { user } = context;
		// Get user's purchases to determine their plan
		const purchases = await db.purchase.findMany({
			where: {
				userId: user.id,
			},
		});

		const { activePlan } = createPurchasesHelper(purchases);
		const planId = activePlan?.id ?? "free";

		// Get credit information
		const creditInfo = await getAvailableCredits(user.id);
		const planLimit = getCreditLimitForPlan(planId);

		return {
			...creditInfo,
			planId,
			planLimit,
			percentageUsed: creditInfo.total > 0
				? Math.round((creditInfo.used / creditInfo.total) * 100)
				: 0,
		};
	});
