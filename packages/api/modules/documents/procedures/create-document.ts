import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const createDocument = protectedProcedure
	.route({
		method: "POST",
		path: "/documents",
		tags: ["Documents"],
		summary: "Create document",
		description: "Create a new document in the workspace",
	})
	.input(
		z.object({
			title: z.string().min(1),
			organizationId: z.string(),
			folderId: z.string().optional(),
			content: z.any().optional(),
			description: z.string().optional(),
			isTemplate: z.boolean().default(false),
		}),
	)
	.handler(async ({ input, context }) => {
		const { title, organizationId, folderId, content, description, isTemplate } = input;
		const user = context.user;

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify folder belongs to workspace if provided
		if (folderId) {
			const folder = await db.folder.findFirst({
				where: {
					id: folderId,
					organizationId,
				},
			});

			if (!folder) {
				throw new ORPCError("NOT_FOUND", { message: "Folder not found" });
			}
		}

		// Generate slug from title
		const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		let slug = baseSlug;
		let counter = 1;

		// Ensure unique slug within workspace
		while (await db.document.findFirst({
			where: { organizationId, slug }
		})) {
			slug = `${baseSlug}-${counter}`;
			counter++;
		}

		const document = await db.document.create({
			data: {
				title,
				slug,
				content: content || {},
				organizationId,
				folderId,
				description,
				isTemplate,
				createdBy: user.id,
				extractedText: typeof content === 'object' ? JSON.stringify(content) : content,
			},
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
			},
		});

		return { document };
	});