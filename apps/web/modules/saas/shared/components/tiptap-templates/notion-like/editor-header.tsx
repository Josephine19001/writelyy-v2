"use client";

// --- Tiptap UI ---
import { UndoRedoButton } from "@shared/tiptap/components/tiptap-ui/undo-redo-button";
import { ButtonGroup } from "@shared/tiptap/components/tiptap-ui-primitive/button";
// --- UI Primitives ---

// --- Styles ---
import "./editor-header.scss";

import { ExportButton } from "@shared/tiptap/components/tiptap-ui/export-button";
import { EditorContext } from "@tiptap/react";
import * as React from "react";
import { AiChatHistoryButton } from "./ai-chat-history-button";
import { AiChatHistoryPanel } from "./ai-chat-history-panel";

// Export functionality is now handled internally by ExportButton

// import { CollaborationUsers } from "@analyticsui/components/tiptap-templates/notion-like/editor-collaboration-users";

interface NotionEditorHeaderProps {
	documentId?: string;
}

export function NotionEditorHeader({ documentId }: NotionEditorHeaderProps) {
	const { editor } = React.useContext(EditorContext)!;
	const [isChatHistoryOpen, setIsChatHistoryOpen] = React.useState(false);

	return (
		<>
			<header className="editor-header">
				{/* Left side: Main toolbar with formatting options */}
				<div className="editor-toolbar">
					{/* Undo/Redo */}
					<ButtonGroup orientation="horizontal">
						<UndoRedoButton action="undo" />
						<UndoRedoButton action="redo" />
					</ButtonGroup>
				</div>

				{/* Right side: AI Chat History and Export */}
				<div className="editor-header-actions">
					<ButtonGroup orientation="horizontal">
						{documentId && (
							<AiChatHistoryButton
								onClick={() => setIsChatHistoryOpen(true)}
							/>
						)}
						<ExportButton editor={editor} />
					</ButtonGroup>
				</div>
			</header>

			{/* AI Chat History Panel */}
			{documentId && (
				<AiChatHistoryPanel
					documentId={documentId}
					isOpen={isChatHistoryOpen}
					onClose={() => setIsChatHistoryOpen(false)}
				/>
			)}
		</>
	);
}
