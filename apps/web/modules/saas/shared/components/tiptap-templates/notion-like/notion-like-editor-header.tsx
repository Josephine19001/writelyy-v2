"use client";

import { ThemeToggle } from "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-theme-toggle";

// --- Tiptap UI ---
import { UndoRedoButton } from "@shared/tiptap/components/tiptap-ui/undo-redo-button";
import { ButtonGroup } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Separator } from "@shared/tiptap/components/tiptap-ui-primitive/separator";
// --- UI Primitives ---
import { Spacer } from "@shared/tiptap/components/tiptap-ui-primitive/spacer";

// --- Styles ---
import "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-header.scss";

import { CollaborationUsers } from "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-collaboration-users";

export function NotionEditorHeader() {
	return (
		<header className="notion-like-editor-header">
			<Spacer />
			<div className="notion-like-editor-header-actions">
				<ButtonGroup orientation="horizontal">
					<UndoRedoButton action="undo" />
					<UndoRedoButton action="redo" />
				</ButtonGroup>

				<Separator />

				<ThemeToggle />

				<Separator />

				<CollaborationUsers />
			</div>
		</header>
	);
}
