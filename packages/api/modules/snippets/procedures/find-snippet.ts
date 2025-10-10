import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const findSnippet = protectedProcedure
	.route({
		method: "GET",
		path: "/snippets/{id}",
		tags: ["Snippets"],
		summary: "Get snippet",
		description: "Get a single snippet by ID",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id } = input;
		const user = context.user;

		const snippet = await db.snippet.findUnique({
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
				organization: {
					select: {
						id: true,
						name: true,
					},
				},
				documentSnippets: {
					include: {
						document: {
							select: {
								id: true,
								title: true,
							},
						},
					},
				},
			},
		});

		if (!snippet) {
			throw new ORPCError("NOT_FOUND", {
				message: "Snippet not found",
			});
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(
			snippet.organizationId,
			user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		return { snippet };
	});