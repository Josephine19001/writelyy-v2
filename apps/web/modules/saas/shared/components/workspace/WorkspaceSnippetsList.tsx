"use client";

import { SnippetsBrowser } from "./snippets/SnippetsBrowser";

interface Snippet {
	id: string;
	title: string;
	content: string;
	category?: string | null;
	tags: string[];
	createdAt: Date;
	creator: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

interface WorkspaceSnippetsListProps {
	onSnippetSelect?: (snippetId: string) => void;
	selectedSnippetId?: string;
	onInsertSnippet?: (snippet: Snippet) => void;
	onUseAsAIContext?: (snippet: Snippet) => void;
}

export function WorkspaceSnippetsList({
	onSnippetSelect,
	selectedSnippetId,
	onInsertSnippet,
	onUseAsAIContext,
}: WorkspaceSnippetsListProps) {
	return (
		<SnippetsBrowser
			onSnippetSelect={onSnippetSelect ? (snippet) => onSnippetSelect(snippet.id) : undefined}
			selectedSnippetId={selectedSnippetId}
			onInsertSnippet={onInsertSnippet}
			onUseAsAIContext={onUseAsAIContext}
		/>
	);
}