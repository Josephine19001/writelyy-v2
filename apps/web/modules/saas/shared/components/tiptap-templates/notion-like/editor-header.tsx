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

// Export functionality is now handled internally by ExportButton

// import { CollaborationUsers } from "@analyticsui/components/tiptap-templates/notion-like/editor-collaboration-users";

export function NotionEditorHeader() {
	const { editor } = React.useContext(EditorContext)!;
	return (
		<header className="editor-header">
			{/* Left side: Main toolbar with formatting options */}
			<div className="editor-toolbar">
				{/* Undo/Redo */}
				<ButtonGroup orientation="horizontal">
					<UndoRedoButton action="undo" />
					<UndoRedoButton action="redo" />
				</ButtonGroup>
			</div>

			{/* Right side: Export */}
			<div className="editor-header-actions">
				<ExportButton editor={editor} />
			</div>
		</header>
	);
}
