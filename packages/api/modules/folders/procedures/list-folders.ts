import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const listFolders = protectedProcedure
	.route({
		method: "GET",
		path: "/folders",
		tags: ["Folders"],
		summary: "List folders",
		description: "Get all folders in a workspace with hierarchical structure",
	})
	.input(
		z.object({
			organizationId: z.string(),
			parentFolderId: z.string().nullable().optional(),
			includeDocuments: z.boolean().default(false),
		}),
	)
	.handler(async ({ input, context }) => {
		const { organizationId, parentFolderId, includeDocuments } = input;
		const user = context.user;

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		const folders = await db.folder.findMany({
			where: {
				organizationId,
				parentFolderId,
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
				parentFolder: true,
				subFolders: {
					include: {
						_count: {
							select: {
								subFolders: true,
								documents: true,
							},
						},
					},
				},
				documents: includeDocuments ? {
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
				} : false,
				_count: {
					select: {
						subFolders: true,
						documents: true,
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		});

		return { folders };
	});