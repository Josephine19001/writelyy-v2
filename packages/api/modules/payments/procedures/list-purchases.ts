import {
	getPurchasesByUserId,
	getPurchasesByWorkspaceId,
} from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

export const listPurchases = protectedProcedure
	.route({
		method: "GET",
		path: "/payments/purchases",
		tags: ["Payments"],
		summary: "Get purchases",
		description:
			"Get all purchases of the current user or the provided workspace",
	})
	.input(
		z.object({
			workspaceId: z.string().optional(),
		}),
	)
	.handler(async ({ input: { workspaceId }, context: { user } }) => {
		if (workspaceId) {
			const purchases = await getPurchasesByWorkspaceId(workspaceId);

			return { purchases };
		}

		const purchases = await getPurchasesByUserId(user.id);

		return { purchases };
	});
