import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const deleteDocument = protectedProcedure
	.route({
		method: "DELETE",
		path: "/documents/{id}",
		tags: ["Documents"],
		summary: "Delete document",
		description: "Delete a document and all its related data",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id } = input;
		const user = context.user;

		// Get current document
		const document = await db.document.findUnique({
			where: { id },
		});

		if (!document) {
			throw new ORPCError("NOT_FOUND", { message: "Document not found" });
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(document.organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Delete document (cascade will handle related records)
		await db.document.delete({
			where: { id },
		});

		return { success: true };
	});