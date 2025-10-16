import { ORPCError, streamToEventIterator } from "@orpc/client";
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
			mentions: z.array(z.object({
				id: z.string(),
				name: z.string(),
				type: z.enum(["document", "folder", "source", "asset"]),
				subtype: z.enum(["image", "pdf", "link"]).optional(),
				url: z.string().optional(),
				content: z.string().optional(),
				category: z.string().optional(),
			})).optional(), // Specific mentions (sources and snippets)
		}),
	)
	.handler(async ({ input, context }) => {
		const { chatId, messages, includeDocuments, includeSources, documentId, selectedText, mentions } = input;
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
					},
					select: {
						id: true,
						name: true,
						type: true,
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

			// Add specific mentions (sources and snippets) content
			if (mentions && mentions.length > 0) {
				const mentionContextParts: string[] = [];

				// Process source mentions
				const sourceMentions = mentions.filter(m => m.type === "source");
				if (sourceMentions.length > 0) {
					const sourceIds = sourceMentions
						.map(m => m.id.replace('source-', ''))
						.filter(id => id);

					if (sourceIds.length > 0) {
						const sourcesData = await db.source.findMany({
							where: {
								id: { in: sourceIds },
								organizationId: chat.organizationId,
							},
							select: {
								id: true,
								name: true,
								type: true,
								url: true,
								filePath: true,
									metadata: true,
							},
						});

						if (sourcesData.length > 0) {
							const sourceDetails = sourcesData.map(source => {
								const parts = [`**${source.name}** (${source.type})`];

								if (source.url) {
									parts.push(`URL: ${source.url}`);
								}

								if (source.metadata && typeof source.metadata === 'object') {
									const metadata = source.metadata as Record<string, any>;
									if (metadata.description) {
										parts.push(`Description: ${metadata.description}`);
									}
								}

								return parts.join('\n');
							}).join('\n\n');

							mentionContextParts.push(`Referenced Sources:\n${sourceDetails}`);
						}
					}
				}

				// Process snippet/asset mentions
				const snippetMentions = mentions.filter(m => m.type === "asset");
				if (snippetMentions.length > 0) {
					const snippetDetails = snippetMentions.map(snippet => {
						const parts = [`**${snippet.name}**`];

						if (snippet.category) {
							parts.push(`Category: ${snippet.category}`);
						}

						if (snippet.content) {
							parts.push(`Content:\n${snippet.content}`);
						}

						return parts.join('\n');
					}).join('\n\n');

					mentionContextParts.push(`Referenced Snippets:\n${snippetDetails}`);
				}

				if (mentionContextParts.length > 0) {
					contextParts.push(mentionContextParts.join('\n\n'));
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