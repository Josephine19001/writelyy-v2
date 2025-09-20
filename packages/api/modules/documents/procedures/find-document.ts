import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const findDocument = protectedProcedure
	.route({
		method: "GET",
		path: "/documents/{id}",
		tags: ["Documents"],
		summary: "Find document",
		description: "Get a specific document by ID",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id } = input;
		const user = context.user;

		const document = await db.document.findUnique({
			where: { id },
			include: {
				folder: true,
				creator: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
				lastEditor: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
				documentSources: {
					include: {
						source: true,
					},
				},
				comments: {
					include: {
						author: {
							select: {
								id: true,
								name: true,
								email: true,
								image: true,
							},
						},
					},
					orderBy: {
						createdAt: "desc",
					},
				},
				shares: true,
				_count: {
					select: {
						versions: true,
					},
				},
			},
		});

		if (!document) {
			throw new ORPCError("NOT_FOUND", { message: "Document not found" });
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(document.organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		return { document };
	});