"use client";

import {
	useSendAiMessageWithContextMutation,
} from "@saas/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { Badge } from "@ui/components/badge";
import { ScrollArea } from "@ui/components/scroll-area";
import { cn } from "@ui/lib";
import { Bot } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { AIInputWithSources } from "../ai-chat/ai-input-with-sources";
import type { ChatInterfaceProps, ChatMessage, MentionItem } from "./types";

// Initial welcome message
const welcomeMessage: ChatMessage = {
	id: "welcome",
	role: "ai",
	content:
		"Hello! I'm here to help you with your document. Ask me anything about writing, editing, or improving your content.",
	timestamp: new Date(),
};

export function ChatInterface({ editorContext }: ChatInterfaceProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
	const [chatId] = useState(() => `chat-${Date.now()}`);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// AI mutation for real responses
	const sendAiMessageMutation = useSendAiMessageWithContextMutation();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = async (message: string, mentions?: MentionItem[]) => {
		if (!message.trim() || !activeWorkspace?.id) return;

		const newMessage: ChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content: message,
			timestamp: new Date(),
			mentions: mentions && mentions.length > 0 ? [...mentions] : undefined,
		};

		// Add user message immediately
		setMessages((prev) => [...prev, newMessage]);

		try {
			// Get current editor context if available
			const editorCtx = editorContext?.editor ? editorContext.getCurrentContext() : null;
			
			// Prepare messages for AI (convert our format to API format)
			const apiMessages = messages.concat(newMessage).map(msg => ({
				role: msg.role,
				content: msg.content,
			}));

			// Send to AI service with workspace context
			const response = await sendAiMessageMutation.mutateAsync({
				chatId,
				messages: apiMessages,
				includeDocuments: mentions?.some(m => m.type === "document") || false,
				includeSources: mentions?.some(m => m.type === "source") || false,
				selectedText: editorCtx?.selectedText,
			});

			// Handle streaming response - for now just get the final content
			let aiContent = "I'm processing your request...";
			
			// If it's a streaming response, we'll get the final content
			if (response && typeof response === 'object') {
				// Handle the response based on its actual structure
				aiContent = (response as any).message?.content || 
						   (response as any).content || 
						   "I'm ready to help with your request.";
			}

			// Add AI response
			const aiResponse: ChatMessage = {
				id: `ai-${Date.now()}`,
				role: "ai",
				content: aiContent,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, aiResponse]);

			// If the AI response includes content to insert, and the user asked to "continue writing"
			if (aiContent && message.toLowerCase().includes("continue writing") && editorContext?.editor) {
				// Insert the AI response into the editor
				editorContext.editor.chain().focus().insertContent(`\n\n${aiContent}`).run();
			}

		} catch (error) {
			console.error("Failed to send AI message:", error);
			const errorResponse: ChatMessage = {
				id: `error-${Date.now()}`,
				role: "ai",
				content: "I'm sorry, I encountered an error while processing your request. Please try again.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorResponse]);
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* Chat Messages - Scrollable Content */}
			<div className="flex-1 min-h-0 overflow-hidden">
				<ScrollArea className="h-full p-4">
					<div className="space-y-4">
						{messages.map((message) => (
							<div
								key={message.id}
								className={cn(
									"flex gap-3",
									message.role === "user"
										? "justify-end"
										: "justify-start",
								)}
							>
								{message.role === "ai" && (
									<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
										<Bot className="w-4 h-4 text-primary" />
									</div>
								)}
								<div
									className={cn(
										"max-w-[80%] rounded-lg px-3 py-2 text-sm",
										message.role === "user"
											? "bg-primary text-primary-foreground"
											: "bg-muted",
									)}
								>
									<div>{message.content}</div>
									{message.mentions &&
										message.mentions.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-1">
												{message.mentions.map(
													(mention) => (
														<Badge
															key={mention.id}
															className="text-xs bg-secondary text-secondary-foreground"
														>
															{mention.name}
														</Badge>
													),
												)}
											</div>
										)}
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>
				</ScrollArea>
			</div>

			{/* Fixed Input Area */}
			<div className="flex-shrink-0 border-t bg-background p-4">
				<AIInputWithSources
					placeholder="Ask AI about your document..."
					onSendMessage={handleSendMessage}
					maxRows={3}
				/>
				<p className="text-xs text-muted-foreground mt-2">
					Click + to add context • Shift+Enter for new line
				</p>
			</div>
		</div>
	);
}