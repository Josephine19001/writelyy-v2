"use client";

import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Card, CardBody } from "@shared/tiptap/components/tiptap-ui-primitive/card";
import { useAiChatHistory } from "@saas/shared/hooks/use-ai-chat-history";
import { X, Trash2, Bot, User } from "lucide-react";
import * as React from "react";
import "./ai-chat-history-panel.scss";

interface AiChatHistoryPanelProps {
	documentId: string;
	isOpen: boolean;
	onClose: () => void;
}

export function AiChatHistoryPanel({
	documentId,
	isOpen,
	onClose,
}: AiChatHistoryPanelProps) {
	const { chatHistory, isLoading, clearHistory } = useAiChatHistory(documentId);

	if (!isOpen) return null;

	const handleClearHistory = () => {
		if (confirm("Are you sure you want to clear the chat history?")) {
			clearHistory();
		}
	};

	return (
		<div className="ai-chat-history-overlay" onClick={onClose}>
			<div
				className="ai-chat-history-panel"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="ai-chat-history-header">
					<div className="ai-chat-history-title">
						<MessageSquare className="h-5 w-5" />
						<h2>AI Chat History</h2>
					</div>
					<div className="ai-chat-history-actions">
						{chatHistory && chatHistory.messages.length > 0 && (
							<Button
								data-style="ghost"
								onClick={handleClearHistory}
								title="Clear history"
								>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
						<Button
							data-style="ghost"
							onClick={onClose}
							title="Close"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>

				{/* Content */}
				<div className="ai-chat-history-content">
					{isLoading ? (
						<div className="ai-chat-history-loading">
							<div className="spinner" />
							<p>Loading chat history...</p>
						</div>
					) : !chatHistory || chatHistory.messages.length === 0 ? (
						<div className="ai-chat-history-empty">
							<Bot className="h-12 w-12 opacity-20" />
							<p className="text-muted-foreground">
								No chat history yet. Start a conversation with AI to see it here.
							</p>
						</div>
					) : (
						<div className="ai-chat-history-messages">
							{chatHistory.messages.map((message, index) => (
								<Card key={index} className="ai-chat-message">
									<CardBody>
										<div className="ai-chat-message-header">
											{message.role === "user" ? (
												<>
													<User className="h-4 w-4" />
													<span className="font-medium">You</span>
												</>
											) : (
												<>
													<Bot className="h-4 w-4" />
													<span className="font-medium">AI Assistant</span>
												</>
											)}
											<span className="text-xs text-muted-foreground">
												{new Date(message.timestamp).toLocaleString()}
											</span>
										</div>
										<div className="ai-chat-message-content">
											{message.content}
										</div>
										{message.sources && message.sources.length > 0 && (
											<div className="ai-chat-message-context">
												<span className="text-xs font-medium">
													Sources: {message.sources.length}
												</span>
											</div>
										)}
										{message.snippets && message.snippets.length > 0 && (
											<div className="ai-chat-message-context">
												<span className="text-xs font-medium">
													Snippets: {message.snippets.length}
												</span>
											</div>
										)}
									</CardBody>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// Helper import (add at top with other imports)
import { MessageSquare } from "lucide-react";
