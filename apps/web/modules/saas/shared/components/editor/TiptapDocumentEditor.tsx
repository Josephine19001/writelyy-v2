"use client";

import { useDocumentQuery } from "@saas/lib/api";
import { NotionEditor } from "../tiptap-templates/notion-like/notion-like-editor";

interface TiptapDocumentEditorProps {
	documentId: string;
	initialContent?: string;
	onContentChange?: (content: string) => void;
}

export function TiptapDocumentEditor({
	documentId,
}: TiptapDocumentEditorProps) {
	// Fetch document data for verification/metadata
	const { data: document, isLoading } = useDocumentQuery(documentId, {
		enabled: !!documentId,
	});

	// Get the document room ID for collaboration
	// The NotionEditor will handle loading/saving content through the collaboration provider
	const room = `document-${documentId}`;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
				<span className="ml-2 text-sm text-muted-foreground">
					Loading document...
				</span>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-card">
			<NotionEditor
				room={room}
				placeholder={
					document?.title
						? `Continue writing "${document.title}"...`
						: "Start writing your document..."
				}
			/>
		</div>
	);
}
