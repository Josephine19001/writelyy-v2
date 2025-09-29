"use client";

import { UiState } from "@shared/tiptap/components/tiptap-extension/ui-state-extension";
// --- Custom Extensions ---
import { HorizontalRule } from "@shared/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { Image } from "@shared/tiptap/components/tiptap-node/image-node/image-node-extension";
// --- Tiptap Node ---
import { ImageUploadNode } from "@shared/tiptap/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { useScrollToHash } from "@shared/tiptap/components/tiptap-ui/copy-anchor-link-button/use-scroll-to-hash";
// --- Hooks ---
import { useUiEditorState } from "@shared/tiptap/hooks/use-ui-editor-state";
import { Collaboration, isChangeOrigin } from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Mathematics } from "@tiptap/extension-mathematics";
// import { Mention } from "@tiptap/extension-mention";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { UniqueID } from "@tiptap/extension-unique-id";
import { Placeholder, Selection } from "@tiptap/extensions";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Ai } from "@tiptap-pro/extension-ai";
import type { TiptapCollabProvider } from "@tiptap-pro/provider";
import * as React from "react";
import { createPortal } from "react-dom";
import type { Doc as YDoc } from "yjs";
import "@shared/tiptap/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@shared/tiptap/components/tiptap-node/code-block-node/code-block-node.scss";
import "@shared/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@shared/tiptap/components/tiptap-node/list-node/list-node.scss";
import "@shared/tiptap/components/tiptap-node/image-node/image-node.scss";
import "@shared/tiptap/components/tiptap-node/heading-node/heading-node.scss";
import "@shared/tiptap/components/tiptap-node/paragraph-node/paragraph-node.scss";

import { AiMenu } from "@shared/tiptap/components/tiptap-ui/ai-menu";
import { DragContextMenu } from "@shared/tiptap/components/tiptap-ui/drag-context-menu";
// --- Tiptap UI ---
import { EmojiDropdownMenu } from "@shared/tiptap/components/tiptap-ui/emoji-dropdown-menu";
import { MentionDropdownMenu } from "@shared/tiptap/components/tiptap-ui/mention-dropdown-menu";
import { SlashDropdownMenu } from "@shared/tiptap/components/tiptap-ui/slash-dropdown-menu";
import { AiProvider, useAi } from "@shared/tiptap/contexts/ai-context";
// --- Contexts ---
import { AppProvider } from "@shared/tiptap/contexts/app-context";
import {
	CollabProvider,
	useCollab,
} from "@shared/tiptap/contexts/collab-context";
import { UserProvider, useUser } from "@shared/tiptap/contexts/user-context";
import { TIPTAP_AI_APP_ID } from "@shared/tiptap/lib/tiptap-collab-utils";
// --- Lib ---
import {
	handleImageUpload,
	MAX_FILE_SIZE,
} from "@shared/tiptap/lib/tiptap-utils";

// --- Styles ---
import "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor.scss";

// --- Content ---
import { NotionEditorHeader } from "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-header";
import { MobileToolbar } from "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-mobile-toolbar";
import { NotionToolbarFloating } from "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-toolbar-floating";

export interface NotionEditorProps {
	room: string;
	placeholder?: string;
	onChange?: (content: any) => void;
	initialContent?: any;
}

export interface EditorProviderProps {
	provider: TiptapCollabProvider | null;
	ydoc: YDoc;
	placeholder?: string;
	aiToken: string | null;
	onChange?: (content: any) => void;
	initialContent?: any;
}

/**
 * Loading spinner component shown while connecting to the notion server
 */
export function LoadingSpinner({ text = "Connecting..." }: { text?: string }) {
	return (
		<div className="spinner-container">
			<div className="spinner-content">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<title>Loader</title>
					<circle cx="12" cy="12" r="10" />
					<path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
				</svg>
				<div className="spinner-loading-text">{text}</div>
			</div>
		</div>
	);
}

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
		<EditorContent
			editor={editor}
			role="presentation"
			className="notion-like-editor-content"
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
		</EditorContent>
	);
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
	} = props;

	const { user } = useUser();

	console.log("🔧 EditorProvider rendered with onChange:", !!onChange);

	// Use refs to store current values to avoid recreating editor
	const onChangeRef = React.useRef(onChange);
	const initialContentRef = React.useRef(initialContent);

	// Update refs when values change
	React.useEffect(() => {
		onChangeRef.current = onChange;
		initialContentRef.current = initialContent;
	}, [onChange, initialContent]);

	const editor = useEditor(
		{
			immediatelyRender: false,
			shouldRerenderOnTransaction: false,
			enableInputRules: true,
			enablePasteRules: true,
			enableCoreExtensions: true,
			content: initialContent,
			onUpdate: ({ editor, transaction }) => {
				console.log("🔄 Editor onUpdate triggered");
				console.log("Has onChange callback:", !!onChangeRef.current);
				console.log("Transaction meta preventUpdate:", transaction.getMeta('preventUpdate'));
				console.log("Transaction origin:", transaction.getMeta('origin'));
				
				// Call onChange for all user changes, not just non-collaborative ones
				if (onChangeRef.current) {
					const content = editor.getJSON();
					console.log("📝 Calling onChange with content:", content);
					onChangeRef.current(content);
				} else {
					console.log("❌ No onChange callback provided");
				}
			},
			onCreate: ({ editor }) => {
				console.log("🎉 Editor onCreate called");
				console.log("🎉 Initial content ref:", initialContentRef.current);
				console.log("🎉 onChange ref:", !!onChangeRef.current);
				
				// Always set initial content if provided, regardless of onChange
				if (initialContentRef.current) {
					console.log("🎉 Setting initial content:", initialContentRef.current);
					setTimeout(() => {
						const currentContent = editor.getJSON();
						console.log("🎉 Current editor content:", currentContent);
						console.log("🎉 Expected initial content:", initialContentRef.current);
						
						if (JSON.stringify(currentContent) !== JSON.stringify(initialContentRef.current)) {
							console.log("🎉 Content differs, setting new content");
							editor.commands.setContent(initialContentRef.current, false, { preventUpdate: true });
						} else {
							console.log("🎉 Content matches, no need to set");
						}
					}, 100);
				} else {
					console.log("🎉 No initial content provided");
				}
			},
			editorProps: {
				attributes: {
					class: "notion-like-editor",
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
					onSuccess: (url) =>
						console.log("Upload successful, URL:", url),
				}),
				UniqueID.configure({
					types: [
						"paragraph",
						"bulletList",
						"orderedList",
						"taskList",
						"heading",
						"blockquote",
						"codeBlock",
					],
					filterTransaction: (transaction) =>
						!isChangeOrigin(transaction),
				}),
				Typography,
				UiState,
				// Only include AI extension if we have a token
				...(aiToken
					? [
							Ai.configure({
								appId: TIPTAP_AI_APP_ID,
								token: aiToken,
								autocompletion: false,
								showDecorations: true,
								hideDecorationsOnStreamEnd: false,
								onLoading: (context) => {
									context.editor.commands.aiGenerationSetIsLoading(
										true,
									);
									context.editor.commands.aiGenerationHasMessage(
										false,
									);
								},
								onChunk: (context) => {
									context.editor.commands.aiGenerationSetIsLoading(
										true,
									);
									context.editor.commands.aiGenerationHasMessage(
										true,
									);
								},
								onSuccess: (context) => {
									const hasMessage = !!context.response;
									context.editor.commands.aiGenerationSetIsLoading(
										false,
									);
									context.editor.commands.aiGenerationHasMessage(
										hasMessage,
									);
								},
							}),
						]
					: []),
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
				<NotionEditorHeader />
				<EditorContentArea />
			</EditorContext.Provider>
		</div>
	);
}

/**
 * Full editor with all necessary providers, ready to use with just a room ID
 */
export function NotionEditor({
	room,
	placeholder = "Start writing...",
	onChange,
	initialContent,
}: NotionEditorProps) {
	console.log("🔧 NotionEditor rendered with:");
	console.log("  - room:", room);
	console.log("  - onChange:", !!onChange);
	console.log("  - initialContent:", initialContent);
	
	return (
		<UserProvider>
			<AppProvider>
				<CollabProvider room={room}>
					<AiProvider>
						<NotionEditorContent
							placeholder={placeholder}
							onChange={onChange}
							initialContent={initialContent}
						/>
					</AiProvider>
				</CollabProvider>
			</AppProvider>
		</UserProvider>
	);
}

/**
 * Internal component that handles the editor loading state
 */
export function NotionEditorContent({
	placeholder,
	onChange,
	initialContent,
}: {
	placeholder?: string;
	onChange?: (content: any) => void;
	initialContent?: any;
}) {
	const { provider, ydoc } = useCollab();
	const { aiToken } = useAi();

	console.log("🔧 NotionEditorContent rendered with onChange:", !!onChange);
	console.log("🔧 NotionEditorContent initialContent:", initialContent);

	// Since collaboration is disabled, only wait for AI token (if needed)
	// If AI token is null, we'll just disable AI features but still show editor
	const isWaitingForRequiredTokens = false; // No required tokens for now

	if (isWaitingForRequiredTokens) {
		return <LoadingSpinner />;
	}

	return (
		<EditorProvider
			provider={provider || null}
			ydoc={ydoc}
			placeholder={placeholder}
			aiToken={aiToken}
			onChange={onChange}
			initialContent={initialContent}
		/>
	);
}
