import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const findSource = protectedProcedure
	.route({
		method: "GET",
		path: "/sources/{id}",
		tags: ["Sources"],
		summary: "Find source",
		description: "Get a specific source by ID",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id } = input;
		const user = context.user;

		const source = await db.source.findUnique({
			where: { id },
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

		if (!source) {
			throw new ORPCError("NOT_FOUND", { message: "Source not found" });
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(source.organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		return { source };
	});