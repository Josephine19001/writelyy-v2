"use client";

import { cn } from "@ui/lib";
import {
	Bot,
	Send,
	Sparkles,
	FileText,
	Languages,
	MoreHorizontal,
	MessageSquare,
	BookOpen,
	Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/card";
import { Badge } from "@ui/components/badge";
import { ScrollArea } from "@ui/components/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";

interface ChatMessage {
	id: string;
	role: "user" | "ai";
	content: string;
	timestamp: Date;
}

interface Suggestion {
	id: string;
	type: "grammar" | "style" | "clarity" | "tone";
	title: string;
	description: string;
	severity: "low" | "medium" | "high";
}

// Mock data
const mockMessages: ChatMessage[] = [
	{
		id: "1",
		role: "ai",
		content: "Hello! I'm here to help you with your document. Ask me anything about writing, editing, or improving your content.",
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

function ChatInterface() {
	const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
	const [inputValue, setInputValue] = useState("");

	const handleSendMessage = () => {
		if (!inputValue.trim()) return;

		const newMessage: ChatMessage = {
			id: Date.now().toString(),
			role: "user",
			content: inputValue,
			timestamp: new Date(),
		};

		setMessages(prev => [...prev, newMessage]);
		setInputValue("");

		// Simulate AI response
		setTimeout(() => {
			const aiResponse: ChatMessage = {
				id: (Date.now() + 1).toString(),
				role: "ai",
				content: "I understand your question. Let me help you with that...",
				timestamp: new Date(),
			};
			setMessages(prev => [...prev, aiResponse]);
		}, 1000);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className="flex flex-col h-full">
			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
					{messages.map((message) => (
						<div
							key={message.id}
							className={cn(
								"flex gap-3",
								message.role === "user" ? "justify-end" : "justify-start"
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
										: "bg-muted"
								)}
							>
								{message.content}
							</div>
						</div>
					))}
				</div>
			</ScrollArea>

			<div className="p-4 border-t">
				<div className="flex gap-2">
					<Input
						placeholder="Ask AI about your document..."
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyPress={handleKeyPress}
						className="flex-1"
					/>
					<Button size="sm" onClick={handleSendMessage}>
						<Send className="w-4 h-4" />
					</Button>
				</div>
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
						<Card key={suggestion.id} className="border border-border">
							<CardContent className="p-3">
								<div className="flex items-start gap-2">
									<div className="mt-0.5">{getTypeIcon(suggestion.type)}</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-medium text-sm">{suggestion.title}</span>
											<Badge 
												variant="outline" 
												className={cn("text-xs", getSeverityColor(suggestion.severity))}
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
							<div className="text-xs font-medium">{action.label}</div>
							<div className="text-xs text-muted-foreground">{action.description}</div>
						</div>
					</Button>
				))}
			</div>
		</div>
	);
}

export function RightAIPanel() {
	return (
		<div className="flex flex-col h-full">
			<div className="p-4 border-b">
				<div className="flex items-center gap-2">
					<Bot className="w-5 h-5 text-primary" />
					<h2 className="font-semibold">AI Assistant</h2>
				</div>
			</div>

			<div className="flex-1">
				<Tabs defaultValue="chat" className="h-full flex flex-col">
					<TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
						<TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
						<TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
						<TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
					</TabsList>
					
					<TabsContent value="chat" className="flex-1 mt-0">
						<ChatInterface />
					</TabsContent>
					
					<TabsContent value="analysis" className="flex-1 mt-0">
						<DocumentAnalysis />
					</TabsContent>
					
					<TabsContent value="actions" className="flex-1 mt-0">
						<QuickActions />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}