import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const createFolder = protectedProcedure
	.route({
		method: "POST",
		path: "/folders",
		tags: ["Folders"],
		summary: "Create folder",
		description: "Create a new folder in the workspace",
	})
	.input(
		z.object({
			name: z.string().min(1),
			organizationId: z.string(),
			parentFolderId: z.string().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { name, organizationId, parentFolderId } = input;
		const user = context.user;

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify parent folder belongs to workspace if provided
		if (parentFolderId) {
			const parentFolder = await db.folder.findFirst({
				where: {
					id: parentFolderId,
					organizationId,
				},
			});

			if (!parentFolder) {
				throw new ORPCError("NOT_FOUND", { message: "Parent folder not found" });
			}
		}

		// Check for duplicate folder name in same parent
		const existingFolder = await db.folder.findFirst({
			where: {
				name,
				organizationId,
				parentFolderId,
			},
		});

		if (existingFolder) {
			throw new ORPCError("CONFLICT", { message: "Folder with this name already exists in this location" });
		}

		const folder = await db.folder.create({
			data: {
				name,
				organizationId,
				parentFolderId,
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
				parentFolder: true,
				_count: {
					select: {
						subFolders: true,
						documents: true,
					},
				},
			},
		});

		return { folder };
	});