import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const linkToDocument = protectedProcedure
	.route({
		method: "POST",
		path: "/sources/{sourceId}/link",
		tags: ["Sources"],
		summary: "Link source to document",
		description: "Create a relationship between a source and a document",
	})
	.input(
		z.object({
			sourceId: z.string(),
			documentId: z.string(),
			context: z.enum(["reference", "quote", "inspiration", "fact-check"]).optional(),
			usage: z.record(z.string(), z.any()).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { sourceId, documentId, context: linkContext, usage } = input;
		const user = context.user;

		// Verify source exists and user has access
		const source = await db.source.findUnique({
			where: { id: sourceId },
		});

		if (!source) {
			throw new ORPCError("NOT_FOUND", { message: "Source not found" });
		}

		// Verify document exists and user has access
		const document = await db.document.findUnique({
			where: { id: documentId },
		});

		if (!document) {
			throw new ORPCError("NOT_FOUND", { message: "Document not found" });
		}

		// Verify both belong to same workspace
		if (source.organizationId !== document.organizationId) {
			throw new ORPCError("BAD_REQUEST", { message: "Source and document must belong to the same workspace" });
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(source.organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Check if link already exists
		const existingLink = await db.documentSource.findUnique({
			where: {
				documentId_sourceId: {
					documentId,
					sourceId,
				},
			},
		});

		if (existingLink) {
			// Update existing link
			const documentSource = await db.documentSource.update({
				where: { id: existingLink.id },
				data: {
					context: linkContext,
					usage: (usage || {}) as any,
				},
				include: {
					source: true,
					document: {
						select: {
							id: true,
							title: true,
							slug: true,
						},
					},
				},
			});

			return { documentSource, created: false };
		}

		// Create new link
		const documentSource = await db.documentSource.create({
			data: {
				documentId,
				sourceId,
				context: linkContext,
				usage: (usage || {}) as any,
			},
			include: {
				source: true,
				document: {
					select: {
						id: true,
						title: true,
						slug: true,
					},
				},
			},
		});

		return { documentSource, created: true };
	});