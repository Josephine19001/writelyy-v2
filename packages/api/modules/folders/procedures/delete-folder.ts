import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const deleteFolder = protectedProcedure
	.route({
		method: "DELETE",
		path: "/folders/{id}",
		tags: ["Folders"],
		summary: "Delete folder",
		description: "Delete a folder and optionally its contents",
	})
	.input(
		z.object({
			id: z.string(),
			deleteContents: z.boolean().default(false),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id, deleteContents } = input;
		const user = context.user;

		// Get current folder with counts
		const folder = await db.folder.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						subFolders: true,
						documents: true,
					},
				},
			},
		});

		if (!folder) {
			throw new ORPCError("NOT_FOUND", { message: "Folder not found" });
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(folder.organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Check if folder has contents
		const hasContents = folder._count.subFolders > 0 || folder._count.documents > 0;

		if (hasContents && !deleteContents) {
			throw new ORPCError("BAD_REQUEST", { 
				message: "Folder contains documents or subfolders. Set deleteContents to true to force deletion." 
			});
		}

		if (deleteContents) {
			// Move contents to parent folder or root
			await db.$transaction(async (tx) => {
				// Move documents to parent folder
				await tx.document.updateMany({
					where: { folderId: id },
					data: { folderId: folder.parentFolderId },
				});

				// Move subfolders to parent folder
				await tx.folder.updateMany({
					where: { parentFolderId: id },
					data: { parentFolderId: folder.parentFolderId },
				});

				// Delete the folder
				await tx.folder.delete({
					where: { id },
				});
			});
		} else {
			// Delete empty folder
			await db.folder.delete({
				where: { id },
			});
		}

		return { success: true };
	});