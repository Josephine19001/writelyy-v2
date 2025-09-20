import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const listDocuments = protectedProcedure
	.route({
		method: "GET",
		path: "/documents",
		tags: ["Documents"],
		summary: "List documents",
		description: "Get all documents in a workspace with optional filtering",
	})
	.input(
		z.object({
			organizationId: z.string(),
			folderId: z.string().optional(),
			isTemplate: z.boolean().optional(),
			search: z.string().optional(),
			limit: z.number().min(1).max(100).default(50),
			offset: z.number().min(0).default(0),
		}),
	)
	.handler(async ({ input, context }) => {
		const { organizationId, folderId, isTemplate, search, limit, offset } = input;
		const user = context.user;

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const where: any = {
			organizationId,
		};

		if (folderId !== undefined) {
			where.folderId = folderId;
		}

		if (isTemplate !== undefined) {
			where.isTemplate = isTemplate;
		}

		if (search) {
			where.OR = [
				{ title: { contains: search, mode: "insensitive" } },
				{ description: { contains: search, mode: "insensitive" } },
				{ extractedText: { contains: search, mode: "insensitive" } },
			];
		}

		const [documents, total] = await Promise.all([
			db.document.findMany({
				where,
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
					_count: {
						select: {
							comments: true,
							versions: true,
						},
					},
				},
				orderBy: {
					updatedAt: "desc",
				},
				take: limit,
				skip: offset,
			}),
			db.document.count({ where }),
		]);

		return {
			documents,
			total,
			hasMore: offset + limit < total,
		};
	});