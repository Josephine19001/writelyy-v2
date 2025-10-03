"use client";

import {
	useDocumentsQuery,
	useFoldersQuery,
	useSourcesQuery,
	useSendAiMessageWithContextMutation,
} from "@saas/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { Badge } from "@ui/components/badge";
import { IconButton } from "@ui/components/icon-button";
import { ScrollArea } from "@ui/components/scroll-area";
import { cn } from "@ui/lib";
import { ArrowUp, Bot, Plus } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { MentionAutocomplete } from "./MentionAutocomplete";
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
	const [inputValue, setInputValue] = useState("");
	const [selectedMentions, setSelectedMentions] = useState<MentionItem[]>([]);
	const [showMentionAutocomplete, setShowMentionAutocomplete] =
		useState(false);
	const [mentionQuery, setMentionQuery] = useState("");
	const [autocompletePosition, setAutocompletePosition] = useState({
		top: 0,
		left: 0,
	});
	const [chatId] = useState(() => `chat-${Date.now()}`);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// AI mutation for real responses
	const sendAiMessageMutation = useSendAiMessageWithContextMutation();

	// Fetch workspace data for mentions
	const documentsQuery = useDocumentsQuery(activeWorkspace?.id || "", {
		enabled: !!activeWorkspace?.id,
		limit: 100,
	});
	const foldersQuery = useFoldersQuery(activeWorkspace?.id || "", {
		enabled: !!activeWorkspace?.id,
	});
	const sourcesQuery = useSourcesQuery(activeWorkspace?.id || "", {
		enabled: !!activeWorkspace?.id,
		limit: 100,
	});

	// Transform real data into mention items with folder context
	const mentionItems: MentionItem[] = React.useMemo(() => {
		const items: MentionItem[] = [];

		// Create folder lookup for better organization
		const folderLookup = new Map();
		if (foldersQuery.data) {
			foldersQuery.data.forEach((folder: any) => {
				folderLookup.set(folder.id, folder.name);
			});
		}

		// Add documents with folder context
		if (documentsQuery.data?.documents) {
			documentsQuery.data.documents.forEach((doc: any) => {
				const folderName = doc.folderId ? folderLookup.get(doc.folderId) : null;
				items.push({
					id: `doc-${doc.id}`,
					name: doc.title,
					type: "document",
					...(folderName && { folderName }),
				} as MentionItem & { folderName?: string });
			});
		}

		// Add folders
		if (foldersQuery.data) {
			foldersQuery.data.forEach((folder: any) => {
				items.push({
					id: `folder-${folder.id}`,
					name: folder.name,
					type: "folder",
				});
			});
		}

		// Add sources with enhanced metadata
		if (sourcesQuery.data?.sources) {
			sourcesQuery.data.sources.forEach((source: any) => {
				items.push({
					id: `source-${source.id}`,
					name: source.name,
					type: "source",
					subtype: source.type as "image" | "pdf" | "link",
					url: source.url,
				});
			});
		}

		return items;
	}, [documentsQuery.data, foldersQuery.data, sourcesQuery.data]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const resizeTextarea = (textarea: HTMLTextAreaElement) => {
		// Reset height to get accurate scrollHeight
		textarea.style.height = "auto";

		const scrollHeight = textarea.scrollHeight;
		const maxHeight = 120; // 120px max height
		const minHeight = 40; // 2.5rem = 40px

		// Set height based on content, capped at max
		const newHeight = Math.max(
			minHeight,
			Math.min(scrollHeight, maxHeight),
		);
		textarea.style.height = `${newHeight}px`;

		// Enable scroll only if content exceeds max height
		textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		const cursorPosition = e.target.selectionStart;
		
		setInputValue(value);
		resizeTextarea(e.target);

		// Check for @ mention trigger
		const textBeforeCursor = value.substring(0, cursorPosition);
		const lastAtIndex = textBeforeCursor.lastIndexOf("@");
		
		if (lastAtIndex !== -1) {
			// Check if @ is at start or preceded by whitespace
			const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
			if (charBeforeAt === " " || lastAtIndex === 0) {
				const query = textBeforeCursor.substring(lastAtIndex + 1);
				// Only show if query doesn't contain spaces (still typing the mention)
				if (!query.includes(" ")) {
					setMentionQuery(query);
					setShowMentionAutocomplete(true);
					
					// Calculate position for autocomplete
					if (inputRef.current) {
						const rect = inputRef.current.getBoundingClientRect();
						setAutocompletePosition({
							top: rect.top - 250,
							left: rect.left,
						});
					}
					return;
				}
			}
		}
		
		// Hide autocomplete if no valid @ mention context
		setShowMentionAutocomplete(false);
	};

	const handleAddContext = () => {
		setShowMentionAutocomplete(true);
		setMentionQuery("");

		// Calculate position for autocomplete
		if (inputRef.current) {
			const rect = inputRef.current.getBoundingClientRect();
			const position = {
				top: rect.top - 250,
				left: rect.left,
			};
			setAutocompletePosition(position);
		}
	};

	const handleMentionSelect = (item: MentionItem) => {
		const textarea = inputRef.current;
		if (!textarea) return;

		const cursorPosition = textarea.selectionStart;
		const textBeforeCursor = inputValue.substring(0, cursorPosition);
		const lastAtIndex = textBeforeCursor.lastIndexOf("@");
		
		if (lastAtIndex !== -1) {
			// Replace @query with @mentionName
			const beforeAt = inputValue.substring(0, lastAtIndex);
			const afterCursor = inputValue.substring(cursorPosition);
			const newValue = `${beforeAt}@${item.name} ${afterCursor}`;
			
			setInputValue(newValue);
			
			// Set cursor position after the mention
			setTimeout(() => {
				const newCursorPos = lastAtIndex + item.name.length + 2; // +2 for @ and space
				textarea.setSelectionRange(newCursorPos, newCursorPos);
			}, 0);
		} else {
			// Fallback: append to end
			setInputValue((prev) => prev + (prev ? " " : "") + `@${item.name} `);
		}

		setSelectedMentions((prev) => [...prev, item]);
		setShowMentionAutocomplete(false);
		inputRef.current?.focus();
	};

	const handleSendMessage = async () => {
		if (!inputValue.trim() || !activeWorkspace?.id) return;

		const newMessage: ChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content: inputValue,
			timestamp: new Date(),
			mentions:
				selectedMentions.length > 0 ? [...selectedMentions] : undefined,
		};

		// Add user message immediately
		setMessages((prev) => [...prev, newMessage]);
		const currentInput = inputValue;
		setInputValue("");
		setSelectedMentions([]);
		setShowMentionAutocomplete(false);

		// Reset textarea height to minimum
		if (inputRef.current) {
			resizeTextarea(inputRef.current);
		}

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
				includeDocuments: selectedMentions.some(m => m.type === "document"),
				includeSources: selectedMentions.some(m => m.type === "source"),
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
			if (aiContent && currentInput.toLowerCase().includes("continue writing") && editorContext?.editor) {
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

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
		// Allow Shift+Enter for new lines (default textarea behavior)
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

			{/* Mention Autocomplete */}
			{showMentionAutocomplete && (
				<MentionAutocomplete
					query={mentionQuery}
					onSelect={handleMentionSelect}
					onClose={() => setShowMentionAutocomplete(false)}
					position={autocompletePosition}
					mentionItems={mentionItems}
				/>
			)}

			{/* Fixed Input Area */}
			<div className="flex-shrink-0 border-t bg-background p-4">
				<div className="border border-input rounded-md bg-background">
					<textarea
						ref={inputRef}
						placeholder="Ask AI about your document..."
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						rows={1}
						className="w-full bg-transparent text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none border-0 p-3 pb-2"
						style={{
							height: "auto",
							minHeight: "2.5rem",
						}}
					/>
					<div className="flex items-center justify-between px-3 pb-2">
						<IconButton
							variant="ghost"
							size="sm"
							icon={<Plus />}
							onClick={handleAddContext}
							title="Add context from files, folders, or sources"
						/>
						<IconButton
							variant="primary"
							size="sm"
							icon={<ArrowUp />}
							onClick={handleSendMessage}
							disabled={!inputValue.trim()}
						/>
					</div>
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					Click + to add context • Shift+Enter for new line
				</p>
			</div>
		</div>
	);
}