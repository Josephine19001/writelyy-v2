import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const updateFolder = protectedProcedure
	.route({
		method: "PATCH",
		path: "/folders/{id}",
		tags: ["Folders"],
		summary: "Update folder",
		description: "Update a folder's name or move it to a different parent",
	})
	.input(
		z.object({
			id: z.string(),
			name: z.string().optional(),
			parentFolderId: z.string().nullable().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id, name, parentFolderId } = input;
		const user = context.user;

		// Get current folder
		const currentFolder = await db.folder.findUnique({
			where: { id },
		});

		if (!currentFolder) {
			throw new ORPCError("NOT_FOUND", { message: "Folder not found" });
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(currentFolder.organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify new parent folder belongs to workspace if provided
		if (parentFolderId) {
			// Prevent moving folder into itself or its descendants
			if (parentFolderId === id) {
				throw new ORPCError("BAD_REQUEST", { message: "Cannot move folder into itself" });
			}

			// Check if target parent is a descendant
			let checkFolder = await db.folder.findUnique({
				where: { id: parentFolderId },
			});

			while (checkFolder) {
				if (checkFolder.id === id) {
					throw new ORPCError("BAD_REQUEST", { message: "Cannot move folder into its own descendant" });
				}
				if (!checkFolder.parentFolderId) break;
				
				checkFolder = await db.folder.findUnique({
					where: { id: checkFolder.parentFolderId },
				});
			}

			const parentFolder = await db.folder.findFirst({
				where: {
					id: parentFolderId,
					organizationId: currentFolder.organizationId,
				},
			});

			if (!parentFolder) {
				throw new ORPCError("NOT_FOUND", { message: "Parent folder not found" });
			}
		}

		// Check for duplicate folder name in new location
		if (name || parentFolderId !== undefined) {
			const checkName = name || currentFolder.name;
			const checkParent = parentFolderId !== undefined ? parentFolderId : currentFolder.parentFolderId;

			const existingFolder = await db.folder.findFirst({
				where: {
					name: checkName,
					organizationId: currentFolder.organizationId,
					parentFolderId: checkParent,
					id: { not: id },
				},
			});

			if (existingFolder) {
				throw new ORPCError("CONFLICT", { message: "Folder with this name already exists in this location" });
			}
		}

		const folder = await db.folder.update({
			where: { id },
			data: {
				...(name && { name }),
				...(parentFolderId !== undefined && { parentFolderId }),
				updatedAt: new Date(),
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