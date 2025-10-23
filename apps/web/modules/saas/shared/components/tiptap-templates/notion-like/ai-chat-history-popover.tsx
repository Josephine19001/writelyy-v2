"use client";

import { useAiChatHistory } from "@saas/shared/hooks/use-ai-chat-history";
import { useSourcesQuery } from "@saas/lib/api";
import { useSnippetsQuery } from "@saas/snippets/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	Card,
	CardBody,
} from "@shared/tiptap/components/tiptap-ui-primitive/card";
import { EditorContext } from "@tiptap/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@ui/components/alert-dialog";
import { Input } from "@ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@ui/components/popover";
import { Textarea } from "@ui/components/textarea";
import {
	ChevronDown,
	Loader2,
	Plus,
	Search,
	Send,
	Sparkles,
	Trash2,
	X,
	FileText,
	File,
} from "lucide-react";
import * as React from "react";

interface AiChatHistoryPopoverProps {
	children: React.ReactNode;
	documentId?: string;
}

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
	timestamp: string;
	sources?: any[];
	snippets?: any[];
	isTyping?: boolean;
	hasDocumentChange?: boolean;
	changeContent?: string;
}

// Simple HTML sanitization utility
// Allows safe HTML elements commonly used in rich text while removing scripts and dangerous attributes
function sanitizeHtml(html: string): string {
	if (typeof window === 'undefined') {
		return html;
	}

	// Create a temporary div to parse HTML
	const temp = document.createElement('div');
	temp.innerHTML = html;

	// Remove all script tags and event handlers
	const scripts = temp.querySelectorAll('script');
	for (const script of scripts) {
		script.remove();
	}

	// Remove dangerous event handler attributes
	const allElements = temp.querySelectorAll('*');
	for (const el of allElements) {
		for (const attr of Array.from(el.attributes)) {
			if (attr.name.startsWith('on')) {
				el.removeAttribute(attr.name);
			}
		}
	}

	return temp.innerHTML;
}

// Typing effect hook
function useTypingEffect(text: string, speed = 20) {
	const [displayedText, setDisplayedText] = React.useState("");
	const [isComplete, setIsComplete] = React.useState(false);

	React.useEffect(() => {
		setDisplayedText("");
		setIsComplete(false);
		let currentIndex = 0;

		const interval = setInterval(() => {
			if (currentIndex < text.length) {
				setDisplayedText(text.slice(0, currentIndex + 1));
				currentIndex++;
			} else {
				setIsComplete(true);
				clearInterval(interval);
			}
		}, speed);

		return () => clearInterval(interval);
	}, [text, speed]);

	return { displayedText, isComplete };
}

// AI Avatar component
function AiAvatar() {
	return (
		<div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, var(--tt-brand-color-400), var(--tt-brand-color-600))' }}>
			<Sparkles className="h-4 w-4 text-white" />
		</div>
	);
}

// Thinking dots animation component
function ThinkingBubble() {
	return (
		<div className="flex gap-1 items-center justify-center py-1">
			<div
				className="w-2 h-2 rounded-full animate-bounce"
				style={{ backgroundColor: 'var(--tt-brand-color-400)', animationDelay: "0ms", animationDuration: "1s" }}
			/>
			<div
				className="w-2 h-2 rounded-full animate-bounce"
				style={{ backgroundColor: 'var(--tt-brand-color-500)', animationDelay: "150ms", animationDuration: "1s" }}
			/>
			<div
				className="w-2 h-2 rounded-full animate-bounce"
				style={{ backgroundColor: 'var(--tt-brand-color-600)', animationDelay: "300ms", animationDuration: "1s" }}
			/>
		</div>
	);
}

// User Avatar component
function UserAvatar() {
	return (
		<div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 flex-shrink-0 shadow-sm">
			<svg
				className="w-4 h-4 text-white"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<title>User avatar icon</title>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
				/>
			</svg>
		</div>
	);
}

// Parse document changes from AI response
function parseDocumentChange(content: string): {
	hasChange: boolean;
	displayContent: string;
	changeContent: string;
	actionType: "insert" | "replace";
} {
	const changeMatch = content.match(
		/<document-change(?:\s+action="(insert|replace)")?>([\s\S]*?)<\/document-change>/,
	);

	if (changeMatch) {
		const actionType = (changeMatch[1] as "insert" | "replace") || "insert";
		const changeBlock = changeMatch[2];
		const contentMatch = changeBlock.match(
			/<change-content>([\s\S]*?)<\/change-content>/,
		);
		const displayContent = changeBlock
			.replace(/<change-content>[\s\S]*?<\/change-content>/, "")
			.trim();

		return {
			hasChange: true,
			displayContent: displayContent || "I can make this change:",
			changeContent: contentMatch ? contentMatch[1].trim() : "",
			actionType,
		};
	}

	return {
		hasChange: false,
		displayContent: content,
		changeContent: "",
		actionType: "insert",
	};
}

// Message component with typing effect
function ChatMessageComponent({
	message,
	index,
	onAcceptChange,
	onDeclineChange,
}: {
	message: ChatMessage;
	index: number;
	onAcceptChange?: (
		content: string,
		actionType: "insert" | "replace",
	) => void;
	onDeclineChange?: () => void;
}) {
	const { displayedText } = useTypingEffect(
		message.content,
		message.isTyping ? 20 : 0,
	);

	const textToShow = message.isTyping ? displayedText : message.content;

	// Parse for document changes (only for assistant messages)
	const parsed = React.useMemo(
		() =>
			message.role === "assistant"
				? parseDocumentChange(textToShow)
				: {
						hasChange: false,
						displayContent: textToShow,
						changeContent: "",
						actionType: "insert" as const,
					},
		[textToShow, message.role],
	);

	return (
		<div
			key={index}
			className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
		>
			{message.role === "assistant" && <AiAvatar />}

			<div
				className={`flex flex-col gap-1 max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}
			>
				<Card
					className={`${
						message.role === "user"
							? "!bg-slate-700 dark:!bg-slate-600 !border-slate-700 dark:!border-slate-600 !shadow-md"
							: "bg-background border-border !shadow-sm"
					} transition-all hover:!shadow-lg`}
				>
					<CardBody className="p-4">
						{message.role === "user" ? (
							// User messages: plain text
							<div className="text-sm leading-relaxed whitespace-pre-wrap break-words !text-white">
								{textToShow}
								{message.isTyping &&
									displayedText.length <
										message.content.length && (
										<span className="animate-pulse">▌</span>
									)}
							</div>
						) : (
							// Assistant messages: rendered HTML (sanitized)
							<>
								<div
									className="text-sm leading-relaxed break-words prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:mt-4 prose-headings:mb-2"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized via sanitizeHtml function
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(parsed.displayContent),
									}}
								/>

								{message.isTyping &&
									displayedText.length <
										message.content.length && (
										<span className="animate-pulse">▌</span>
									)}
							</>
						)}

						{/* Document change preview */}
						{parsed.hasChange && parsed.changeContent && (
							<div className="mt-3 pt-3 border-t border-current/20">
								<div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-3 space-y-2">
									<div className="text-xs font-semibold text-muted-foreground mb-2">
										PROPOSED CHANGE
									</div>
									<div
										className="text-sm prose prose-sm dark:prose-invert max-w-none"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized via sanitizeHtml function
										dangerouslySetInnerHTML={{
											__html: sanitizeHtml(parsed.changeContent),
										}}
									/>
									<div className="flex gap-2 mt-3">
										<Button
											data-style="default"
											onClick={() =>
												onAcceptChange?.(
													parsed.changeContent,
													parsed.actionType,
												)
											}
											className="h-7 px-3 text-xs !bg-green-600 hover:!bg-green-700 !text-white !border-green-600 hover:!border-green-700"
										>
											{parsed.actionType === "replace"
												? "Accept & Replace"
												: "Accept & Insert"}
										</Button>
										<Button
											data-style="ghost"
											onClick={() => onDeclineChange?.()}
											className="h-7 px-3 text-xs !text-red-600 hover:!text-red-700 hover:!bg-red-50 dark:hover:!bg-red-950/20"
										>
											Decline
										</Button>
									</div>
								</div>
							</div>
						)}

						{(message.sources && message.sources.length > 0) ||
						(message.snippets && message.snippets.length > 0) ? (
							<div className="mt-2 pt-2 border-t border-current/20 flex flex-wrap gap-2">
								{message.sources &&
									message.sources.length > 0 && (
										<span className="text-xs opacity-80">
											📎 {message.sources.length} source
											{message.sources.length > 1
												? "s"
												: ""}
										</span>
									)}
								{message.snippets &&
									message.snippets.length > 0 && (
										<span className="text-xs opacity-80">
											✂️ {message.snippets.length} snippet
											{message.snippets.length > 1
												? "s"
												: ""}
										</span>
									)}
							</div>
						) : null}
					</CardBody>
				</Card>

				<span className="text-xs text-muted-foreground px-1">
					{new Date(message.timestamp).toLocaleString(undefined, {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</span>
			</div>

			{message.role === "user" && <UserAvatar />}
		</div>
	);
}

export function AiChatHistoryPopover({
	children,
	documentId,
}: AiChatHistoryPopoverProps) {
	const { editor } = React.useContext(EditorContext)!;
	const { activeWorkspace } = useActiveWorkspace();
	const {
		chatHistory,
		allChats,
		isLoading: isLoadingHistory,
		isLoadingChats,
		clearHistory,
		saveConversation,
		fetchAllChats,
		loadChatByDocumentId,
	} = useAiChatHistory(documentId);
	const [inputValue, setInputValue] = React.useState("");
	const [searchQuery, setSearchQuery] = React.useState("");
	const [localMessages, setLocalMessages] = React.useState<ChatMessage[]>([]);
	const [isAiResponding, setIsAiResponding] = React.useState(false);
	const [chatTitle, setChatTitle] = React.useState("New Chat");
	const [isOpen, setIsOpen] = React.useState(false);
	const [selectedSources, setSelectedSources] = React.useState<any[]>([]);
	const [selectedSnippets, setSelectedSnippets] = React.useState<any[]>([]);
	const [showAttachmentMenu, setShowAttachmentMenu] = React.useState(false);
	const [showClearDialog, setShowClearDialog] = React.useState(false);
	const messagesEndRef = React.useRef<HTMLDivElement>(null);
	const messagesContainerRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLTextAreaElement>(null);
	const attachmentMenuRef = React.useRef<HTMLDivElement>(null);

	// Fetch sources and snippets
	const { data: sourcesData } = useSourcesQuery(activeWorkspace?.id || "", {
		enabled: !!activeWorkspace?.id,
	});
	const { data: snippetsData } = useSnippetsQuery(activeWorkspace?.id || "", {
		enabled: !!activeWorkspace?.id,
	});

	const sources = sourcesData?.sources || [];
	const snippets = snippetsData?.snippets || [];

	// Sync local messages with chat history
	React.useEffect(() => {
		if (chatHistory?.messages) {
			setLocalMessages(chatHistory.messages as ChatMessage[]);
		}
		if (chatHistory?.title) {
			setChatTitle(chatHistory.title);
		}
	}, [chatHistory?.messages, chatHistory?.title]);

	// Fetch all chats on mount
	React.useEffect(() => {
		fetchAllChats();
	}, [fetchAllChats]);

	// Auto-scroll to bottom when new messages arrive
	const scrollToBottom = React.useCallback(
		(behavior: ScrollBehavior = "smooth") => {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ behavior });
			}
		},
		[],
	);

	// Scroll to bottom when messages change
	React.useEffect(() => {
		scrollToBottom();
	}, [localMessages, isAiResponding, scrollToBottom]);

	// Scroll to bottom when chat opens (instant scroll)
	React.useEffect(() => {
		if (isOpen && localMessages.length > 0) {
			// Use setTimeout to ensure DOM is ready
			setTimeout(() => {
				scrollToBottom("instant");
			}, 100);
		}
	}, [isOpen, scrollToBottom, localMessages.length]);

	const handleClearHistory = () => {
		clearHistory();
		setLocalMessages([]);
		setChatTitle("New Chat");
		setShowClearDialog(false);
		fetchAllChats(true); // Refresh chat list
	};

	const handleNewChat = () => {
		clearHistory();
		setLocalMessages([]);
		setInputValue("");
		setChatTitle("New Chat");
	};

	// Handle loading a previous chat
	const handleLoadChat = React.useCallback(
		async (chat: {
			id: string;
			documentId: string | null;
			title: string;
		}) => {
			if (!chat.documentId) {
				console.warn("Chat has no documentId");
				return;
			}

			try {
				const loadedChat = await loadChatByDocumentId(chat.documentId);

				// Update the UI with the loaded chat
				if (loadedChat?.title) {
					setChatTitle(loadedChat.title);
				}
			} catch (error) {
				console.error("❌ Error loading chat:", error);
			}
		},
		[loadChatByDocumentId],
	);

	// Generate chat title from first message
	const generateChatTitle = React.useCallback((firstMessage: string) => {
		const words = firstMessage.split(" ").slice(0, 6).join(" ");
		return words.length < firstMessage.length ? `${words}...` : words;
	}, []);

	const handleSendMessage = React.useCallback(async () => {
		const prompt = inputValue.trim();
		if (!prompt) {
			return;
		}

		// Auto-rename chat if this is the first message
		const isFirstMessage = localMessages.length === 0;
		let newChatTitle = chatTitle;
		if (isFirstMessage) {
			newChatTitle = generateChatTitle(prompt);
			setChatTitle(newChatTitle);
		}

		// 1. Add user message immediately with sources and snippets
		const userMessage: ChatMessage = {
			role: "user",
			content: prompt,
			timestamp: new Date().toISOString(),
			sources: selectedSources.length > 0 ? selectedSources : undefined,
			snippets: selectedSnippets.length > 0 ? selectedSnippets : undefined,
		};

		setLocalMessages((prev) => {
			return [...prev, userMessage];
		});

		setInputValue(""); // Clear input immediately
		setSelectedSources([]); // Clear selected sources
		setSelectedSnippets([]); // Clear selected snippets

		// 2. Show AI loading state
		setIsAiResponding(true);

		try {
			// Prepare sources with content extraction
			const sourcesWithContent = selectedSources.map((source) => ({
				id: source.id,
				name: source.name || source.title,
				type: source.type,
				content: source.textContent || source.content || source.description || "",
			}));

			// Prepare snippets with content
			const snippetsWithContent = selectedSnippets.map((snippet) => ({
				id: snippet.id,
				title: snippet.title || snippet.name,
				content: snippet.content || "",
			}));

			// 3. Call AI API to get chat response
			const response = await fetch("/api/ai/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					documentId,
					documentContext: editor?.getText() || "",
					sources: sourcesWithContent.length > 0 ? sourcesWithContent : undefined,
					snippets: snippetsWithContent.length > 0 ? snippetsWithContent : undefined,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error("❌ API Error:", {
					status: response.status,
					statusText: response.statusText,
					error: errorData,
				});
				throw new Error(
					`Failed to get AI response: ${errorData.error || response.statusText}`,
				);
			}

			const data = await response.json();
			const aiResponse = data.response;

			// 4. Add AI response with typing effect
			const aiMessage: ChatMessage = {
				role: "assistant",
				content: aiResponse,
				timestamp: new Date().toISOString(),
				isTyping: true,
			};

			setLocalMessages((prev) => [...prev, aiMessage]);

			// 5. Save conversation to history with title if first message
			if (documentId) {
				await saveConversation(prompt, aiResponse, {
					title: isFirstMessage ? newChatTitle : undefined,
				});
				// Refresh chat list to show new/updated chat
				fetchAllChats(true);
			}
		} catch (error) {
			console.error("Error getting AI response:", error);

			// Show error message
			const errorMessage: ChatMessage = {
				role: "assistant",
				content: "Sorry, I encountered an error. Please try again.",
				timestamp: new Date().toISOString(),
			};
			setLocalMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsAiResponding(false);
		}
	}, [
		inputValue,
		localMessages.length,
		chatTitle,
		editor,
		documentId,
		saveConversation,
		generateChatTitle,
		selectedSources,
		selectedSnippets,
		fetchAllChats,
	]);

	// Handle Enter key to send
	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSendMessage();
			}
		},
		[handleSendMessage],
	);

	const hasHistory = localMessages.length > 0;

	// Filter messages based on search
	const filteredMessages = React.useMemo(() => {
		if (!searchQuery.trim()) {
			return localMessages;
		}

		return localMessages.filter((msg) =>
			msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [localMessages, searchQuery]);

	// Handle accepting a document change
	const handleAcceptChange = React.useCallback(
		(htmlContent: string, actionType: "insert" | "replace") => {
			if (!editor) {
				return;
			}

			try {
				if (actionType === "replace") {
					// Replace entire document content
					editor.chain().focus().setContent(htmlContent).run();
				} else {
					// Insert at current cursor position
					editor.chain().focus().insertContent(htmlContent).run();
				}
			} catch (error) {
				console.error("❌ Error applying document change:", error);
			}
		},
		[editor],
	);

	// Handle declining a document change
	const handleDeclineChange = React.useCallback(() => {
		// Simply dismiss - the change won't be applied
		// Could add a toast notification here if desired
	}, []);

	return (
		<Popover onOpenChange={setIsOpen} open={isOpen}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				className="w-[520px] h-[85vh] p-0 flex flex-col"
				side="left"
				align="start"
				sideOffset={10}
			>
				{/* Header with Chat History Dropdown */}
				<div className="flex items-center justify-between p-3 border-b flex-shrink-0 bg-muted/30">
					<div className="flex items-center gap-2 flex-1">
						{/* Chat History Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									data-style="ghost"
									className="flex items-center gap-2 flex-1 justify-start font-semibold text-sm hover:bg-transparent"
								>
									<span className="truncate">
										{hasHistory
											? chatHistory?.title ||
												"Current Chat"
											: "New Chat"}
									</span>
									<ChevronDown className="h-4 w-4 flex-shrink-0" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="start"
								className="w-[280px]"
							>
								<div className="p-2">
									<Button
										data-style="ghost"
										onClick={handleNewChat}
										className="w-full justify-start gap-2"
									>
										<Plus className="h-4 w-4" />
										<span>New Chat</span>
									</Button>
								</div>

								{/* Search */}
								<div className="px-2 pb-2">
									<div className="relative">
										<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search conversations..."
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											className="pl-8 h-8 text-sm"
										/>
									</div>
								</div>

								{/* Recent Chats */}
								<div className="border-t pt-2">
									<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
										RECENT
									</div>
									{isLoadingChats ? (
										<div className="px-2 py-4 text-xs text-muted-foreground text-center">
											<Loader2 className="h-4 w-4 animate-spin mx-auto" />
										</div>
									) : allChats.length > 0 ? (
										<div className="max-h-[200px] overflow-y-auto">
											{allChats
												.filter((chat) =>
													searchQuery.trim()
														? chat.title
																.toLowerCase()
																.includes(
																	searchQuery.toLowerCase(),
																)
														: true,
												)
												.map((chat) => (
													<DropdownMenuItem
														key={chat.id}
														className="text-sm cursor-pointer"
														onClick={() =>
															handleLoadChat(chat)
														}
													>
														<div className="flex flex-col gap-1 flex-1">
															<span className="font-medium truncate">
																{chat.title}
															</span>
															<span className="text-xs text-muted-foreground">
																{
																	chat.messageCount
																}{" "}
																message
																{chat.messageCount !==
																1
																	? "s"
																	: ""}{" "}
																•{" "}
																{new Date(
																	chat.updatedAt,
																).toLocaleDateString()}
															</span>
														</div>
													</DropdownMenuItem>
												))}
										</div>
									) : (
										<div className="px-2 py-4 text-xs text-muted-foreground text-center">
											No conversations yet
										</div>
									)}
								</div>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Action Buttons */}
					{hasHistory && (
						<Button
							data-style="ghost"
							onClick={() => setShowClearDialog(true)}
							title="Clear all history"
							className="flex-shrink-0"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Messages Area - Scrollable */}
				<div
					ref={messagesContainerRef}
					className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20 min-h-0"
				>
					{isLoadingHistory ? (
						<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
							<div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mb-3" />
							<p className="text-sm">Loading history...</p>
						</div>
					) : !hasHistory && !isAiResponding ? (
						<div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
							<div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 opacity-80" style={{ background: 'linear-gradient(to bottom right, var(--tt-brand-color-400), var(--tt-brand-color-600))' }}>
								<Sparkles className="h-8 w-8 text-white" />
							</div>
							<h3 className="font-medium text-base mb-2">
								Start a Conversation
							</h3>
							<p className="text-sm px-6 max-w-sm">
								Ask AI anything! I can help you write, edit,
								summarize, or answer questions about your
								content.
							</p>
						</div>
					) : (
						<>
							{filteredMessages.map((message, index) => (
								<ChatMessageComponent
									key={index}
									message={message}
									index={index}
									onAcceptChange={handleAcceptChange}
									onDeclineChange={handleDeclineChange}
								/>
							))}

							{/* AI Thinking/Loading State */}
							{isAiResponding && (
								<div className="flex gap-3 justify-start">
									<AiAvatar />

									<div className="flex flex-col gap-1 items-start">
										<Card className="bg-background border-border !shadow-sm">
											<CardBody className="px-4 py-3">
												<ThinkingBubble />
											</CardBody>
										</Card>
									</div>
								</div>
							)}

							<div ref={messagesEndRef} />
						</>
					)}
				</div>

				{/* Input Area - Fixed at Bottom */}
				<div className="p-4 border-t bg-background flex-shrink-0">
					{/* Selected attachments display */}
					{(selectedSources.length > 0 || selectedSnippets.length > 0) && (
						<div className="mb-3 flex flex-wrap gap-2">
							{selectedSources.map((source) => (
								<div
									key={source.id}
									className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-xs"
								>
									<FileText className="h-3 w-3" />
									<span className="truncate max-w-[120px]">{source.title || source.name}</span>
									<button
										type="button"
										onClick={() =>
											setSelectedSources((prev) =>
												prev.filter((s) => s.id !== source.id),
											)
										}
										className="hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							))}
							{selectedSnippets.map((snippet) => (
								<div
									key={snippet.id}
									className="flex items-center gap-1 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md text-xs"
								>
									<File className="h-3 w-3" />
									<span className="truncate max-w-[120px]">{snippet.title || snippet.name}</span>
									<button
										type="button"
										onClick={() =>
											setSelectedSnippets((prev) =>
												prev.filter((s) => s.id !== snippet.id),
											)
										}
										className="hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded"
									>
										<X className="h-3 w-3" />
									</button>
								</div>
							))}
						</div>
					)}

					<div className="flex gap-2 items-end">
						{/* Attachment button with dropdown - COMMENTED OUT FOR NOW */}
						{/* <DropdownMenu open={showAttachmentMenu} onOpenChange={setShowAttachmentMenu} modal={false}>
							<DropdownMenuTrigger asChild>
								<Button
									data-style="ghost"
									className="h-[44px] px-3"
									title="Attach sources or snippets"
									onClick={(e) => {
										e.stopPropagation();
										setShowAttachmentMenu(!showAttachmentMenu);
									}}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-[300px]" onInteractOutside={(e) => {
								// Prevent closing the parent popover when clicking inside dropdown
								e.preventDefault();
							}}>
								{/* Sources Section */}
								{/* {sources.length > 0 && (
									<>
										<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
											SOURCES
										</div>
										<div className="max-h-[150px] overflow-y-auto">
											{sources.map((source: any) => (
												<DropdownMenuItem
													key={source.id}
													className="cursor-pointer"
													onClick={() => {
														if (!selectedSources.find((s) => s.id === source.id)) {
															setSelectedSources((prev) => [...prev, source]);
														}
													}}
												>
													<FileText className="h-4 w-4 mr-2" />
													<span className="truncate">{source.title || source.name}</span>
												</DropdownMenuItem>
											))}
										</div>
									</>
								)} */}

								{/* Snippets Section */}
								{/* {snippets.length > 0 && (
									<>
										<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-2">
											SNIPPETS
										</div>
										<div className="max-h-[150px] overflow-y-auto">
											{snippets.map((snippet: any) => (
												<DropdownMenuItem
													key={snippet.id}
													className="cursor-pointer"
													onClick={() => {
														if (!selectedSnippets.find((s) => s.id === snippet.id)) {
															setSelectedSnippets((prev) => [...prev, snippet]);
														}
													}}
												>
													<File className="h-4 w-4 mr-2" />
													<span className="truncate">{snippet.title || snippet.name}</span>
												</DropdownMenuItem>
											))}
										</div>
									</>
								)} */}

								{/* {sources.length === 0 && snippets.length === 0 && (
									<div className="px-2 py-4 text-xs text-muted-foreground text-center">
										No sources or snippets available
									</div>
								)}
							</DropdownMenuContent>
						</DropdownMenu> */}

						<Textarea
							ref={inputRef}
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Ask AI anything..."
							className="flex-1 min-h-[44px] max-h-[200px] resize-none"
							rows={1}
						/>
						<Button
							onClick={handleSendMessage}
							disabled={!inputValue.trim() || isAiResponding}
							data-style="primary"
							className="h-[44px] px-4 hover:opacity-90 disabled:opacity-50"
							style={{ background: 'linear-gradient(to bottom right, var(--tt-brand-color-400), var(--tt-brand-color-600))' }}
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</PopoverContent>

			{/* Clear History Confirmation Dialog */}
			<AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete all messages in this conversation. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleClearHistory} className="bg-red-600 hover:bg-red-700">
							Clear History
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Popover>
	);
}
