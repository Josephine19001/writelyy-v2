"use client";

import { UiState } from "@shared/tiptap/components/tiptap-extension/ui-state-extension";
import { ChartBlockNode } from "@shared/tiptap/components/tiptap-node/chart-block-node/chart-block-node-extension";
import { DrawingBlockNode } from "@shared/tiptap/components/tiptap-node/drawing-block-node/drawing-block-node-extension";
import { HorizontalRule } from "@shared/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { Image } from "@shared/tiptap/components/tiptap-node/image-node/image-node-extension";
import { ImageUploadNode } from "@shared/tiptap/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { SnippetBlockNode } from "@shared/tiptap/components/tiptap-node/snippet-block-node/snippet-block-node-extension";
// import { PageNavigator } from "./page-navigator";
import { EditorProvider as CustomEditorProvider } from "@shared/tiptap/contexts/editor-context";
import { useUser } from "@shared/tiptap/contexts/user-context";
// import { TIPTAP_AI_APP_ID } from "@shared/tiptap/lib/tiptap-collab-utils";
import {
	handleImageUpload,
	MAX_FILE_SIZE,
} from "@shared/tiptap/lib/tiptap-utils";
import {
	getAiExtensionConfig,
	getAiAgentConfig,
	getAiSuggestionConfig,
	getAiChangesConfig,
	AI_FEATURES,
} from "@shared/tiptap/config/ai-config";
import { Collaboration, isChangeOrigin } from "@tiptap/extension-collaboration";
import { CollaborationCaret } from "@tiptap/extension-collaboration-caret";
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji";
import { Highlight } from "@tiptap/extension-highlight";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Mathematics } from "@tiptap/extension-mathematics";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TableCell, TableKit } from "@tiptap/extension-table";
import { PageKit } from "@tiptap-pro/extension-pages";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { UniqueID } from "@tiptap/extension-unique-id";
import { Placeholder, Selection } from "@tiptap/extensions";
import { EditorContext, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
// Tiptap Pro AI Extensions
import Ai from "@tiptap-pro/extension-ai";
import AiAgent from "@tiptap-pro/extension-ai-agent";
import AiSuggestion from "@tiptap-pro/extension-ai-suggestion";
import AiChanges from "@tiptap-pro/extension-ai-changes";
// BK AI Extensions (from BK tiptap-block-editor - simple, no subscription required)
import { BkAi } from "@shared/tiptap/extensions/bk-ai/bk-ai-extension";
import { BkAiPlaceholder } from "@shared/tiptap/extensions/bk-ai/bk-ai-placeholder";
import { BkAiWriter } from "@shared/tiptap/extensions/bk-ai/bk-ai-writer";
import * as React from "react";
import { toast } from "sonner";
import type { Doc as YDoc } from "yjs";
import { EditorActionBar } from "./editor-action-bar";
import { EditorContentArea } from "./editor-content-area";
import { EditorFooter } from "./editor-footer";
import { LoadingSpinner } from "./loading-spinner";

export interface EditorProviderProps {
	provider: any | null;
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
					const isEmpty =
						!content ||
						!content.content ||
						content.content.length === 0 ||
						(content.content.length === 1 &&
							content.content[0].type === "paragraph" &&
							(!content.content[0].content ||
								content.content[0].content.length === 0));

					if (!isEmpty || transaction.getMeta("allowEmpty")) {
						onChange(content);
					} else {
						console.warn("🛡️ Prevented empty content save");
					}
				}
			},
			onCreate: ({ editor }) => {
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
				PageKit.configure({
					pages: {
						pageFormat: "A4",
						header: "",
						footer: "Page {page} of {total}",
						pageBreakBackground: "var(--tt-border-color)",
					},
				}),
				UiState,
				// BK AI Extensions (from BK tiptap-block-editor)
				BkAiPlaceholder,
				BkAiWriter,
				BkAi.configure({
					onLoading: () => {
						console.log("🤖 AI is generating...");
					},
					onError: (error) => {
						console.error("AI generation failed:", error);
						toast.error("AI generation failed. Please try again.");
					},
				}),
				// Tiptap Pro AI Extensions (optional, requires subscription)
				...(AI_FEATURES.textGeneration && aiToken
					? [Ai.configure(getAiExtensionConfig(aiToken))]
					: []),
				...(AI_FEATURES.aiAgent && aiToken
					? [AiAgent.configure(getAiAgentConfig(aiToken))]
					: []),
				...(AI_FEATURES.aiSuggestions && aiToken
					? [AiSuggestion.configure(getAiSuggestionConfig(aiToken))]
					: []),
				...(AI_FEATURES.trackChanges
					? [AiChanges.configure(getAiChangesConfig())]
					: []),
			],
		},
		[], // Empty dependency array to prevent unnecessary recreations
	);

	if (!editor) {
		return <LoadingSpinner />;
	}

	const handleSnippetSelect = (snippet: any) => {
		console.log("Snippet selected:", snippet);
	};

	const handleInsertSnippet = (snippet: any) => {
		if (!editor) {
			toast.error("Editor is not ready");
			return;
		}

		try {
			// Insert snippet content as text
			const success = editor
				.chain()
				.focus()
				.insertContent(snippet.content)
				.run();

			if (success) {
				toast.success(`Inserted snippet: ${snippet.title}`);
			} else {
				toast.error("Failed to insert snippet");
			}
		} catch (error) {
			console.error("Failed to insert snippet:", error);
			toast.error("Failed to insert snippet");
		}
	};

	const handleSourceSelect = (source: any) => {
		console.log("Source selected:", source);
	};

	// Helper function to get proper image URL (same as toolbar dropdown)
	const getImageUrl = (source: any) => {
		if (source.type === "image" && source.filePath) {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			const bucketName =
				process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME || "image-sources";
			return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${source.filePath}`;
		}
		return source.url || null;
	};

	const handleInsertSource = (source: any) => {
		if (!editor) {
			console.error("Editor is not ready");
			toast.error("Editor is not ready");
			return;
		}

		try {
			// For images, insert image node (same method as toolbar dropdown)
			if (source.type === "image") {
				const imageUrl = getImageUrl(source);

				if (!imageUrl) {
					console.error("Image URL not found in source:", source);
					toast.error("Image URL not found");
					return;
				}

				try {
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
						// Fallback to setImage method
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

					toast.success(`Inserted image: ${source.name}`);
				} catch (error) {
					console.error("Failed to insert image:", error);
					// Final fallback: insert as link
					editor
						.chain()
						.focus()
						.insertContent({
							type: "text",
							text: `[Image: ${source.name}]`,
							marks: [
								{ type: "link", attrs: { href: imageUrl } },
							],
						})
						.run();
					toast.success(`Inserted image link: ${source.name}`);
				}
			}
			// For links, insert link
			else if (source.type === "url") {
				const linkUrl = source.url;

				if (!linkUrl) {
					console.error("Link URL not found in source:", source);
					toast.error("Link URL not found");
					return;
				}

				editor
					.chain()
					.focus()
					.insertContent({
						type: "text",
						text: source.name || linkUrl,
						marks: [{ type: "link", attrs: { href: linkUrl } }],
					})
					.run();

				toast.success(`Inserted link: ${source.name}`);
			}
			// For PDFs and documents, insert as link
			else if (["pdf", "doc", "docx"].includes(source.type)) {
				const fileUrl = source.url || source.filePath;

				if (!fileUrl) {
					console.error("File URL not found in source:", source);
					toast.error("File URL not found");
					return;
				}

				editor
					.chain()
					.focus()
					.insertContent({
						type: "text",
						text: source.name || "Document",
						marks: [{ type: "link", attrs: { href: fileUrl } }],
					})
					.run();

				toast.success(
					`Inserted ${source.type.toUpperCase()} link: ${source.name}`,
				);
			} else {
				console.error("Unsupported source type:", source.type);
				toast.error(`Unsupported source type: ${source.type}`);
			}
		} catch (error) {
			console.error("Failed to insert source:", error);
			toast.error("Failed to insert source");
		}
	};

	const handleUseAsAIContext = (source: any) => {
		toast.info(`Added ${source.name} to AI context`);
	};

	const handleExport = (format: string) => {
		if (!editor) return;

		// Export logic here
		switch (format) {
			case "json": {
				const content = editor.getJSON();
				const dataStr = JSON.stringify(content, null, 2);
				const dataUri =
					"data:application/json;charset=utf-8," +
					encodeURIComponent(dataStr);
				const exportFileDefaultName = "document.json";
				const linkElement = document.createElement("a");
				linkElement.setAttribute("href", dataUri);
				linkElement.setAttribute("download", exportFileDefaultName);
				linkElement.click();
				break;
			}
			case "html": {
				const html = editor.getHTML();
				const htmlUri = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
				const htmlLink = document.createElement("a");
				htmlLink.setAttribute("href", htmlUri);
				htmlLink.setAttribute("download", "document.html");
				htmlLink.click();
				break;
			}
			case "txt": {
				const text = editor.getText();
				const textUri = `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
				const textLink = document.createElement("a");
				textLink.setAttribute("href", textUri);
				textLink.setAttribute("download", "document.txt");
				textLink.click();
				break;
			}
			default:
				console.log(`Export format ${format} not yet implemented`);
		}
	};

	return (
		<div className="notion-like-editor-wrapper">
			<EditorContext.Provider value={{ editor }}>
				<CustomEditorProvider editor={editor}>
					{/* <NotionEditorHeader /> */}
					<EditorContentArea />
					<EditorFooter
						isSaving={savingState?.isSaving}
						lastSaved={savingState?.lastSaved}
						hasUnsavedChanges={savingState?.hasUnsavedChanges}
					/>
					{/* <PageNavigator /> */}
					<EditorActionBar
						onUndo={() => editor.chain().focus().undo().run()}
						onRedo={() => editor.chain().focus().redo().run()}
						onSourceSelect={handleSourceSelect}
						onSnippetSelect={handleSnippetSelect}
						onInsertSource={handleInsertSource}
						onUseAsAIContext={handleUseAsAIContext}
						onInsertSnippet={handleInsertSnippet}
						onExport={handleExport}
					/>
				</CustomEditorProvider>
			</EditorContext.Provider>
		</div>
	);
}
