import { ORPCError, streamToEventIterator } from "@orpc/client";
import { type } from "@orpc/server";
import {
	convertToModelMessages,
	streamText,
	textModel,
	type UIMessage,
} from "@repo/ai";
import { db, getAiChatById, updateAiChat } from "@repo/database";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { verifyWorkspaceMembership } from "../../workspaces/lib/membership";

export const addMessageWithContext = protectedProcedure
	.route({
		method: "POST",
		path: "/ai/chats/{chatId}/messages/with-context",
		tags: ["AI"],
		summary: "Add message to chat with workspace context",
		description: "Send message with workspace context including documents and sources",
	})
	.input(
		z.object({
			chatId: z.string(),
			messages: z.array(z.any()), // UIMessage type
			includeDocuments: z.boolean().default(true),
			includeSources: z.boolean().default(true),
			documentId: z.string().optional(), // Current document context
			selectedText: z.string().optional(), // Selected text from editor
		}),
	)
	.handler(async ({ input, context }) => {
		const { chatId, messages, includeDocuments, includeSources, documentId, selectedText } = input;
		const user = context.user;

		const chat = await getAiChatById(chatId);

		if (!chat) {
			throw new ORPCError("NOT_FOUND");
		}

		// Verify access
		if (chat.organizationId) {
			const membership = await verifyWorkspaceMembership(chat.organizationId, user.id);
			if (!membership) {
				throw new ORPCError("FORBIDDEN");
			}
		} else if (chat.userId !== user.id) {
			throw new ORPCError("FORBIDDEN");
		}

		// Build workspace context
		let workspaceContext = "";
		
		if (chat.organizationId) {
			const contextParts: string[] = [];

			// Add current document context
			if (documentId) {
				const document = await db.document.findUnique({
					where: { id: documentId },
					include: {
						documentSources: {
							include: {
								source: true,
							},
						},
					},
				});

				if (document && document.organizationId === chat.organizationId) {
					contextParts.push(`Current Document: "${document.title}"`);
					if (document.description) {
						contextParts.push(`Document Description: ${document.description}`);
					}
					if (selectedText) {
						contextParts.push(`Selected Text: "${selectedText}"`);
					}
				}
			}

			// Add workspace documents context
			if (includeDocuments) {
				const recentDocuments = await db.document.findMany({
					where: { organizationId: chat.organizationId },
					select: {
						id: true,
						title: true,
						description: true,
						tags: true,
						extractedText: true,
					},
					orderBy: { updatedAt: "desc" },
					take: 10,
				});

				if (recentDocuments.length > 0) {
					const documentSummaries = recentDocuments.map(doc => 
						`- ${doc.title}${doc.description ? `: ${doc.description}` : ''}`
					).join('\n');
					
					contextParts.push(`Recent Workspace Documents:\n${documentSummaries}`);
				}
			}

			// Add workspace sources context
			if (includeSources) {
				const sources = await db.source.findMany({
					where: { 
						organizationId: chat.organizationId,
						processingStatus: "completed"
					},
					select: {
						id: true,
						name: true,
						type: true,
						extractedText: true,
					},
					orderBy: { createdAt: "desc" },
					take: 5,
				});

				if (sources.length > 0) {
					const sourceSummaries = sources.map(source => 
						`- ${source.name} (${source.type})`
					).join('\n');
					
					contextParts.push(`Available Sources:\n${sourceSummaries}`);
				}
			}

			if (contextParts.length > 0) {
				workspaceContext = `\n\n--- Workspace Context ---\n${contextParts.join('\n\n')}\n--- End Context ---\n`;
			}
		}

		// Enhance the last user message with context
		const enhancedMessages = [...messages];
		if (enhancedMessages.length > 0 && workspaceContext) {
			const lastMessage = enhancedMessages[enhancedMessages.length - 1];
			if (lastMessage.role === 'user') {
				// Append context to the user's message
				if (lastMessage.parts && lastMessage.parts[0]?.type === 'text') {
					lastMessage.parts[0].text += workspaceContext;
				}
			}
		}

		const response = streamText({
			model: textModel,
			messages: convertToModelMessages(enhancedMessages as UIMessage[]),
			async onFinish({ text }) {
				// Update chat with workspace context
				const updatedWorkspaceContext = {
					lastUpdate: new Date().toISOString(),
					documentsIncluded: includeDocuments,
					sourcesIncluded: includeSources,
					currentDocumentId: documentId,
					hasSelectedText: !!selectedText,
				};

				await updateAiChat({
					id: chatId,
					messages: [
						...messages,
						{
							role: "assistant",
							parts: [{ type: "text", text }],
						},
					] as any,
				});

				// Update workspace context
				await db.aiChat.update({
					where: { id: chatId },
					data: {
						workspaceContext: updatedWorkspaceContext as any,
					},
				});
			},
		});

		return streamToEventIterator(response.toUIMessageStream());
	});