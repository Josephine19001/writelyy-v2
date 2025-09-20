import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const createSource = protectedProcedure
	.route({
		method: "POST",
		path: "/sources",
		tags: ["Sources"],
		summary: "Create source",
		description: "Create a new source (file, image, or URL) in the workspace",
	})
	.input(
		z.object({
			name: z.string().min(1),
			organizationId: z.string(),
			type: z.enum(["pdf", "doc", "docx", "image", "url"]),
			url: z.string().optional(),
			filePath: z.string().optional(),
			originalFileName: z.string().optional(),
			metadata: z.record(z.any()).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const { name, organizationId, type, url, filePath, originalFileName, metadata } = input;
		const user = context.user;

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(organizationId, user.id);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Validate input based on type
		if (type === "url" && !url) {
			throw new ORPCError("BAD_REQUEST", { message: "URL is required for URL sources" });
		}

		if (type !== "url" && !filePath) {
			throw new ORPCError("BAD_REQUEST", { message: "File path is required for file sources" });
		}

		const source = await db.source.create({
			data: {
				name,
				organizationId,
				type,
				url,
				filePath,
				originalFileName,
				metadata: (metadata || {}) as any,
				createdBy: user.id,
				processingStatus: "pending",
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
			},
		});

		// TODO: Trigger background processing for text extraction
		// This would typically involve:
		// - For PDFs: Extract text using pdf-parse or similar
		// - For DOCs: Extract text using mammoth or similar  
		// - For images: Extract text using OCR (Tesseract)
		// - For URLs: Scrape and extract content

		return { source };
	});