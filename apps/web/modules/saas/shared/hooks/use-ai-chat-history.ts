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

interface ChatListItem {
	id: string;
	title: string;
	documentId: string | null;
	updatedAt: Date;
	messageCount: number;
}

// Cache for chat history to prevent re-fetching
const chatHistoryCache = new Map<string, { data: ChatHistory; timestamp: number }>();
let chatListCache: { data: ChatListItem[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useAiChatHistory(documentId?: string) {
	const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
	const [allChats, setAllChats] = useState<ChatListItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingChats, setIsLoadingChats] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch all chats for the user
	const fetchAllChats = useCallback(async (force = false) => {
		// Check cache first
		if (!force && chatListCache && Date.now() - chatListCache.timestamp < CACHE_DURATION) {
			setAllChats(chatListCache.data);
			return;
		}

		setIsLoadingChats(true);

		try {
			const response = await fetch('/api/ai/chats?limit=50');

			if (!response.ok) {
				throw new Error('Failed to fetch chats');
			}

			const data = await response.json();
			setAllChats(data.chats || []);

			// Update cache
			chatListCache = {
				data: data.chats || [],
				timestamp: Date.now(),
			};
		} catch (err) {
			console.error('Error fetching all chats:', err);
		} finally {
			setIsLoadingChats(false);
		}
	}, []);

	// Fetch chat history with caching
	const fetchChatHistory = useCallback(async (force = false) => {
		if (!documentId) {
			return;
		}

		// Check cache first
		if (!force) {
			const cached = chatHistoryCache.get(documentId);
			if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
				setChatHistory(cached.data);
				return;
			}
		}

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

			// Update cache
			chatHistoryCache.set(documentId, {
				data,
				timestamp: Date.now(),
			});
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
			if (!documentId) {
				return;
			}

			try {
				// Save both user and AI messages in a single batch
				const response = await fetch("/api/ai/chat-history/conversation", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						documentId,
						userMessage: {
							role: "user",
							content: userPrompt,
							timestamp: new Date().toISOString(),
							sources: options?.sources,
							snippets: options?.snippets,
						},
						aiMessage: {
							role: "assistant",
							content: aiResponse,
							timestamp: new Date().toISOString(),
						},
						title: options?.title,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to save conversation");
				}

				const data = await response.json();
				setChatHistory(data);

				// Update cache
				chatHistoryCache.set(documentId, {
					data,
					timestamp: Date.now(),
				});

				return data;
			} catch (err) {
				console.error("Error saving conversation:", err);
				throw err;
			}
		},
		[documentId],
	);

	// Load a specific chat by documentId
	const loadChatByDocumentId = useCallback(async (targetDocumentId: string) => {
		// Check cache first
		const cached = chatHistoryCache.get(targetDocumentId);
		if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
			setChatHistory(cached.data);
			return cached.data;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/ai/chat-history?documentId=${targetDocumentId}`,
			);

			if (!response.ok) {
				throw new Error("Failed to fetch chat history");
			}

			const data = await response.json();
			setChatHistory(data);

			// Update cache
			chatHistoryCache.set(targetDocumentId, {
				data,
				timestamp: Date.now(),
			});

			return data;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Clear chat history
	const clearHistory = useCallback(() => {
		setChatHistory(null);
		if (documentId) {
			chatHistoryCache.delete(documentId);
		}
	}, [documentId]);

	// Load chat history on mount
	useEffect(() => {
		if (documentId) {
			fetchChatHistory();
		}
	}, [documentId, fetchChatHistory]);

	return {
		chatHistory,
		allChats,
		isLoading,
		isLoadingChats,
		error,
		saveMessage,
		saveConversation,
		fetchChatHistory,
		fetchAllChats,
		loadChatByDocumentId,
		clearHistory,
	};
}
