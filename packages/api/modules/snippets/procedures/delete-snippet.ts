import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const deleteSnippet = protectedProcedure
	.route({
		method: "DELETE",
		path: "/snippets/{id}",
		tags: ["Snippets"],
		summary: "Delete snippet",
		description: "Delete a snippet",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id } = input;
		const user = context.user;

		// First check if snippet exists and user has access
		const existingSnippet = await db.snippet.findUnique({
			where: { id },
		});

		if (!existingSnippet) {
			throw new ORPCError("NOT_FOUND", {
				message: "Snippet not found",
			});
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(
			existingSnippet.organizationId,
			user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Check if user can delete (creator or admin)
		if (existingSnippet.createdBy !== user.id && membership.role !== "admin") {
			throw new ORPCError("FORBIDDEN", {
				message: "You can only delete your own snippets",
			});
		}

		await db.snippet.delete({
			where: { id },
		});

		return { success: true };
	});