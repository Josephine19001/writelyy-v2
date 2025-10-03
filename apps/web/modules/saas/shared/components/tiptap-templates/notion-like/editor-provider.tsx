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
import { Ai } from "@tiptap-pro/extension-ai";
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
			onUpdate: ({ editor, transaction: _transaction }) => {
				// Call onChange for all user changes, not just non-collaborative ones
				if (onChangeRef.current) {
					const content = editor.getJSON();
					onChangeRef.current(content);
				}
			},
			onCreate: ({ editor }) => {
				// Always set initial content if provided, regardless of onChange
				if (initialContentRef.current) {
					setTimeout(() => {
						// Check if editor is still mounted and view is available
						if (editor.isDestroyed || !editor.view?.dom) {
							return;
						}

						const currentContent = editor.getJSON();

						// Only set content if initialContent is not empty and different from current
						// This prevents overwriting user content with empty content
						const hasInitialContent =
							initialContentRef.current &&
							// Check for valid Tiptap JSON structure
							((typeof initialContentRef.current === "object" &&
								initialContentRef.current.type === "doc" &&
								Array.isArray(
									initialContentRef.current.content,
								) &&
								initialContentRef.current.content.length > 0) ||
								// Fallback for string content
								(typeof initialContentRef.current ===
									"string" &&
									initialContentRef.current.trim().length >
										0) ||
								// Fallback for any other valid object with content
								(typeof initialContentRef.current ===
									"object" &&
									Object.keys(initialContentRef.current)
										.length > 0 &&
									initialContentRef.current.type));

						if (
							hasInitialContent &&
							JSON.stringify(currentContent) !==
								JSON.stringify(initialContentRef.current)
						) {
							try {
								// CRITICAL SAFETY CHECK: Never overwrite content with empty/invalid content
								const currentHasContent =
									currentContent &&
									currentContent.type === "doc" &&
									Array.isArray(currentContent.content) &&
									currentContent.content.length > 0;

								const initialIsEmpty =
									!initialContentRef.current ||
									!initialContentRef.current.content ||
									(Array.isArray(
										initialContentRef.current.content,
									) &&
										initialContentRef.current.content
											.length === 0);

								if (currentHasContent && initialIsEmpty) {
									console.error(
										"CRITICAL: Prevented clearing valid document content!",
										{
											currentContent: JSON.stringify(
												currentContent,
												null,
												2,
											),
											initialContent: JSON.stringify(
												initialContentRef.current,
												null,
												2,
											),
										},
									);

									// EMERGENCY BACKUP: Save current content before any potential data loss
									const emergencyKey = `emergency-backup-${Date.now()}`;
									try {
										localStorage.setItem(
											emergencyKey,
											JSON.stringify({
												content: currentContent,
												timestamp:
													new Date().toISOString(),
												reason: "prevented_content_clearing",
												initialContent:
													initialContentRef.current,
											}),
										);
										console.error(
											"Emergency backup saved to:",
											emergencyKey,
										);
									} catch (error) {
										console.error(
											"Failed to create emergency backup:",
											error,
										);
									}

									return; // ABORT - Don't clear existing content
								}

								editor.commands.setContent(
									initialContentRef.current,
									{ emitUpdate: false },
								);
							} catch (error) {
								console.error(
									"Failed to set initial content:",
									error,
								);
							}
						}
					}, 100);
				}
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
				// Only include AI extension if we have a token
				...(aiToken
					? (() => {
							return [
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
							];
						})()
					: (() => {
							console.log(
								"🤖 AI extension NOT loaded - no token",
							);
							return [];
						})()),
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
