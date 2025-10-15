import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";

/*
 * Workspace Context for Tiptap AI Extensions
 * This provides workspace-aware context to enhance Tiptap's AI capabilities
 */

/*
 * Query Keys
 */
export const workspaceAiContextQueryKey = (organizationId: string) =>
	["workspace-ai-context", organizationId] as const;
export const documentContextQueryKey = (documentId: string) =>
	["document-ai-context", documentId] as const;

/*
 * Get Workspace Context for AI
 * Provides comprehensive workspace data for AI Agent custom tools
 */
export const useWorkspaceAiContextQuery = (
	organizationId: string,
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: workspaceAiContextQueryKey(organizationId),
		queryFn: async () => {
			// Get all workspace data in parallel for AI context
			const [documentsResult, foldersResult, sourcesResult] = await Promise.all([
				orpcClient.documents.list({
					organizationId,
					limit: 100, // Get substantial context
				}),
				orpcClient.folders.list({
					organizationId,
					includeDocuments: false,
				}),
				orpcClient.sources.list({
					organizationId,
					limit: 50,
				}),
			]);

			return {
				documents: documentsResult.documents,
				folders: foldersResult.folders,
				sources: sourcesResult.sources,
				totalDocuments: documentsResult.total,
				totalSources: sourcesResult.total,
			};
		},
		enabled: options?.enabled !== false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

/*
 * Get Document Context for AI
 * Provides specific document context including related sources
 */
export const useDocumentAiContextQuery = (
	documentId: string,
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: documentContextQueryKey(documentId),
		queryFn: async () => {
			const { document } = await orpcClient.documents.find({ id: documentId });
			
			// Get related documents in same folder/workspace
			const relatedDocs = await orpcClient.documents.list({
				organizationId: document.organizationId,
				folderId: document.folderId || undefined,
				limit: 10,
			});

			return {
				document,
				relatedDocuments: relatedDocs.documents.filter(d => d.id !== documentId),
				linkedSources: document.documentSources || [],
				folderContext: document.folder,
			};
		},
		enabled: options?.enabled !== false && !!documentId,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});
};

/*
 * Send Message with Workspace Context
 * Enhanced version that includes workspace knowledge
 */
export const sendAiMessageWithContextMutationKey = ["send-ai-message-with-context"] as const;
export const useSendAiMessageWithContextMutation = () => {
	return useMutation({
		mutationKey: sendAiMessageWithContextMutationKey,
		mutationFn: async ({
			chatId,
			messages,
			includeDocuments = true,
			includeSources = true,
			documentId,
			selectedText,
			mentions,
		}: {
			chatId: string;
			messages: any[];
			includeDocuments?: boolean;
			includeSources?: boolean;
			documentId?: string;
			selectedText?: string;
			mentions?: Array<{
				id: string;
				name: string;
				type: "document" | "folder" | "source" | "asset";
				subtype?: "image" | "pdf" | "link";
				url?: string;
				content?: string;
				category?: string;
			}>;
		}) => {
			// Use our enhanced API that includes workspace context
			return await orpcClient.ai.chats.messages.addWithContext({
				chatId,
				messages,
				includeDocuments,
				includeSources,
				documentId,
				selectedText,
				mentions,
			});
		},
	});
};

/*
 * Workspace AI Tools for Tiptap AI Agent Extension
 * These tools can be added to the AI Agent to give it workspace capabilities
 */

// Tool: Search workspace documents
export const createSearchDocumentsTool = (organizationId: string) => ({
	name: "search_workspace_documents",
	description: "Search for documents in the current workspace by title, content, or tags",
	parameters: {
		type: "object",
		properties: {
			query: {
				type: "string",
				description: "Search query for documents",
			},
			limit: {
				type: "number",
				description: "Maximum number of results to return",
				default: 5,
			},
		},
		required: ["query"],
	},
	handler: async ({ query, limit = 5 }: { query: string; limit?: number }) => {
		const result = await orpcClient.documents.list({
			organizationId,
			search: query,
			limit,
		});
		
		return result.documents.map(doc => ({
			id: doc.id,
			title: doc.title,
			description: doc.description,
			folder: doc.folder?.name,
			wordCount: doc.wordCount,
			lastUpdated: doc.updatedAt,
		}));
	},
});

// Tool: Get source content
export const createGetSourceContentTool = (organizationId: string) => ({
	name: "get_source_content",
	description: "Retrieve content from workspace sources (PDFs, docs, URLs) for research",
	parameters: {
		type: "object",
		properties: {
			sourceId: {
				type: "string",
				description: "ID of the source to retrieve",
			},
		},
		required: ["sourceId"],
	},
	handler: async ({ sourceId }: { sourceId: string }) => {
		const { source } = await orpcClient.sources.find({ id: sourceId });
		
		// Verify source belongs to workspace
		if (source.organizationId !== organizationId) {
			throw new Error("Source not found in current workspace");
		}
		
		return {
			name: source.name,
			type: source.type,
			content: source.url || source.filePath || '',
			metadata: source.metadata,
			linkedDocuments: source.documentSources?.map(ds => ds.document?.title),
		};
	},
});

// Tool: Create document reference
export const createDocumentReferenceTool = (organizationId: string) => ({
	name: "create_document_reference",
	description: "Create a reference or link to another document in the workspace",
	parameters: {
		type: "object",
		properties: {
			documentId: {
				type: "string",
				description: "ID of the document to reference",
			},
			context: {
				type: "string",
				description: "Context for why this document is being referenced",
			},
		},
		required: ["documentId"],
	},
	handler: async ({ documentId, context }: { documentId: string; context?: string }) => {
		const { document } = await orpcClient.documents.find({ id: documentId });
		
		// Verify document belongs to workspace
		if (document.organizationId !== organizationId) {
			throw new Error("Document not found in current workspace");
		}
		
		return {
			reference: `[[${document.title}]]`,
			url: `/app/${document.organizationId}/documents/${document.slug || document.id}`,
			title: document.title,
			description: document.description,
			context,
		};
	},
});

/*
 * Helper: Build AI Agent Tools for Workspace
 */
export const buildWorkspaceAiTools = (organizationId: string) => [
	createSearchDocumentsTool(organizationId),
	createGetSourceContentTool(organizationId),
	createDocumentReferenceTool(organizationId),
];

/*
 * Helper: Build Workspace Context for AI Prompts
 */
export const buildWorkspaceContextPrompt = (workspaceContext: any, currentDocument?: any) => {
	const parts: string[] = [];
	
	if (currentDocument) {
		parts.push(`Current Document: "${currentDocument.title}"`);
		if (currentDocument.description) {
			parts.push(`Description: ${currentDocument.description}`);
		}
		if (currentDocument.folder) {
			parts.push(`Folder: ${currentDocument.folder.name}`);
		}
	}
	
	if (workspaceContext?.documents?.length > 0) {
		const recentDocs = workspaceContext.documents.slice(0, 5);
		parts.push(`Recent Workspace Documents:\n${
			recentDocs.map((doc: any) => `- ${doc.title}`).join('\n')
		}`);
	}
	
	if (workspaceContext?.sources?.length > 0) {
		const sources = workspaceContext.sources.slice(0, 3);
		parts.push(`Available Sources:\n${
			sources.map((source: any) => `- ${source.name} (${source.type})`).join('\n')
		}`);
	}
	
	return parts.length > 0 ? `\n\nWorkspace Context:\n${parts.join('\n\n')}\n` : '';
};