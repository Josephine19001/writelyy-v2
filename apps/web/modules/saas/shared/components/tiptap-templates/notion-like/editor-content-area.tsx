"use client";

import { useSourcesQuery } from "@saas/lib/api";
import { useSnippetsQuery } from "@saas/snippets/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { AiMenu } from "@shared/tiptap/components/tiptap-ui/ai-menu";
import { useScrollToHash } from "@shared/tiptap/components/tiptap-ui/copy-anchor-link-button/use-scroll-to-hash";
import { DragContextMenu } from "@shared/tiptap/components/tiptap-ui/drag-context-menu";
import { EmojiDropdownMenu } from "@shared/tiptap/components/tiptap-ui/emoji-dropdown-menu";
import { MentionDropdownMenu } from "@shared/tiptap/components/tiptap-ui/mention-dropdown-menu";
import { SlashDropdownMenu } from "@shared/tiptap/components/tiptap-ui/slash-dropdown-menu";
import { TableContextMenu } from "@shared/tiptap/components/tiptap-ui/table-context-menu/table-context-menu";
import { useUiEditorState } from "@shared/tiptap/hooks/use-ui-editor-state";
import {
	EditorContext,
	EditorContent as TiptapEditorContent,
} from "@tiptap/react";
import * as React from "react";
import { createPortal } from "react-dom";
import type { Source } from "../../workspace/sources/types";
import { MobileToolbar } from "./toolbar";
import { NotionToolbarFloating } from "./toolbar-floating";

// Helper function to get proper image URL (same as SourcePreview)
const getImageUrl = (source: Source) => {
	if (source.type === "image" && source.filePath) {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const bucketName =
			process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME || "image-sources";
		return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${source.filePath}`;
	}
	return source.url || null;
};

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

	// Get sources and snippets data for slash menu
	const { activeWorkspace } = useActiveWorkspace();
	const { data: sourcesData } = useSourcesQuery(activeWorkspace?.id || "", {
		enabled: !!activeWorkspace?.id,
	});
	const { data: snippetsData } = useSnippetsQuery(activeWorkspace?.id || "", {
		enabled: !!activeWorkspace?.id,
	});

	// Selection based effect to handle AI generation acceptance
	React.useEffect(() => {
		if (!editor) return;

		if (
			!aiGenerationIsLoading &&
			aiGenerationIsSelection &&
			aiGenerationHasMessage
		) {
			// TODO: Check if aiAccept command exists in current Tiptap AI extension version
			// editor.chain().focus().aiAccept().run();
			editor.commands.resetUiState();
		}
	}, [
		aiGenerationHasMessage,
		aiGenerationIsLoading,
		aiGenerationIsSelection,
		editor,
	]);

	useScrollToHash();

	// Make sources and snippets data available globally for slash menu
	React.useEffect(() => {
		if (sourcesData) {
			(window as any).__workspace_sources__ = sourcesData;
		}
	}, [sourcesData]);

	React.useEffect(() => {
		if (snippetsData) {
			(window as any).__workspace_snippets__ = snippetsData;
		}
	}, [snippetsData]);

	// Listen for direct source insertion from slash command
	React.useEffect(() => {
		const handleDirectSourceInsert = (event: any) => {
			const { source } = event.detail;
			handleSourceSelect(source);
		};

		window.addEventListener(
			"tiptap-insert-source-direct",
			handleDirectSourceInsert,
		);

		return () => {
			window.removeEventListener(
				"tiptap-insert-source-direct",
				handleDirectSourceInsert,
			);
		};
	}, []);

	// Listen for direct snippet insertion from slash command
	React.useEffect(() => {
		const handleDirectSnippetInsert = (event: any) => {
			const { snippet } = event.detail;
			handleSnippetSelect(snippet);
		};

		window.addEventListener(
			"tiptap-insert-snippet-direct",
			handleDirectSnippetInsert,
		);

		return () => {
			window.removeEventListener(
				"tiptap-insert-snippet-direct",
				handleDirectSnippetInsert,
			);
		};
	}, []);

	// Handle source selection from modal
	const handleSourceSelect = (source: Source) => {
		if (!editor) return;

		// Insert based on source type
		if (source.type === "image") {
			// Get proper image URL using the helper function
			const imageUrl = getImageUrl(source);

			// For images, use the correct insertion method
			if (!imageUrl) {
				console.warn("🖼️ No valid image URL found");
				return;
			}

			try {
				// Method 1: Try using insertContent with image node (preferred)
				const result = editor
					.chain()
					.focus()
					.insertContent({
						type: "image",
						attrs: {
							src: imageUrl,
							alt: source.name,
							title: source.name,
						},
					})
					.run();

				if (!result) {
					// Method 2: Try setImage command as fallback
					editor
						.chain()
						.focus()
						.setImage({
							src: imageUrl,
							alt: source.name,
							title: source.name,
						})
						.run();
				}
			} catch (error) {
				console.error("🖼️ Failed to insert image:", error);
				// Fallback: Insert as text link
				editor
					.chain()
					.focus()
					.insertContent({
						type: "text",
						text: `[Image: ${source.name}]`,
						marks: [{ type: "link", attrs: { href: imageUrl } }],
					})
					.run();
			}
		} else if (source.type === "url") {
			// For URLs, insert a link
			editor
				.chain()
				.focus()
				.insertContent({
					type: "text",
					text: source.name,
					marks: [{ type: "link", attrs: { href: source.url } }],
				})
				.run();
		} else {
			// For other types (PDFs, docs), insert as a link to the file
			const fileUrl = source.url || source.filePath || "";
			editor
				.chain()
				.focus()
				.insertContent({
					type: "text",
					text: source.name,
					marks: [{ type: "link", attrs: { href: fileUrl } }],
				})
				.run();
		}
	};

	// Handle snippet selection from slash command
	const handleSnippetSelect = (snippet: any) => {
		if (!editor) return;

		// Insert snippet content as plain text
		try {
			editor
				.chain()
				.focus()
				.insertContent({
					type: "text",
					text: snippet.content,
				})
				.run();
		} catch (error) {
			console.error("Failed to insert snippet:", error);
			// Fallback: Insert as plain text
			editor.chain().focus().insertContent(snippet.content).run();
		}
	};

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
			<TableContextMenu />
			<NotionToolbarFloating />

			{createPortal(<MobileToolbar />, document.body)}
		</TiptapEditorContent>
	);
}
