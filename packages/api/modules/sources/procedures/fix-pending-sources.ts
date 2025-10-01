import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const fixPendingSources = protectedProcedure
	.route({
		method: "POST",
		path: "/sources/fix-pending",
		tags: ["Sources"],
		summary: "Fix pending sources",
		description: "Mark all pending file sources as completed (for uploaded files only)",
	})
	.input(
		z.object({
			organizationId: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { organizationId } = input;
		const user = context.user;

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(organizationId, user.id);
		if (!membership) {
			throw new Error("FORBIDDEN");
		}

		// Update all pending file sources (not URLs) to completed
		const result = await db.source.updateMany({
			where: {
				organizationId,
				processingStatus: "pending",
				type: {
					in: ["image", "pdf", "doc", "docx"]
				}
			},
			data: {
				processingStatus: "completed"
			}
		});

		return { updatedCount: result.count };
	});