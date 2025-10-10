import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const createSnippet = protectedProcedure
	.route({
		method: "POST",
		path: "/snippets",
		tags: ["Snippets"],
		summary: "Create snippet",
		description:
			"Create a new reusable content snippet in the workspace",
	})
	.input(
		z.object({
			title: z.string().min(1).max(200),
			content: z.string().min(1),
			organizationId: z.string(),
			category: z.string().optional(),
			tags: z.array(z.string()).optional(),
			metadata: z.record(z.string(), z.any()).optional(),
			aiContext: z.string().optional(),
			isPublic: z.boolean().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const {
			title,
			content,
			organizationId,
			category,
			tags,
			metadata,
			aiContext,
			isPublic,
		} = input;
		const user = context.user;

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(
			organizationId,
			user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const snippet = await db.snippet.create({
			data: {
				title,
				content,
				organizationId,
				category,
				tags: tags || [],
				metadata: (metadata || {}) as any,
				aiContext,
				isPublic: isPublic || false,
				createdBy: user.id,
			},
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
			},
		});

		return { snippet };
	});