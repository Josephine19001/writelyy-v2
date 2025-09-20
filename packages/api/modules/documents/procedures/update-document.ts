import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const updateDocument = protectedProcedure
	.route({
		method: "PATCH",
		path: "/documents/{id}",
		tags: ["Documents"],
		summary: "Update document",
		description: "Update a document's content and metadata",
	})
	.input(
		z.object({
			id: z.string(),
			title: z.string().optional(),
			content: z.any().optional(),
			description: z.string().optional(),
			tags: z.array(z.string()).optional(),
			folderId: z.string().nullable().optional(),
			createVersion: z.boolean().default(false),
		}),
	)
	.handler(async ({ input, context }) => {
		const { id, title, content, description, tags, folderId, createVersion } = input;
		const user = context.user;

		// Get current document
		const currentDocument = await db.document.findUnique({
			where: { id },
			include: {
				versions: {
					orderBy: { version: "desc" },
					take: 1,
				},
			},
		});

		if (!currentDocument) {
			throw new ORPCError("NOT_FOUND", { message: "Document not found" });
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(currentDocument.organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Verify folder belongs to workspace if provided
		if (folderId) {
			const folder = await db.folder.findFirst({
				where: {
					id: folderId,
					organizationId: currentDocument.organizationId,
				},
			});

			if (!folder) {
				throw new ORPCError("NOT_FOUND", { message: "Folder not found" });
			}
		}

		// Create version if requested and content changed
		if (createVersion && content && JSON.stringify(content) !== JSON.stringify(currentDocument.content)) {
			const latestVersion = currentDocument.versions[0];
			const nextVersion = latestVersion ? latestVersion.version + 1 : 1;

			await db.documentVersion.create({
				data: {
					documentId: id,
					content: currentDocument.content as any,
					version: nextVersion,
					createdBy: user.id,
				},
			});
		}

		// Generate slug if title changed
		let slug = currentDocument.slug;
		if (title && title !== currentDocument.title) {
			const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
			slug = baseSlug;
			let counter = 1;

			while (await db.document.findFirst({
				where: { 
					organizationId: currentDocument.organizationId, 
					slug,
					id: { not: id }
				}
			})) {
				slug = `${baseSlug}-${counter}`;
				counter++;
			}
		}

		// Calculate word count if content provided
		let wordCount = currentDocument.wordCount;
		let extractedText = currentDocument.extractedText;
		
		if (content) {
			extractedText = typeof content === 'object' ? JSON.stringify(content) : content;
			wordCount = (extractedText || '').split(/\s+/).filter(word => word.length > 0).length;
		}

		const document = await db.document.update({
			where: { id },
			data: {
				...(title && { title, slug }),
				...(content && { content, extractedText, wordCount }),
				...(description !== undefined && { description }),
				...(tags && { tags }),
				...(folderId !== undefined && { folderId }),
				lastEditedBy: user.id,
				updatedAt: new Date(),
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
				lastEditor: {
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