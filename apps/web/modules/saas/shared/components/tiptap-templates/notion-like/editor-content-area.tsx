"use client";

import { useScrollToHash } from "@shared/tiptap/components/tiptap-ui/copy-anchor-link-button/use-scroll-to-hash";
import { useUiEditorState } from "@shared/tiptap/hooks/use-ui-editor-state";
import {
	EditorContent as TiptapEditorContent,
	EditorContext,
} from "@tiptap/react";
import * as React from "react";
import { createPortal } from "react-dom";

import { AiMenu } from "@shared/tiptap/components/tiptap-ui/ai-menu";
import { DragContextMenu } from "@shared/tiptap/components/tiptap-ui/drag-context-menu";
import { EmojiDropdownMenu } from "@shared/tiptap/components/tiptap-ui/emoji-dropdown-menu";
import { MentionDropdownMenu } from "@shared/tiptap/components/tiptap-ui/mention-dropdown-menu";
import { SlashDropdownMenu } from "@shared/tiptap/components/tiptap-ui/slash-dropdown-menu";
import { MobileToolbar } from "./toolbar";
import { NotionToolbarFloating } from "./toolbar-floating";

/**
 * EditorContent component that renders the actual editor
 */
export function EditorContentArea() {
	const { editor } = React.useContext(EditorContext)!;
	const {
		aiGenerationIsLoading,
		aiGenerationIsSelection,
		aiGenerationHasMessage,
		isDragging,
	} = useUiEditorState(editor);

	// Selection based effect to handle AI generation acceptance
	React.useEffect(() => {
		if (!editor) return;

		if (
			!aiGenerationIsLoading &&
			aiGenerationIsSelection &&
			aiGenerationHasMessage
		) {
			editor.chain().focus().aiAccept().run();
			editor.commands.resetUiState();
		}
	}, [
		aiGenerationHasMessage,
		aiGenerationIsLoading,
		aiGenerationIsSelection,
		editor,
	]);

	useScrollToHash();

	if (!editor) {
		return null;
	}

	return (
		<TiptapEditorContent
			editor={editor}
			role="presentation"
			className="editor-content"
			style={{
				cursor: isDragging ? "grabbing" : "auto",
			}}
		>
			<DragContextMenu />
			<AiMenu />
			<EmojiDropdownMenu />
			<MentionDropdownMenu />
			<SlashDropdownMenu />
			<NotionToolbarFloating />

			{createPortal(<MobileToolbar />, document.body)}
		</TiptapEditorContent>
	);
}
