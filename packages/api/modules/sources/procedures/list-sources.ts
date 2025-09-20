import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const listSources = protectedProcedure
	.route({
		method: "GET",
		path: "/sources",
		tags: ["Sources"],
		summary: "List sources",
		description: "Get all sources in a workspace with optional filtering",
	})
	.input(
		z.object({
			organizationId: z.string(),
			type: z.enum(["pdf", "doc", "docx", "image", "url"]).optional(),
			processingStatus: z.enum(["pending", "processing", "completed", "failed"]).optional(),
			search: z.string().optional(),
			limit: z.number().min(1).max(100).default(50),
			offset: z.number().min(0).default(0),
		}),
	)
	.handler(async ({ input, context }) => {
		const { organizationId, type, processingStatus, search, limit, offset } = input;
		const user = context.user;

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const where: any = {
			organizationId,
		};

		if (type) {
			where.type = type;
		}

		if (processingStatus) {
			where.processingStatus = processingStatus;
		}

		if (search) {
			where.OR = [
				{ name: { contains: search, mode: "insensitive" } },
				{ extractedText: { contains: search, mode: "insensitive" } },
				{ originalFileName: { contains: search, mode: "insensitive" } },
			];
		}

		const [sources, total] = await Promise.all([
			db.source.findMany({
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
							documentSources: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				take: limit,
				skip: offset,
			}),
			db.source.count({ where }),
		]);

		return {
			sources,
			total,
			hasMore: offset + limit < total,
		};
	});