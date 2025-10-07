"use client";

import { UiState } from "@shared/tiptap/components/tiptap-extension/ui-state-extension";
import { ChartBlockNode } from "@shared/tiptap/components/tiptap-node/chart-block-node/chart-block-node-extension";
import { DrawingBlockNode } from "@shared/tiptap/components/tiptap-node/drawing-block-node/drawing-block-node-extension";
import { HorizontalRule } from "@shared/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { Image } from "@shared/tiptap/components/tiptap-node/image-node/image-node-extension";
import { ImageUploadNode } from "@shared/tiptap/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { SnippetBlockNode } from "@shared/tiptap/components/tiptap-node/snippet-block-node/snippet-block-node-extension";
import { useUser } from "@shared/tiptap/contexts/user-context";
import { TIPTAP_AI_APP_ID } from "@shared/tiptap/lib/tiptap-collab-utils";
import {
	handleImageUpload,
	MAX_FILE_SIZE,
} from "@shared/tiptap/lib/tiptap-utils";
import { Collaboration, isChangeOrigin } from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Mathematics } from "@tiptap/extension-mathematics";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableCell, TableKit } from "@tiptap/extension-table";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { UniqueID } from "@tiptap/extension-unique-id";
import { Placeholder, Selection } from "@tiptap/extensions";
import { EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { PageKit } from "@tiptap-pro/extension-pages";
import type { TiptapCollabProvider } from "@tiptap-pro/provider";
import * as React from "react";
import type { Doc as YDoc } from "yjs";

import { EditorContentArea } from "./editor-content-area";
import { EditorFooter } from "./editor-footer";
import { NotionEditorHeader } from "./editor-header";
import { LoadingSpinner } from "./loading-spinner";
import { EditorProvider as CustomEditorProvider } from "@shared/tiptap/contexts/editor-context";

export interface EditorProviderProps {
	provider: TiptapCollabProvider | null;
	ydoc: YDoc;
	placeholder?: string;
	aiToken: string | null;
	onChange?: (content: any) => void;
	initialContent?: any;
	savingState?: {
		isSaving: boolean;
		lastSaved: Date | null;
		hasUnsavedChanges: boolean;
	};
}

/**
 * Component that creates and provides the editor instance
 */
export function EditorProvider(props: EditorProviderProps) {
	const {
		provider,
		ydoc,
		placeholder = "Start writing...",
		aiToken,
		onChange,
		initialContent,
		savingState,
	} = props;

	const { user } = useUser();

	// Custom table cell with backgroundColor support (exactly like the working example)
	const CustomTableCell = React.useMemo(() => {
		return TableCell.extend({
			addAttributes() {
				return {
					// extend the existing attributes
					...this.parent?.(),
					// add backgroundColor attribute
					backgroundColor: {
						default: null,
						parseHTML: (element) =>
							element.getAttribute("data-background-color"),
						renderHTML: (attributes) => {
							return {
								"data-background-color":
									attributes.backgroundColor,
								style: `background-color: ${attributes.backgroundColor}`,
							};
						},
					},
				};
			},
		});
	}, []);

	// Simple approach: Use values directly - no dangerous ref management

	const editor = useEditor(
		{
			immediatelyRender: false,
			shouldRerenderOnTransaction: false,
			enableInputRules: true,
			enablePasteRules: true,
			enableCoreExtensions: true,
			content: initialContent,
			onUpdate: ({ editor, transaction }) => {
				// CRITICAL: Only save non-empty content
				if (onChange) {
					const content = editor.getJSON();
					
					// Check if content is actually empty
					const isEmpty = !content || 
						!content.content || 
						content.content.length === 0 ||
						(content.content.length === 1 && 
						 content.content[0].type === 'paragraph' && 
						 (!content.content[0].content || content.content[0].content.length === 0));
					
					if (!isEmpty || transaction.getMeta('allowEmpty')) {
						onChange(content);
					} else {
						console.warn('🛡️ Prevented empty content save');
					}
				}
			},
			onCreate: ({ editor }) => {
				console.log('🤖 AI Commands:', Object.keys(editor.commands).filter(cmd => cmd.startsWith('ai')));
				console.log('🤖 Available Extensions:', editor.extensionManager.extensions.map(ext => ext.name));
				console.log('🤖 AI Extension Check:', {
					hasAi: editor.extensionManager.extensions.some(ext => ext.name === 'ai'),
					hasAiGeneration: editor.extensionManager.extensions.some(ext => ext.name === 'aiGeneration'),
					allExtensions: editor.extensionManager.extensions.map(ext => ext.name)
				});
				// Simple approach: Editor will use content prop for initialization
				// No dangerous post-creation content manipulation
			},
			editorProps: {
				attributes: {
					class: "editor",
				},
				handleKeyDown: (view, event) => {
					// Allow default behavior for all keys to ensure proper functionality
					return false;
				},
			},
			extensions: [
				StarterKit.configure({
					// Enable undo/redo when not using collaboration
					// When using collaboration, undo/redo should be disabled to avoid conflicts
					...(provider ? { history: false } : {}),
					horizontalRule: false,
					dropcursor: {
						width: 2,
					},
					// Ensure all essential extensions are enabled
					paragraph: {},
					heading: {},
					bulletList: {},
					orderedList: {},
					listItem: {},
					blockquote: {},
					codeBlock: {},
					bold: {},
					italic: {},
					strike: {},
					code: {},
					// Essential extensions use default config (just enabled)
				}),
				HorizontalRule,
				TextAlign.configure({ types: ["heading", "paragraph"] }),
				...(provider
					? [
							Collaboration.configure({ document: ydoc }),
							CollaborationCaret.configure({
								provider,
								user: {
									id: user.id,
									name: user.name,
									color: user.color,
								},
							}),
						]
					: []),
				Placeholder.configure({
					placeholder,
					emptyNodeClass: "is-empty with-slash",
				}),
				// Mention,
				Emoji.configure({
					emojis: gitHubEmojis.filter(
						(emoji) => !emoji.name.includes("regional"),
					),
					forceFallbackImages: true,
				}),
				Mathematics,
				Superscript,
				Subscript,
				Color,
				TextStyle,
				TaskList,
				TaskItem.configure({ nested: true }),
				Highlight.configure({ multicolor: true }),
				Selection.configure({
					// Ensure the selection extension can handle node selection properly
					createSelectionBetween: () => null,
					disableClick: false,
				}),
				Image,
				ImageUploadNode.configure({
					accept: "image/*",
					maxSize: MAX_FILE_SIZE,
					limit: 3,
					upload: handleImageUpload,
					onError: (error) => console.error("Upload failed:", error),
					onSuccess: (url) => {},
				}),
				// Table extensions (exactly like the working example)
				TableKit.configure({
					table: { resizable: true },
					tableCell: false, // Disable default TableCell to use our custom one
				}),
				// Custom TableCell with backgroundColor support
				CustomTableCell,
				// Custom block extensions
				ChartBlockNode,
				SnippetBlockNode,
				DrawingBlockNode,
				UniqueID.configure({
					types: [
						"paragraph",
						"bulletList",
						"orderedList",
						"taskList",
						"heading",
						"blockquote",
						"codeBlock",
						"table",
						"chartBlock",
						"snippetBlock",
						"drawingBlock",
					],
					filterTransaction: (transaction) =>
						!isChangeOrigin(transaction),
				}),
				Typography,
				// Page layout with Google Docs-like page demarcation
				PageKit.configure({
					pages: {
						pageFormat: "A4",
						header: "",
						footer: "Page {page} of {total}",
						pageBreakBackground: "var(--tt-border-color)",
					},
				}),
				UiState,
				// Custom AI integration will be handled separately
			],
		},
		[], // Empty dependency array to prevent unnecessary recreations
	);

	if (!editor) {
		return <LoadingSpinner />;
	}

	return (
		<div className="notion-like-editor-wrapper">
			<EditorContext.Provider value={{ editor }}>
				<CustomEditorProvider editor={editor}>
					<NotionEditorHeader />
					<EditorContentArea />
					<EditorFooter
						isSaving={savingState?.isSaving}
						lastSaved={savingState?.lastSaved}
						hasUnsavedChanges={savingState?.hasUnsavedChanges}
					/>
				</CustomEditorProvider>
			</EditorContext.Provider>
		</div>
	);
}
