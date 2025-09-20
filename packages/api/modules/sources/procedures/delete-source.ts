import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const deleteSource = protectedProcedure
	.route({
		method: "DELETE",
		path: "/sources/{id}",
		tags: ["Sources"],
		summary: "Delete source",
		description: "Delete a source and remove its associations",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id } = input;
		const user = context.user;

		// Get current source
		const source = await db.source.findUnique({
			where: { id },
		});

		if (!source) {
			throw new ORPCError("NOT_FOUND", { message: "Source not found" });
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(source.organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Delete source (cascade will handle documentSources)
		await db.source.delete({
			where: { id },
		});

		// TODO: Also delete file from storage if it's a file-based source
		// if (source.filePath) {
		//   await deleteFile(source.filePath);
		// }

		return { success: true };
	});