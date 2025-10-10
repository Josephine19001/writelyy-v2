import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const listSnippets = protectedProcedure
	.route({
		method: "GET",
		path: "/snippets",
		tags: ["Snippets"],
		summary: "List snippets",
		description: "Get all snippets in the workspace with optional filtering",
	})
	.input(
		z.object({
			organizationId: z.string(),
			category: z.string().optional(),
			search: z.string().optional(),
			tags: z.array(z.string()).optional(),
			limit: z.number().min(1).max(100).optional(),
			offset: z.number().min(0).optional(),
			isPublic: z.boolean().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const {
			organizationId,
			category,
			search,
			tags,
			limit = 50,
			offset = 0,
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

		// Build where clause
		const where: any = {
			organizationId,
		};

		if (category) {
			where.category = category;
		}

		if (isPublic !== undefined) {
			where.isPublic = isPublic;
		}

		if (search) {
			where.OR = [
				{
					title: {
						contains: search,
						mode: "insensitive",
					},
				},
				{
					content: {
						contains: search,
						mode: "insensitive",
					},
				},
			];
		}

		if (tags && tags.length > 0) {
			where.tags = {
				hasSome: tags,
			};
		}

		const [snippets, total] = await Promise.all([
			db.snippet.findMany({
				where,
				include: {
					creator: {
						select: {
							id: true,
							name: true,
							email: true,
							image: true,
						},
					},
					_count: {
						select: {
							documentSnippets: true,
						},
					},
				},
				orderBy: {
					updatedAt: "desc",
				},
				take: limit,
				skip: offset,
			}),
			db.snippet.count({ where }),
		]);

		const hasMore = offset + snippets.length < total;

		return { snippets, total, hasMore };
	});