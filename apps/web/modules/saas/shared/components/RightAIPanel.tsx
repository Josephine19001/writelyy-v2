"use client";

import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { IconButton } from "@ui/components/icon-button";
import { Card, CardContent } from "@ui/components/card";
import { ScrollArea } from "@ui/components/scroll-area";
import { Tabs, TabsContent } from "@ui/components/tabs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { cn } from "@ui/lib";
import {
	ArrowUp,
	BookOpen,
	Bot,
	ChevronDown,
	File,
	FileText,
	Folder,
	Image,
	Languages,
	Lightbulb,
	Link,
	MessageSquare,
	MoreHorizontal,
	Plus,
	Sparkles,
	RotateCcw,
	X,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface ChatMessage {
	id: string;
	role: "user" | "ai";
	content: string;
	timestamp: Date;
	mentions?: MentionItem[];
}

interface Suggestion {
	id: string;
	type: "grammar" | "style" | "clarity" | "tone";
	title: string;
	description: string;
	severity: "low" | "medium" | "high";
}

interface MentionItem {
	id: string;
	name: string;
	type: "document" | "folder" | "source" | "asset";
	subtype?: "image" | "pdf" | "link";
	url?: string;
}

// Mock data for mentions
const mockMentionItems: MentionItem[] = [
	// Documents
	{ id: "doc-1", name: "Getting Started", type: "document" },
	{ id: "doc-2", name: "API Reference", type: "document" },
	{ id: "doc-3", name: "User Guide", type: "document" },
	{ id: "doc-4", name: "Meeting Notes", type: "document" },

	// Folders
	{ id: "folder-1", name: "Project Documentation", type: "folder" },

	// Sources
	{
		id: "source-1",
		name: "architecture.png",
		type: "source",
		subtype: "image",
	},
	{
		id: "source-2",
		name: "requirements.pdf",
		type: "source",
		subtype: "pdf",
	},
	{
		id: "source-3",
		name: "Design System",
		type: "source",
		subtype: "link",
		url: "https://example.com",
	},

	// Assets
	{ id: "asset-1", name: "hero-image.jpg", type: "asset", subtype: "image" },
	{ id: "asset-2", name: "diagram.png", type: "asset", subtype: "image" },
	{ id: "asset-3", name: "screenshot.png", type: "asset", subtype: "image" },
];

// Mock data
const mockMessages: ChatMessage[] = [
	{
		id: "1",
		role: "ai",
		content:
			"Hello! I'm here to help you with your document. Ask me anything about writing, editing, or improving your content.",
		timestamp: new Date(),
	},
];

const mockSuggestions: Suggestion[] = [
	{
		id: "1",
		type: "grammar",
		title: "Subject-verb agreement",
		description: "Consider changing 'data are' to 'data is' in line 15",
		severity: "medium",
	},
	{
		id: "2",
		type: "clarity",
		title: "Unclear pronoun reference",
		description: "The pronoun 'it' in paragraph 3 needs clarification",
		severity: "high",
	},
	{
		id: "3",
		type: "style",
		title: "Passive voice",
		description: "Consider using active voice for better readability",
		severity: "low",
	},
];

function MentionAutocomplete({
	query,
	onSelect,
	onClose,
	position,
}: {
	query: string;
	onSelect: (item: MentionItem) => void;
	onClose: () => void;
	position: { top: number; left: number };
}) {
	// Show all items if query is empty, otherwise filter
	const filteredItems =
		query.length === 0
			? mockMentionItems
			: mockMentionItems.filter((item) =>
					item.name.toLowerCase().includes(query.toLowerCase()),
				);

	const getItemIcon = (item: MentionItem) => {
		switch (item.type) {
			case "document":
				return <File className="w-4 h-4 text-blue-600" />;
			case "folder":
				return <Folder className="w-4 h-4 text-yellow-600" />;
			case "source":
				if (item.subtype === "image")
					return <Image className="w-4 h-4 text-green-600" />;
				if (item.subtype === "pdf")
					return <FileText className="w-4 h-4 text-red-600" />;
				if (item.subtype === "link")
					return <Link className="w-4 h-4 text-blue-600" />;
				return <File className="w-4 h-4 text-gray-600" />;
			case "asset":
				return <Image className="w-4 h-4 text-purple-600" />;
			default:
				return <File className="w-4 h-4 text-gray-600" />;
		}
	};

	const getItemTypeLabel = (item: MentionItem) => {
		if (item.type === "source" && item.subtype) {
			return `${item.type} (${item.subtype})`;
		}
		return item.type;
	};

	// Always show some options when autocomplete is open
	if (filteredItems.length === 0 && query.length > 0) {
		return (
			<div
				className="fixed z-[9999] w-80 max-h-64 bg-background border border-border rounded-md shadow-xl overflow-hidden"
				style={{
					top: position.top,
					left: position.left,
				}}
			>
				<div className="p-4 text-center text-sm text-muted-foreground">
					No matches found for "{query}"
				</div>
			</div>
		);
	}

	if (filteredItems.length === 0) {
		return null;
	}

	return (
		<div
			className="fixed z-[9999] w-80 max-h-64 bg-background border border-border rounded-md shadow-xl overflow-hidden"
			style={{
				top: position.top,
				left: position.left,
			}}
		>
			<div className="p-2 border-b bg-muted">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">
						Select context for your question
					</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-4 w-4 p-0"
						onClick={onClose}
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			</div>
			<ScrollArea className="max-h-48">
				<div className="p-1">
					{filteredItems.map((item) => (
						<Button
							key={item.id}
							variant="ghost"
							className="w-full justify-start h-auto p-2 text-left"
							onClick={() => onSelect(item)}
						>
							<div className="flex items-center gap-3 w-full">
								{getItemIcon(item)}
								<div className="flex-1 min-w-0">
									<div className="font-medium text-sm truncate">
										{item.name}
									</div>
									<div className="text-xs text-muted-foreground">
										{getItemTypeLabel(item)}
									</div>
								</div>
							</div>
						</Button>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

function ChatInterface() {
	const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
	const [inputValue, setInputValue] = useState("");
	const [selectedMentions, setSelectedMentions] = useState<MentionItem[]>([]);
	const [showMentionAutocomplete, setShowMentionAutocomplete] =
		useState(false);
	const [mentionQuery, setMentionQuery] = useState("");
	const [autocompletePosition, setAutocompletePosition] = useState({
		top: 0,
		left: 0,
	});
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

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
		const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
		textarea.style.height = `${newHeight}px`;
		
		// Enable scroll only if content exceeds max height
		textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setInputValue(value);
		resizeTextarea(e.target);
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
		setInputValue((prev) => prev + (prev ? " " : "") + `@${item.name}`);
		setSelectedMentions((prev) => [...prev, item]);
		setShowMentionAutocomplete(false);
		inputRef.current?.focus();
	};

	const handleSendMessage = () => {
		if (!inputValue.trim()) return;

		const newMessage: ChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content: inputValue,
			timestamp: new Date(),
			mentions:
				selectedMentions.length > 0 ? [...selectedMentions] : undefined,
		};

		setMessages((prev) => [...prev, newMessage]);
		setInputValue("");
		setSelectedMentions([]);
		setShowMentionAutocomplete(false);

		// Reset textarea height to minimum
		if (inputRef.current) {
			resizeTextarea(inputRef.current);
		}

		// Simulate AI response
		setTimeout(() => {
			const aiResponse: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: "ai",
				content:
					selectedMentions.length > 0
						? `I can see you've referenced ${selectedMentions.map((m) => m.name).join(", ")}. Let me help you with that context in mind...`
						: "I understand your question. Let me help you with that...",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, aiResponse]);
		}, 1000);
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
												{message.mentions.map((mention) => (
													<Badge
														key={mention.id}
														className="text-xs bg-secondary text-secondary-foreground"
													>
														{mention.name}
													</Badge>
												))}
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

function DocumentAnalysis() {
	const getSeverityColor = (severity: Suggestion["severity"]) => {
		switch (severity) {
			case "high":
				return "bg-red-100 text-red-800 border-red-200";
			case "medium":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "low":
				return "bg-blue-100 text-blue-800 border-blue-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getTypeIcon = (type: Suggestion["type"]) => {
		switch (type) {
			case "grammar":
				return <BookOpen className="w-4 h-4" />;
			case "style":
				return <Sparkles className="w-4 h-4" />;
			case "clarity":
				return <Lightbulb className="w-4 h-4" />;
			case "tone":
				return <MessageSquare className="w-4 h-4" />;
			default:
				return <FileText className="w-4 h-4" />;
		}
	};

	return (
		<ScrollArea className="h-full p-4">
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-2 text-sm">
					<div className="text-center p-3 bg-muted rounded-lg">
						<div className="font-semibold">Reading Time</div>
						<div className="text-muted-foreground">5 min</div>
					</div>
					<div className="text-center p-3 bg-muted rounded-lg">
						<div className="font-semibold">Word Count</div>
						<div className="text-muted-foreground">1,247</div>
					</div>
				</div>

				<div className="space-y-3">
					<h3 className="font-medium text-sm">Suggestions</h3>
					{mockSuggestions.map((suggestion) => (
						<Card
							key={suggestion.id}
							className="border border-border"
						>
							<CardContent className="p-3">
								<div className="flex items-start gap-2">
									<div className="mt-0.5">
										{getTypeIcon(suggestion.type)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-medium text-sm">
												{suggestion.title}
											</span>
											<Badge
												className={cn(
													"text-xs",
													getSeverityColor(
														suggestion.severity,
													),
												)}
											>
												{suggestion.severity}
											</Badge>
										</div>
										<p className="text-xs text-muted-foreground">
											{suggestion.description}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</ScrollArea>
	);
}

function QuickActions() {
	const actions = [
		{ icon: FileText, label: "Summarize", description: "Create a summary" },
		{ icon: Sparkles, label: "Improve", description: "Enhance writing" },
		{ icon: Languages, label: "Translate", description: "Translate text" },
		{ icon: MoreHorizontal, label: "More", description: "Other actions" },
	];

	return (
		<div className="p-4 space-y-3">
			<h3 className="font-medium text-sm">Quick Actions</h3>
			<div className="grid grid-cols-2 gap-2">
				{actions.map((action) => (
					<Button
						key={action.label}
						variant="outline"
						className="h-auto p-3 flex flex-col items-center gap-2"
					>
						<action.icon className="w-4 h-4" />
						<div className="text-center">
							<div className="text-xs font-medium">
								{action.label}
							</div>
							<div className="text-xs text-muted-foreground">
								{action.description}
							</div>
						</div>
					</Button>
				))}
			</div>
		</div>
	);
}

export function RightAIPanel() {
	const [activeTab, setActiveTab] = useState("chat");
	const [chatKey, setChatKey] = useState(0);

	const handleResetChat = () => {
		setChatKey(prev => prev + 1);
	};

	const getActiveTabLabel = () => {
		switch (activeTab) {
			case "chat":
				return "Chat";
			case "analysis":
				return "Analysis";
			case "actions":
				return "Actions";
			default:
				return "Chat";
		}
	};

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 border-b">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Bot className="w-5 h-5 text-primary" />
						<h2 className="font-medium text-sm">Ask Writelyy</h2>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="gap-1">
								<span className="text-xs">{getActiveTabLabel()}</span>
								<ChevronDown className="h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setActiveTab("chat")}>
								<MessageSquare className="h-4 w-4 mr-2" />
								Chat
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setActiveTab("analysis")}>
								<BookOpen className="h-4 w-4 mr-2" />
								Analysis
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setActiveTab("actions")}>
								<Sparkles className="h-4 w-4 mr-2" />
								Actions
							</DropdownMenuItem>
							{activeTab === "chat" && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={handleResetChat}>
										<RotateCcw className="h-4 w-4 mr-2" />
										Reset Chat
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-hidden">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="h-full flex flex-col"
				>
					<TabsContent value="chat" className="flex-1 mt-0 h-full min-h-0 overflow-hidden">
						<ChatInterface key={chatKey} />
					</TabsContent>

					<TabsContent value="analysis" className="flex-1 mt-0 h-full overflow-y-auto">
						<DocumentAnalysis />
					</TabsContent>

					<TabsContent value="actions" className="flex-1 mt-0 h-full overflow-y-auto">
						<QuickActions />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
