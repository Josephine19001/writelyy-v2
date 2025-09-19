import { ORPCError } from "@orpc/client";
import type { UIMessage } from "@repo/ai";
import { getAiChatsByUserId, getAiChatsByWorkspaceId } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const listChats = protectedProcedure
	.route({
		method: "GET",
		path: "/ai/chats",
		tags: ["AI"],
		summary: "Get chats",
		description: "Get all chats for current user or workspace",
	})
	.input(
		z
			.object({
				organizationId: z.string().optional(),
			})
			.optional(),
	)
	.handler(async ({ input, context }) => {
		if (input?.organizationId) {
			const membership = await verifyWorkspaceMembership(
				input.organizationId,
				context.user.id,
			);

			if (!membership) {
				throw new ORPCError("FORBIDDEN");
			}
		}

		const chats = await (input?.organizationId
			? getAiChatsByWorkspaceId({
					limit: 10,
					offset: 0,
					organizationId: input.organizationId,
				})
			: getAiChatsByUserId({
					limit: 10,
					offset: 0,
					userId: context.user.id,
				}));

		return {
			chats: chats.map((chat) => ({
				...chat,
				messages: (chat.messages ?? []) as unknown as UIMessage[],
			})),
		};
	});
