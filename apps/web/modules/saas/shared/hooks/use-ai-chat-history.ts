import { useCallback, useEffect, useState } from "react";

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
	timestamp: string;
	sources?: any[];
	snippets?: any[];
}

interface ChatHistory {
	chatId: string;
	messages: ChatMessage[];
	title: string;
}

export function useAiChatHistory(documentId?: string) {
	const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch chat history
	const fetchChatHistory = useCallback(async () => {
		if (!documentId) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/ai/chat-history?documentId=${documentId}`,
			);

			if (!response.ok) {
				throw new Error("Failed to fetch chat history");
			}

			const data = await response.json();
			setChatHistory(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setIsLoading(false);
		}
	}, [documentId]);

	// Save a message to chat history
	const saveMessage = useCallback(
		async (message: Omit<ChatMessage, "timestamp">) => {
			if (!documentId) return;

			try {
				const response = await fetch("/api/ai/chat-history", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						documentId,
						message: {
							...message,
							timestamp: new Date().toISOString(),
						},
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to save message");
				}

				const data = await response.json();
				setChatHistory(data);

				return data;
			} catch (err) {
				console.error("Error saving message:", err);
				throw err;
			}
		},
		[documentId],
	);

	// Save a conversation (user prompt + AI response)
	const saveConversation = useCallback(
		async (
			userPrompt: string,
			aiResponse: string,
			options?: {
				sources?: any[];
				snippets?: any[];
				title?: string;
			},
		) => {
			if (!documentId) return;

			try {
				// Save user message with optional title
				await saveMessage({
					role: "user",
					content: userPrompt,
					sources: options?.sources,
					snippets: options?.snippets,
				});

				// Save AI response
				const response = await saveMessage({
					role: "assistant",
					content: aiResponse,
				});

				// Update title if provided (for first message)
				if (options?.title && response) {
					setChatHistory(prev => prev ? { ...prev, title: options.title || prev.title } : null);
				}
			} catch (err) {
				console.error("Error saving conversation:", err);
			}
		},
		[documentId, saveMessage],
	);

	// Clear chat history
	const clearHistory = useCallback(() => {
		setChatHistory(null);
	}, []);

	// Load chat history on mount
	useEffect(() => {
		if (documentId) {
			fetchChatHistory();
		}
	}, [documentId, fetchChatHistory]);

	return {
		chatHistory,
		isLoading,
		error,
		saveMessage,
		saveConversation,
		fetchChatHistory,
		clearHistory,
	};
}
