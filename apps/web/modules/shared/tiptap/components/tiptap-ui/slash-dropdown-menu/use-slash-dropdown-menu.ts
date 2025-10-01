"use client";

import { AiSparklesIcon } from "@shared/tiptap/components/tiptap-icons/ai-sparkles-icon";
// import { AtSignIcon } from "@shared/tiptap/components/tiptap-icons/at-sign-icon";
import { BlockquoteIcon } from "@shared/tiptap/components/tiptap-icons/blockquote-icon";
import { ChartIcon } from "@shared/tiptap/components/tiptap-icons/chart-icon";
// --- Icons ---
import { CodeBlockIcon } from "@shared/tiptap/components/tiptap-icons/code-block-icon";
import { DrawIcon } from "@shared/tiptap/components/tiptap-icons/draw-icon";
import { HeadingOneIcon } from "@shared/tiptap/components/tiptap-icons/heading-one-icon";
import { HeadingThreeIcon } from "@shared/tiptap/components/tiptap-icons/heading-three-icon";
import { HeadingTwoIcon } from "@shared/tiptap/components/tiptap-icons/heading-two-icon";
import { ImageIcon } from "@shared/tiptap/components/tiptap-icons/image-icon";
import { ListIcon } from "@shared/tiptap/components/tiptap-icons/list-icon";
import { ListOrderedIcon } from "@shared/tiptap/components/tiptap-icons/list-ordered-icon";
import { ListTodoIcon } from "@shared/tiptap/components/tiptap-icons/list-todo-icon";
import { MinusIcon } from "@shared/tiptap/components/tiptap-icons/minus-icon";
import { SmilePlusIcon } from "@shared/tiptap/components/tiptap-icons/smile-plus-icon";
import { SnippetIcon } from "@shared/tiptap/components/tiptap-icons/snippet-icon";
import { TableIcon } from "@shared/tiptap/components/tiptap-icons/table-icon";
import { TypeIcon } from "@shared/tiptap/components/tiptap-icons/type-icon";
import { addEmojiTrigger } from "@shared/tiptap/components/tiptap-ui/emoji-trigger-button";
// import { addMentionTrigger } from "@shared/tiptap/components/tiptap-ui/mention-trigger-button";
// --- Tiptap UI ---
import type { SuggestionItem } from "@shared/tiptap/components/tiptap-ui-utils/suggestion-menu";
import {
	findSelectionPosition,
	hasContentAbove,
} from "@shared/tiptap/lib/tiptap-advanced-utils";
// --- Lib ---
import {
	isExtensionAvailable,
	isNodeInSchema,
} from "@shared/tiptap/lib/tiptap-utils";
import type { Editor } from "@tiptap/react";
import * as React from "react";

export interface SlashMenuConfig {
	enabledItems?: SlashMenuItemType[];
	customItems?: SuggestionItem[];
	itemGroups?: {
		[key in SlashMenuItemType]?: string;
	};
	showGroups?: boolean;
}

const texts = {
	// AI
	continue_writing: {
		title: "Continue Writing",
		subtext: "Continue writing from the current position",
		keywords: ["continue", "write", "continue writing", "ai"],
		badge: AiSparklesIcon,
		group: "AI",
	},
	ai_ask_button: {
		title: "Ask AI",
		subtext: "Ask AI to generate content",
		keywords: ["ai", "ask", "generate"],
		badge: AiSparklesIcon,
		group: "AI",
	},

	// Style
	text: {
		title: "Text",
		subtext: "Regular text paragraph",
		keywords: ["p", "paragraph", "text"],
		badge: TypeIcon,
		group: "Style",
	},
	heading_1: {
		title: "Heading 1",
		subtext: "Top-level heading",
		keywords: ["h", "heading1", "h1"],
		badge: HeadingOneIcon,
		group: "Style",
	},
	heading_2: {
		title: "Heading 2",
		subtext: "Key section heading",
		keywords: ["h2", "heading2", "subheading"],
		badge: HeadingTwoIcon,
		group: "Style",
	},
	heading_3: {
		title: "Heading 3",
		subtext: "Subsection and group heading",
		keywords: ["h3", "heading3", "subheading"],
		badge: HeadingThreeIcon,
		group: "Style",
	},
	bullet_list: {
		title: "Bullet List",
		subtext: "List with unordered items",
		keywords: ["ul", "li", "list", "bulletlist", "bullet list"],
		badge: ListIcon,
		group: "Style",
	},
	ordered_list: {
		title: "Numbered List",
		subtext: "List with ordered items",
		keywords: ["ol", "li", "list", "numberedlist", "numbered list"],
		badge: ListOrderedIcon,
		group: "Style",
	},
	task_list: {
		title: "To-do list",
		subtext: "List with tasks",
		keywords: ["tasklist", "task list", "todo", "checklist"],
		badge: ListTodoIcon,
		group: "Style",
	},
	quote: {
		title: "Blockquote",
		subtext: "Blockquote block",
		keywords: ["quote", "blockquote"],
		badge: BlockquoteIcon,
		group: "Style",
	},
	code_block: {
		title: "Code Block",
		subtext: "Code block with syntax highlighting",
		keywords: ["code", "pre"],
		badge: CodeBlockIcon,
		group: "Style",
	},

	// Insert
	// mention: {
	// 	title: "Mention",
	// 	subtext: "Mention a user or item",
	// 	keywords: ["mention", "user", "item", "tag"],
	// 	badge: AtSignIcon,
	// 	group: "Insert",
	// },
	emoji: {
		title: "Emoji",
		subtext: "Insert an emoji",
		keywords: ["emoji", "emoticon", "smiley"],
		badge: SmilePlusIcon,
		group: "Insert",
	},
	divider: {
		title: "Separator",
		subtext: "Horizontal line to separate content",
		keywords: ["hr", "horizontalRule", "line", "separator"],
		badge: MinusIcon,
		group: "Insert",
	},

	// Upload
	image: {
		title: "Image",
		subtext: "Resizable image with caption",
		keywords: [
			"image",
			"imageUpload",
			"upload",
			"img",
			"picture",
			"media",
			"url",
		],
		badge: ImageIcon,
		group: "Upload",
	},
	table: {
		title: "Table",
		subtext: "Insert a table with rows and columns",
		keywords: ["table", "grid", "rows", "columns", "data"],
		badge: TableIcon,
		group: "Insert",
	},
	chart: {
		title: "Chart",
		subtext: "Insert a chart (bar, line, or pie)",
		keywords: [
			"chart",
			"graph",
			"bar",
			"line",
			"pie",
			"data",
			"visualization",
		],
		badge: ChartIcon,
		group: "Insert",
	},
	snippet: {
		title: "Snippet",
		subtext: "Insert reusable text snippet",
		keywords: ["snippet", "template", "reusable", "text", "content"],
		badge: SnippetIcon,
		group: "Insert",
	},
	drawing: {
		title: "Drawing",
		subtext: "Insert a drawing canvas",
		keywords: ["drawing", "canvas", "sketch", "draw", "art"],
		badge: DrawIcon,
		group: "Insert",
	},
};

export type SlashMenuItemType = keyof typeof texts;

const getItemImplementations = () => {
	return {
		// AI
		continue_writing: {
			check: (editor: Editor) => {
				const { hasContent } = hasContentAbove(editor);
				const extensionsReady = isExtensionAvailable(editor, [
					"ai",
					"aiAdvanced",
				]);
				return extensionsReady && hasContent;
			},
			action: ({ editor }: { editor: Editor }) => {
				const editorChain = editor.chain().focus();

				const nodeSelectionPosition = findSelectionPosition({ editor });

				if (nodeSelectionPosition !== null) {
					editorChain.setNodeSelection(nodeSelectionPosition);
				}

				editorChain.run();

				editor.chain().focus().aiGenerationShow().run();

				requestAnimationFrame(() => {
					const { hasContent, content } = hasContentAbove(editor);

					const snippet =
						content.length > 500
							? `...${content.slice(-500)}`
							: content;

					const prompt = hasContent
						? `Context: ${snippet}\n\nContinue writing from where the text above ends. Write ONLY ONE SENTENCE. DONT REPEAT THE TEXT.`
						: "Start writing a new paragraph. Write ONLY ONE SENTENCE.";

					editor
						.chain()
						.focus()
						.aiTextPrompt({
							stream: true,
							format: "rich-text",
							text: prompt,
						})
						.run();
				});
			},
		},
		ai_ask_button: {
			check: (editor: Editor) =>
				isExtensionAvailable(editor, ["ai", "aiAdvanced"]),
			action: ({ editor }: { editor: Editor }) => {
				const editorChain = editor.chain().focus();

				const nodeSelectionPosition = findSelectionPosition({ editor });

				if (nodeSelectionPosition !== null) {
					editorChain.setNodeSelection(nodeSelectionPosition);
				}

				editorChain.run();

				editor.chain().focus().aiGenerationShow().run();
			},
		},

		// Style
		text: {
			check: (editor: Editor) => isNodeInSchema("paragraph", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor.chain().focus().setParagraph().run();
			},
		},
		heading_1: {
			check: (editor: Editor) => isNodeInSchema("heading", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor.chain().focus().toggleHeading({ level: 1 }).run();
			},
		},
		heading_2: {
			check: (editor: Editor) => isNodeInSchema("heading", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor.chain().focus().toggleHeading({ level: 2 }).run();
			},
		},
		heading_3: {
			check: (editor: Editor) => isNodeInSchema("heading", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor.chain().focus().toggleHeading({ level: 3 }).run();
			},
		},
		bullet_list: {
			check: (editor: Editor) => isNodeInSchema("bulletList", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor.chain().focus().toggleBulletList().run();
			},
		},
		ordered_list: {
			check: (editor: Editor) => isNodeInSchema("orderedList", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor.chain().focus().toggleOrderedList().run();
			},
		},
		task_list: {
			check: (editor: Editor) => isNodeInSchema("taskList", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor.chain().focus().toggleTaskList().run();
			},
		},
		quote: {
			check: (editor: Editor) => isNodeInSchema("blockquote", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor.chain().focus().toggleBlockquote().run();
			},
		},
		code_block: {
			check: (editor: Editor) => isNodeInSchema("codeBlock", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor
					.chain()
					.focus()
					.toggleNode("codeBlock", "paragraph")
					.run();
			},
		},

		// Insert
		// mention: {
		// 	check: (editor: Editor) =>
		// 		isExtensionAvailable(editor, ["mention", "mentionAdvanced"]),
		// 	action: ({ editor }: { editor: Editor }) =>
		// 		addMentionTrigger(editor),
		// },
		emoji: {
			check: (editor: Editor) =>
				isExtensionAvailable(editor, ["emoji", "emojiPicker"]),
			action: ({ editor }: { editor: Editor }) => addEmojiTrigger(editor),
		},
		divider: {
			check: (editor: Editor) => isNodeInSchema("horizontalRule", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor.chain().focus().setHorizontalRule().run();
			},
		},

		// Upload
		image: {
			check: (editor: Editor) => isNodeInSchema("image", editor),
			action: ({ editor }: { editor: Editor }) => {
				editor
					.chain()
					.focus()
					.insertContent({
						type: "imageUpload",
					})
					.run();
			},
		},
		table: {
			check: (editor: Editor) => {
				const hasTable = !!editor.schema.nodes.table;
				return hasTable;
			},
			action: ({ editor }: { editor: Editor }) => {
				editor
					.chain()
					.focus()
					.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
					.run();
			},
		},
		chart: {
			check: (editor: Editor) => {
				return editor.schema.nodes.chartBlock !== undefined;
			},
			action: ({ editor }: { editor: Editor }) => {
				try {
					editor
						.chain()
						.focus()
						.insertContent({
							type: "chartBlock",
							attrs: {
								chartType: "bar",
								data: {
									labels: ["Jan", "Feb", "Mar"],
									datasets: [
										{
											label: "Sample Data",
											data: [10, 20, 30],
											backgroundColor: [
												"#FF6384",
												"#36A2EB",
												"#FFCE56",
											],
										},
									],
								},
							},
						})
						.run();
				} catch (error) {
					console.error("Chart insertion failed:", error);
				}
			},
		},
		snippet: {
			check: (editor: Editor) => {
				return editor.schema.nodes.snippetBlock !== undefined;
			},
			action: ({ editor }: { editor: Editor }) => {
				try {
					editor
						.chain()
						.focus()
						.insertContent({
							type: "snippetBlock",
							attrs: {
								snippetId: null,
								placeholder: "Select a snippet...",
							},
						})
						.run();
				} catch (error) {
					console.error("Snippet insertion failed:", error);
				}
			},
		},
		drawing: {
			check: (editor: Editor) => {
				return editor.schema.nodes.drawingBlock !== undefined;
			},
			action: ({ editor }: { editor: Editor }) => {
				try {
					editor
						.chain()
						.focus()
						.insertContent({
							type: "drawingBlock",
							attrs: {
								width: 600,
								height: 400,
								drawingData: null,
							},
						})
						.run();
				} catch (error) {
					console.error("Drawing insertion failed:", error);
				}
			},
		},
	};
};

function organizeItemsByGroups(
	items: SuggestionItem[],
	showGroups: boolean,
): SuggestionItem[] {
	if (!showGroups) {
		return items.map((item) => ({ ...item, group: "" }));
	}

	const groups: { [groupLabel: string]: SuggestionItem[] } = {};

	// Group items
	items.forEach((item) => {
		const groupLabel = item.group || "";
		if (!groups[groupLabel]) {
			groups[groupLabel] = [];
		}
		groups[groupLabel].push(item);
	});

	// Flatten groups in order (this maintains the visual order for keyboard navigation)
	const organizedItems: SuggestionItem[] = [];
	Object.entries(groups).forEach(([, groupItems]) => {
		organizedItems.push(...groupItems);
	});

	return organizedItems;
}

/**
 * Custom hook for slash dropdown menu functionality
 */
export function useSlashDropdownMenu(config?: SlashMenuConfig) {
	const getSlashMenuItems = React.useCallback(
		(editor: Editor) => {
			const items: SuggestionItem[] = [];

			const enabledItems =
				config?.enabledItems ||
				(Object.keys(texts) as SlashMenuItemType[]);
			const showGroups = config?.showGroups !== false;

			const itemImplementations = getItemImplementations();

			enabledItems.forEach((itemType) => {
				const itemImpl = itemImplementations[itemType];
				const itemText = texts[itemType];

				if (itemImpl && itemText) {
					const checkResult = itemImpl.check(editor);

					if (checkResult) {
						const item: SuggestionItem = {
							onSelect: ({ editor }) =>
								itemImpl.action({ editor }),
							...itemText,
						};

						if (config?.itemGroups?.[itemType]) {
							item.group = config.itemGroups[itemType];
						} else if (!showGroups) {
							item.group = "";
						}

						items.push(item);
					}
				}
			});

			if (config?.customItems) {
				items.push(...config.customItems);
			}

			// Reorganize items by groups to ensure keyboard navigation works correctly
			return organizeItemsByGroups(items, showGroups);
		},
		[config],
	);

	return {
		getSlashMenuItems,
		config,
	};
}
