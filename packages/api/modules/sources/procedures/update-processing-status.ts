import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const updateProcessingStatus = protectedProcedure
	.route({
		method: "PATCH",
		path: "/sources/{id}/processing-status",
		tags: ["Sources"],
		summary: "Update source processing status",
		description: "Update the processing status of a source",
	})
	.input(
		z.object({
			id: z.string(),
			status: z.enum(["pending", "processing", "completed", "failed"]),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id, status } = input;
		const user = context.user;

		// Find the source first
		const source = await db.source.findUnique({
			where: { id },
			select: { organizationId: true },
		});

		if (!source) {
			throw new ORPCError("NOT_FOUND", {
				message: "Source not found",
			});
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(
			source.organizationId,
			user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Update the processing status
		const updatedSource = await db.source.update({
			where: { id },
			data: { processingStatus: status },
			include: {
				creator: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
			},
		});

		return { source: updatedSource };
	});