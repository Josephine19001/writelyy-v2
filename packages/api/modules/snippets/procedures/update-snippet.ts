import { ORPCError } from "@orpc/client";
import { db } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const updateSnippet = protectedProcedure
	.route({
		method: "PUT",
		path: "/snippets/{id}",
		tags: ["Snippets"],
		summary: "Update snippet",
		description: "Update an existing snippet",
	})
	.input(
		z.object({
			id: z.string(),
			title: z.string().min(1).max(200).optional(),
			content: z.string().min(1).optional(),
			category: z.string().optional(),
			tags: z.array(z.string()).optional(),
			metadata: z.record(z.string(), z.any()).optional(),
			aiContext: z.string().optional(),
			isPublic: z.boolean().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		const {
			id,
			title,
			content,
			category,
			tags,
			metadata,
			aiContext,
			isPublic,
		} = input;
		const user = context.user;

		// First check if snippet exists and user has access
		const existingSnippet = await db.snippet.findUnique({
			where: { id },
		});

		if (!existingSnippet) {
			throw new ORPCError("NOT_FOUND", {
				message: "Snippet not found",
			});
		}

		// Verify workspace membership
		const membership = await verifyWorkspaceMembership(
			existingSnippet.organizationId,
			user.id,
		);
		if (!membership) {
			throw new ORPCError("FORBIDDEN");
		}

		// Check if user can edit (creator or admin)
		if (existingSnippet.createdBy !== user.id && membership.role !== "admin") {
			throw new ORPCError("FORBIDDEN", {
				message: "You can only edit your own snippets",
			});
		}

		const updateData: any = {};
		if (title !== undefined) {
			updateData.title = title;
		}
		if (content !== undefined) {
			updateData.content = content;
		}
		if (category !== undefined) {
			updateData.category = category;
		}
		if (tags !== undefined) {
			updateData.tags = tags;
		}
		if (metadata !== undefined) {
			updateData.metadata = metadata;
		}
		if (aiContext !== undefined) {
			updateData.aiContext = aiContext;
		}
		if (isPublic !== undefined) {
			updateData.isPublic = isPublic;
		}

		const snippet = await db.snippet.update({
			where: { id },
			data: updateData,
			include: {
				creator: {
					select: {
						id: true,
						name: true,
						email: true,
						image: true,
					},
				},
				organization: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return { snippet };
	});