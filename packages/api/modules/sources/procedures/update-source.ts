import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const updateSource = protectedProcedure
	.route({
		method: "PATCH",
		path: "/sources/{id}",
		tags: ["Sources"],
		summary: "Update source",
		description: "Update source metadata (name, metadata)",
	})
	.input(
		z.object({
			id: z.string(),
			name: z.string().min(1).optional(),
			metadata: z.record(z.string(), z.any()).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id, name, metadata } = input;
		const user = context.user;

		// Find source first to verify it exists and get organization ID
		const existingSource = await db.source.findUnique({
			where: { id },
			select: {
				id: true,
				organizationId: true,
			},
		});

		if (!existingSource) {
			throw new ORPCError("NOT_FOUND", { message: "Source not found" });
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(
			existingSource.organizationId,
			user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Build update data
		const updateData: any = {};
		if (name !== undefined) {
			updateData.name = name;
		}
		if (metadata !== undefined) {
			updateData.metadata = metadata;
		}

		// Update the source
		const source = await db.source.update({
			where: { id },
			data: updateData,
			include: {
				creator: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
				documentSources: {
					include: {
						document: {
							select: {
								id: true,
								title: true,
								slug: true,
							},
						},
					},
				},
			},
		});

		return { source };
	});