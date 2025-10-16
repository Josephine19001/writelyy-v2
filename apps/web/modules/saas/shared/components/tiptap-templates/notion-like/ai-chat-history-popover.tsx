"use client";

import { useAiChatHistory } from "@saas/shared/hooks/use-ai-chat-history";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@ui/components/popover";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import {
	Sparkles,
	Plus,
	ChevronDown,
	Search,
	Trash2,
	Loader2,
	Send,
} from "lucide-react";
import * as React from "react";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	Card,
	CardBody,
} from "@shared/tiptap/components/tiptap-ui-primitive/card";
import { EditorContext } from "@tiptap/react";
import { Input } from "@ui/components/input";
import { Textarea } from "@ui/components/textarea";

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
		<div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex-shrink-0">
			<Sparkles className="h-4 w-4 text-white" />
		</div>
	);
}

// User Avatar component
function UserAvatar() {
	return (
		<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 flex-shrink-0">
			<span className="text-white text-xs font-semibold">You</span>
		</div>
	);
}

// Message component with typing effect
function ChatMessageComponent({
	message,
	index,
}: {
	message: ChatMessage;
	index: number;
}) {
	const { displayedText } = useTypingEffect(
		message.content,
		message.isTyping ? 20 : 0,
	);

	const textToShow = message.isTyping ? displayedText : message.content;

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
							? "bg-blue-500 text-white border-blue-500"
							: "bg-background border-border"
					}`}
				>
					<CardBody className="p-3">
						<div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
							{textToShow}
							{message.isTyping &&
								displayedText.length <
									message.content.length && (
									<span className="animate-pulse">▌</span>
								)}
						</div>

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
	const {
		chatHistory,
		isLoading: isLoadingHistory,
		clearHistory,
		saveConversation,
	} = useAiChatHistory(documentId);
	const [inputValue, setInputValue] = React.useState("");
	const [searchQuery, setSearchQuery] = React.useState("");
	const [localMessages, setLocalMessages] = React.useState<ChatMessage[]>([]);
	const [isAiResponding, setIsAiResponding] = React.useState(false);
	const [chatTitle, setChatTitle] = React.useState("New Chat");
	const messagesEndRef = React.useRef<HTMLDivElement>(null);
	const messagesContainerRef = React.useRef<HTMLDivElement>(null);
	const inputRef = React.useRef<HTMLTextAreaElement>(null);

	// Sync local messages with chat history
	React.useEffect(() => {
		if (chatHistory?.messages) {
			setLocalMessages(chatHistory.messages as ChatMessage[]);
		}
		if (chatHistory?.title) {
			setChatTitle(chatHistory.title);
		}
	}, [chatHistory?.messages, chatHistory?.title]);

	// Auto-scroll to bottom when new messages arrive
	const scrollToBottom = React.useCallback(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, []);

	// Scroll to bottom when messages change
	React.useEffect(() => {
		scrollToBottom();
	}, [localMessages, isAiResponding, scrollToBottom]);

	const handleClearHistory = () => {
		if (confirm("Are you sure you want to clear all chat history?")) {
			clearHistory();
			setLocalMessages([]);
			setChatTitle("New Chat");
		}
	};

	const handleNewChat = () => {
		clearHistory();
		setLocalMessages([]);
		setInputValue("");
		setChatTitle("New Chat");
	};

	// Generate chat title from first message
	const generateChatTitle = React.useCallback((firstMessage: string) => {
		const words = firstMessage.split(" ").slice(0, 6).join(" ");
		return words.length < firstMessage.length ? `${words}...` : words;
	}, []);

	const handleSendMessage = React.useCallback(async () => {
		const prompt = inputValue.trim();
		if (!prompt) return;

		console.log("🔵 Sending message:", prompt);

		// 1. Add user message immediately
		const userMessage: ChatMessage = {
			role: "user",
			content: prompt,
			timestamp: new Date().toISOString(),
		};

		setLocalMessages((prev) => {
			console.log("🔵 Adding user message to localMessages");
			return [...prev, userMessage];
		});

		setInputValue(""); // Clear input immediately

		// Auto-rename chat if this is the first message
		const isFirstMessage = localMessages.length === 0;
		let newChatTitle = chatTitle;
		if (isFirstMessage) {
			newChatTitle = generateChatTitle(prompt);
			setChatTitle(newChatTitle);
		}

		// 2. Show AI loading state
		setIsAiResponding(true);

		try {
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

			console.log("✅ Got AI response:", aiResponse?.substring(0, 100));

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
		editor,
		documentId,
		saveConversation,
		generateChatTitle,
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
		if (!searchQuery.trim()) return localMessages;

		return localMessages.filter((msg) =>
			msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [localMessages, searchQuery]);

	return (
		<Popover>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				className="w-[520px] h-[85vh] p-0 flex flex-col"
				side="left"
				align="start"
				sideOffset={10}
			>
				{/* Header with Chat History Dropdown */}
				<div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 flex-shrink-0">
					<div className="flex items-center gap-2 flex-1">
						<Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0" />

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
									{hasHistory ? (
										<DropdownMenuItem className="text-sm">
											<div className="flex flex-col gap-1 flex-1">
												<span className="font-medium truncate">
													{chatHistory?.title ||
														"Current conversation"}
												</span>
												<span className="text-xs text-muted-foreground">
													{localMessages.length}{" "}
													message
													{localMessages.length !== 1
														? "s"
														: ""}
												</span>
											</div>
										</DropdownMenuItem>
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
							onClick={handleClearHistory}
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
							<div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center mb-4 opacity-80">
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
								/>
							))}

							{/* AI Thinking/Loading State */}
							{isAiResponding && (
								<div className="flex gap-3 justify-start">
									<AiAvatar />

									<div className="flex flex-col gap-1 items-start">
										<Card className="bg-background border-border">
											<CardBody className="p-3">
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<Loader2 className="h-4 w-4 animate-spin" />
													<span>
														AI is thinking...
													</span>
												</div>
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
					<div className="flex gap-2 items-end">
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
							className="h-[44px] px-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 disabled:opacity-50"
						>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
