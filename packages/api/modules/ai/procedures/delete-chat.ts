import { ORPCError } from "@orpc/client";
import { deleteAiChat, getAiChatById } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const deleteChat = protectedProcedure
	.route({
		method: "DELETE",
		path: "/ai/chats/{id}",
		tags: ["AI"],
		summary: "Delete chat",
		description: "Delete a chat by id",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id } = input;
		const user = context.user;

		const chat = await getAiChatById(id);

		if (!chat) {
			throw new ORPCError("NOT_FOUND");
		}

		if (chat.workspaceId) {
			const membership = await verifyWorkspaceMembership(
				chat.workspaceId,
				user.id,
			);

			if (!membership) {
				throw new ORPCError("FORBIDDEN");
			}
		} else if (chat.userId !== context.user.id) {
			throw new ORPCError("FORBIDDEN");
		}

		await deleteAiChat(id);

		return { success: true };
	});
