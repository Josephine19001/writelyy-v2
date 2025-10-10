import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const linkToDocument = protectedProcedure
	.route({
		method: "POST",
		path: "/snippets/{snippetId}/documents/{documentId}",
		tags: ["Snippets"],
		summary: "Link snippet to document",
		description: "Link a snippet to a document for tracking usage",
	})
	.input(
		z.object({
			snippetId: z.string(),
			documentId: z.string(),
			context: z.enum(["inserted", "referenced", "ai-context"]).optional(),
			usage: z.record(z.string(), z.any()).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const {
			snippetId,
			documentId,
			context: linkContext,
			usage,
		} = input;
		const user = context.user;

		// Check if snippet exists and user has access
		const snippet = await db.snippet.findUnique({
			where: { id: snippetId },
		});

		if (!snippet) {
			throw new ORPCError("NOT_FOUND", {
				message: "Snippet not found",
			});
		}

		// Check if document exists and user has access
		const document = await db.document.findUnique({
			where: { id: documentId },
		});

		if (!document) {
			throw new ORPCError("NOT_FOUND", {
				message: "Document not found",
			});
		}

		// Verify workspace membership for both snippet and document
		const snippetMembership = await verifyWorkspaceMembership(
			snippet.organizationId,
			user.id,
		);
		const documentMembership = await verifyWorkspaceMembership(
			document.organizationId,
			user.id,
		);

		if (!snippetMembership || !documentMembership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Check if they're in the same workspace
		if (snippet.organizationId !== document.organizationId) {
			throw new ORPCError("BAD_REQUEST", {
				message: "Snippet and document must be in the same workspace",
			});
		}

		// Create or update the link
		const documentSnippet = await db.documentSnippet.upsert({
			where: {
				documentId_snippetId: {
					documentId,
					snippetId,
				},
			},
			update: {
				context: linkContext,
				usage: (usage || {}) as any,
			},
			create: {
				documentId,
				snippetId,
				context: linkContext,
				usage: (usage || {}) as any,
			},
			include: {
				snippet: {
					select: {
						id: true,
						title: true,
						content: true,
					},
				},
				document: {
					select: {
						id: true,
						title: true,
					},
				},
			},
		});

		return { documentSnippet };
	});