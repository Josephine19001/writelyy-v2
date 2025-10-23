"use client";

import { AiSparklesIcon } from "@shared/tiptap/components/tiptap-icons/ai-sparkles-icon";
import { CheckAiIcon } from "@shared/tiptap/components/tiptap-icons/check-ai-icon";
import { ChevronRightIcon } from "@shared/tiptap/components/tiptap-icons/chevron-right-icon";
import { CompleteSentenceIcon } from "@shared/tiptap/components/tiptap-icons/complete-sentence-icon";
import { LanguagesIcon } from "@shared/tiptap/components/tiptap-icons/languages-icon";

// --- Icons ---
import { MicAiIcon } from "@shared/tiptap/components/tiptap-icons/mic-ai-icon";
import { Simplify2Icon } from "@shared/tiptap/components/tiptap-icons/simplify-2-icon";
import { SmileAiIcon } from "@shared/tiptap/components/tiptap-icons/smile-ai-icon";
import { SummarizeTextIcon } from "@shared/tiptap/components/tiptap-icons/summarize-text-icon";
import { TextExtendIcon } from "@shared/tiptap/components/tiptap-icons/text-extend-icon";
import { TextReduceIcon } from "@shared/tiptap/components/tiptap-icons/text-reduce-icon";
import { AiAskButton } from "@shared/tiptap/components/tiptap-ui/ai-ask-button";
// --- Tiptap UI ---
import {
	SUPPORTED_LANGUAGES,
	SUPPORTED_TONES,
} from "@shared/tiptap/components/tiptap-ui/ai-menu";
// --- UI Primitives ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	Button,
	ButtonGroup,
} from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	Card,
	CardBody,
} from "@shared/tiptap/components/tiptap-ui-primitive/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/dropdown-menu";
import { Separator } from "@shared/tiptap/components/tiptap-ui-primitive/separator";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import { useDropdownCoordination } from "@shared/tiptap/components/tiptap-ui/dropdown-coordination";
import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import type {
	Language,
	TextOptions,
	Tone,
} from "@shared/tiptap/types/ai-types";
import * as React from "react";

export interface ToneOption {
	label: string;
	value: Tone;
	icon?: React.ComponentType<{ className?: string }>;
}

export interface ImproveDropdownProps extends Omit<ButtonProps, "type"> {
	/**
	 * Optional editor instance. If not provided, will use editor from context
	 */
	editor?: Editor;
	/**
	 * List of AI command types to show in the dropdown.
	 */
	types?: Tone[];
	/**
	 * Optional text options for AI commands
	 * @default { stream: true, format: "rich-text" }
	 */
	textOptions?: TextOptions;
	/**
	 * Whether to hide the dropdown when AI features are not available
	 * @default false
	 */
	hideWhenUnavailable?: boolean;
	/**
	 * Whether to render the dropdown menu in a portal
	 * @default false
	 */
	portal?: boolean;
}

type AICommand =
	| "fixSpellingAndGrammar"
	| "extend"
	| "shorten"
	| "simplify"
	| "emojify"
	| "complete"
	| "summarize";

interface MenuAction {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	command: AICommand;
	onClick: () => void;
}

interface SubMenuAction {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	items: Array<{
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
		onClick: () => void;
	}>;
}

const AI_EXCLUDED_BLOCKS = [
	"image",
	"imageUpload",
	"video",
	"audio",
	"table",
	"codeBlock",
	"horizontalRule",
	"hardBreak",
];

export function canUseAi(editor: Editor | null): boolean {
	if (!editor || !editor.isEditable) return false;

	const { selection } = editor.state;

	if (selection.empty) {
		return false;
	}

	if (selection instanceof NodeSelection) {
		if (!selection.node.content.size) {
			return false;
		}

		const node = selection.node;
		if (AI_EXCLUDED_BLOCKS.includes(node.type.name)) {
			return false;
		}
	}

	return true;
}

export function shouldShowImproveDropdown(params: {
	editor: Editor | null;
	hideWhenUnavailable: boolean;
}): boolean {
	const { editor, hideWhenUnavailable } = params;

	if (!editor || !editor.isEditable) {
		return false;
	}

	if (hideWhenUnavailable && !editor.isActive("code")) {
		return canUseAi(editor);
	}

	return true;
}

export function useImproveDropdownState(
	editor: Editor | null,
	hideWhenUnavailable = false,
) {
	const { isOpen, setIsOpen } = useDropdownCoordination("improve-dropdown");
	const [show, setShow] = React.useState(false);
	const isDisabled = !canUseAi(editor);

	const handleOpenChange = React.useCallback(
		(open: boolean, callback?: (isOpen: boolean) => void) => {
			// Allow closing the dropdown even when disabled
			// Only prevent opening when disabled
			if (open && (!editor || isDisabled)) return;
			setIsOpen(open);
			callback?.(open);
		},
		[editor, isDisabled, setIsOpen],
	);

	React.useEffect(() => {
		if (!editor) return;

		const handleSelectionUpdate = () => {
			setShow(
				shouldShowImproveDropdown({
					editor,
					hideWhenUnavailable,
				}),
			);
		};

		handleSelectionUpdate();
		editor.on("selectionUpdate", handleSelectionUpdate);

		return () => {
			editor.off("selectionUpdate", handleSelectionUpdate);
		};
	}, [editor, hideWhenUnavailable]);

	return {
		isDisabled,
		isOpen,
		setIsOpen,
		handleOpenChange,
		show,
	};
}

function useAICommands(editor: Editor | null, textOptions?: TextOptions) {
	const defaultOptions = React.useMemo(
		() => ({
			stream: true,
			format: "rich-text" as const,
			...textOptions,
		}),
		[textOptions],
	);

	const executeAICommand = React.useCallback(
		(command: AICommand) => {
			if (!editor) {
				return;
			}

			// Get selected text
			const { from, to } = editor.state.selection;
			const selectedText = editor.state.doc.textBetween(from, to, " ");

			if (!selectedText) {
				console.error("No text selected");
				return;
			}

			// Use BkAi extension's bkAiTextPrompt command with appropriate prompts
			let commandText = "";
			switch (command) {
				case "fixSpellingAndGrammar":
					commandText = "fix spelling and grammar in";
					break;
				case "extend":
					commandText = "extend";
					break;
				case "shorten":
					commandText = "shorten";
					break;
				case "simplify":
					commandText = "simplify";
					break;
				case "emojify":
					commandText = "add relevant emojis to";
					break;
				case "complete":
					commandText = "complete";
					break;
				case "summarize":
					commandText = "summarize";
					break;
			}

			try {
				editor.chain().focus().aiGenerationShow().run();

				const commandOptions = {
					prompt: selectedText,
					command: commandText,
					insert: true,
					stream: defaultOptions.stream,
					format: defaultOptions.format,
					includeDocumentContext: false, // Don't include document context for targeted edits
				};

				console.log(
					"🎯 [Improve Dropdown] Calling bkAiTextPrompt with:",
					{
						command: commandText,
						selectedTextLength: selectedText.length,
						selectedTextPreview: selectedText.slice(0, 100),
						includeDocumentContext: false,
					},
				);

				if ((editor.commands as any).bkAiTextPrompt) {
					(editor.commands as any).bkAiTextPrompt(commandOptions);
				} else {
					console.error("bkAiTextPrompt command not available");
				}
			} catch (error) {
				console.error("Error executing AI command:", error);
			}
		},
		[editor, defaultOptions],
	);

	const adjustTone = React.useCallback(
		(tone: Tone) => {
			if (!editor) {
				return;
			}

			// Get selected text
			const { from, to } = editor.state.selection;
			const selectedText = editor.state.doc.textBetween(from, to, " ");

			if (!selectedText) {
				console.error("No text selected");
				return;
			}

			try {
				editor.chain().focus().aiGenerationShow().run();

				if ((editor.commands as any).bkAiTextPrompt) {
					(editor.commands as any).bkAiTextPrompt({
						prompt: selectedText,
						command: `rewrite in a ${tone} tone`,
						insert: true,
						stream: defaultOptions.stream,
						tone: tone,
						format: defaultOptions.format,
						includeDocumentContext: false, // Don't include document context for targeted edits
					});
				} else {
					console.error("bkAiTextPrompt command not available");
				}
			} catch (error) {
				console.error("Error adjusting tone:", error);
			}
		},
		[editor, defaultOptions],
	);

	const translate = React.useCallback(
		(language: Language) => {
			if (!editor) {
				return;
			}

			// Get selected text
			const { from, to } = editor.state.selection;
			const selectedText = editor.state.doc.textBetween(from, to, " ");

			if (!selectedText) {
				console.error("No text selected");
				return;
			}

			try {
				editor.chain().focus().aiGenerationShow().run();

				if ((editor.commands as any).bkAiTextPrompt) {
					(editor.commands as any).bkAiTextPrompt({
						prompt: selectedText,
						command: `translate to ${language}`,
						insert: true,
						stream: defaultOptions.stream,
						format: defaultOptions.format,
						includeDocumentContext: false, // Don't include document context for targeted edits
					});
				} else {
					console.error("bkAiTextPrompt command not available");
				}
			} catch (error) {
				console.error("Error translating:", error);
			}
		},
		[editor, defaultOptions],
	);

	return {
		executeAICommand,
		adjustTone,
		translate,
	};
}

function SubMenuButton({ action }: { action: SubMenuAction }) {
	return (
		<DropdownMenuSub>
			<DropdownMenuSubTrigger asChild>
				<Button data-style="ghost" type="button">
					<action.icon className="tiptap-button-icon" />
					<span className="tiptap-button-text">{action.label}</span>
					<ChevronRightIcon className="tiptap-button-icon-sub" />
				</Button>
			</DropdownMenuSubTrigger>
			<DropdownMenuSubContent>
				<Card>
					<CardBody>
						<ButtonGroup>
							{action.items.map((item) => (
								<DropdownMenuItem key={item.value} asChild>
									<Button
										type="button"
										data-style="ghost"
										onClick={item.onClick}
									>
										{item.icon && (
											<item.icon className="tiptap-button-icon" />
										)}
										<span className="tiptap-button-text">
											{item.label}
										</span>
									</Button>
								</DropdownMenuItem>
							))}
						</ButtonGroup>
					</CardBody>
				</Card>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

export function ImproveDropdown({
	editor: providedEditor,
	hideWhenUnavailable = false,
	textOptions,
	portal = false,
	...props
}: ImproveDropdownProps) {
	const { editor } = useTiptapEditor(providedEditor);
	const { executeAICommand, adjustTone, translate } = useAICommands(
		editor,
		textOptions,
	);
	const { isDisabled, isOpen, handleOpenChange, show } =
		useImproveDropdownState(editor, hideWhenUnavailable);

	const menuActions: MenuAction[] = React.useMemo(
		() => [
			{
				icon: CheckAiIcon,
				label: "Fix spelling & grammar",
				command: "fixSpellingAndGrammar",
				onClick: () => executeAICommand("fixSpellingAndGrammar"),
			},
			{
				icon: TextExtendIcon,
				label: "Extend text",
				command: "extend",
				onClick: () => executeAICommand("extend"),
			},
			{
				icon: TextReduceIcon,
				label: "Reduce text",
				command: "shorten",
				onClick: () => executeAICommand("shorten"),
			},
			{
				icon: Simplify2Icon,
				label: "Simplify text",
				command: "simplify",
				onClick: () => executeAICommand("simplify"),
			},
			{
				icon: SmileAiIcon,
				label: "Emojify",
				command: "emojify",
				onClick: () => executeAICommand("emojify"),
			},
		],
		[executeAICommand],
	);

	const secondaryActions: MenuAction[] = React.useMemo(
		() => [
			{
				icon: CompleteSentenceIcon,
				label: "Complete sentence",
				command: "complete",
				onClick: () => executeAICommand("complete"),
			},
			{
				icon: SummarizeTextIcon,
				label: "Summarize",
				command: "summarize",
				onClick: () => executeAICommand("summarize"),
			},
		],
		[executeAICommand],
	);

	const subMenuActions: SubMenuAction[] = React.useMemo(
		() => [
			{
				icon: MicAiIcon,
				label: "Adjust tone",
				items: SUPPORTED_TONES.map((option) => ({
					label: option.label,
					value: option.value,
					onClick: () => adjustTone(option.value),
				})),
			},
		],
		[adjustTone],
	);

	const translateSubMenu: SubMenuAction = React.useMemo(
		() => ({
			icon: LanguagesIcon,
			label: "Translate",
			items: SUPPORTED_LANGUAGES.map((option) => ({
				label: option.label,
				value: option.value,
				icon: LanguagesIcon,
				onClick: () => translate(option.value),
			})),
		}),
		[translate],
	);

	if (!show || !editor || !editor.isEditable) {
		return null;
	}

	return (
		<DropdownMenu modal open={isOpen} onOpenChange={handleOpenChange}>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					disabled={isDisabled}
					data-disabled={isDisabled}
					role="button"
					tabIndex={-1}
					aria-label="AI Assist"
					tooltip="AI Assist"
					{...props}
				>
					<AiSparklesIcon className="tiptap-button-icon" />
					<span className="tiptap-button-text">AI Assist</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" portal={portal}>
				<Card>
					<CardBody>
						<ButtonGroup>
							{subMenuActions.map((action, index) => (
								<SubMenuButton key={index} action={action} />
							))}

							{menuActions.map((action, index) => (
								<DropdownMenuItem key={index} asChild>
									<Button
										type="button"
										data-style="ghost"
										onClick={action.onClick}
									>
										<action.icon className="tiptap-button-icon" />
										<span className="tiptap-button-text">
											{action.label}
										</span>
									</Button>
								</DropdownMenuItem>
							))}
						</ButtonGroup>

						<Separator orientation="horizontal" />

						<ButtonGroup>
							<DropdownMenuItem asChild>
								<AiAskButton
									text="Ask AI"
									showTooltip={false}
								/>
							</DropdownMenuItem>

							{secondaryActions.map((action, index) => (
								<DropdownMenuItem key={index} asChild>
									<Button
										type="button"
										data-style="ghost"
										onClick={action.onClick}
									>
										<action.icon className="tiptap-button-icon" />
										<span className="tiptap-button-text">
											{action.label}
										</span>
									</Button>
								</DropdownMenuItem>
							))}

							<SubMenuButton action={translateSubMenu} />
						</ButtonGroup>
					</CardBody>
				</Card>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default ImproveDropdown;
