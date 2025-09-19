import { ORPCError } from "@orpc/client";
import type { UIMessage } from "@repo/ai";
import { getAiChatById } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const findChat = protectedProcedure
	.route({
		method: "GET",
		path: "/ai/chats/{id}",
		tags: ["AI"],
		summary: "Get chat",
		description: "Get a chat by id",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id } = input;

		const chat = await getAiChatById(id);

		if (!chat) {
			throw new ORPCError("NOT_FOUND");
		}

		if (chat.workspaceId) {
			const membership = await verifyWorkspaceMembership(
				chat.workspaceId,
				context.user.id,
			);

			if (!membership) {
				throw new ORPCError("FORBIDDEN");
			}
		} else if (chat.userId !== context.user.id) {
			throw new ORPCError("FORBIDDEN");
		}

		return {
			chat: {
				...chat,
				messages: (chat.messages ?? []) as unknown as UIMessage[],
			},
		};
	});
