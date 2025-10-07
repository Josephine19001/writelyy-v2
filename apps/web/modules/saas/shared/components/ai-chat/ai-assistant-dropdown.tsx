"use client";

import { AiSparklesIcon } from "@shared/tiptap/components/tiptap-icons/ai-sparkles-icon";
import { CheckAiIcon } from "@shared/tiptap/components/tiptap-icons/check-ai-icon";
import { ChevronRightIcon } from "@shared/tiptap/components/tiptap-icons/chevron-right-icon";
import { MessageSquareIcon } from "@shared/tiptap/components/tiptap-icons/message-square-icon";
import { Simplify2Icon } from "@shared/tiptap/components/tiptap-icons/simplify-2-icon";
import { SmileAiIcon } from "@shared/tiptap/components/tiptap-icons/smile-ai-icon";
import { SummarizeTextIcon } from "@shared/tiptap/components/tiptap-icons/summarize-text-icon";
import { TextExtendIcon } from "@shared/tiptap/components/tiptap-icons/text-extend-icon";
import { TextReduceIcon } from "@shared/tiptap/components/tiptap-icons/text-reduce-icon";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/dropdown-menu";
import type { Editor } from "@tiptap/react";
import * as React from "react";
import { useAIChat } from "./ai-chat-context";

export interface AIAssistantDropdownProps {
	editor: Editor;
}

// MVP: Only the most essential AI features
const AI_WRITING_OPTIONS = [
	{
		id: "fix-spelling-grammar",
		label: "Fix grammar & spelling",
		icon: CheckAiIcon,
		prompt: "Fix any spelling and grammar errors in the following text, keeping the original meaning and style:",
	},
	{
		id: "make-shorter",
		label: "Make shorter",
		icon: TextReduceIcon,
		prompt: "Make this text shorter and more concise while keeping the key points:",
	},
	{
		id: "make-longer",
		label: "Make longer",
		icon: TextExtendIcon,
		prompt: "Expand this text with more details, examples, and explanation:",
	},
	{
		id: "simplify",
		label: "Simplify",
		icon: Simplify2Icon,
		prompt: "Simplify this text to make it easier to understand:",
	},
	{
		id: "add-sources",
		label: "Add references",
		icon: SummarizeTextIcon,
		prompt: "Add proper sources, citations, and references to support the claims in this text:",
	},
];

const TONE_OPTIONS = [
	{
		id: "professional",
		label: "Professional",
		prompt: "Rewrite this text in a professional tone:",
	},
	{
		id: "casual",
		label: "Casual",
		prompt: "Rewrite this text in a casual, friendly tone:",
	},
	{
		id: "confident",
		label: "Confident",
		prompt: "Rewrite this text with a confident tone:",
	},
];

export function AIAssistantDropdown({ editor }: AIAssistantDropdownProps) {
	const { sendMessage, insertTextToEditor, setEditor } = useAIChat();
	const [isOpen, setIsOpen] = React.useState(false);
	const [showCustomAsk, setShowCustomAsk] = React.useState(false);

	React.useEffect(() => {
		setEditor(editor);
	}, [editor, setEditor]);

	// Auto-select best available model (prefer paid for quality, fallback to free)
	const getBestProvider = () => {
		const hasOpenAIKey = process.env.NEXT_PUBLIC_HAS_OPENAI_KEY === "true";
		return hasOpenAIKey ? "openai-gpt4" : "gemini-free";
	};

	const getSelectedText = () => {
		const { state } = editor;
		const { selection } = state;
		const { from, to } = selection;

		if (from === to) return "";

		return state.doc.textBetween(from, to);
	};

	const handleAIAction = async (prompt: string) => {
		const selectedText = getSelectedText();

		if (!selectedText) {
			// If no text is selected, just open the chat
			sendMessage(prompt);
			return;
		}

		try {
			const response = await fetch("/api/ai/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: prompt,
					selectedText,
					provider: getBestProvider(),
					history: [],
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get AI response");
			}

			const data = await response.json();

			// Replace the selected text with the AI response
			insertTextToEditor(data.content);
		} catch (error) {
			console.error("AI action error:", error);
			// Fallback to chat interface
			sendMessage(`${prompt}\n\nSelected text: "${selectedText}"`);
		}

		setIsOpen(false);
	};

	const openCustomAsk = () => {
		setIsOpen(false);
		setShowCustomAsk(true);
	};

	const handleCustomAskMessage = (message: string) => {
		handleAIAction(message);
		setShowCustomAsk(false);
	};

	const handleAddContext = () => {
		// TODO: Implement add context functionality
		console.log("Add context clicked");
	};

	const hasSelection = !editor.state.selection.empty;

	return (
		<div className="flex flex-col">
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						className="h-8 gap-1 text-sm"
						disabled={!hasSelection}
					>
						<AiSparklesIcon className="h-4 w-4" />
						AI Assistant
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					className="tiptap-dropdown-menu w-56"
					align="start"
				>
					{/* Core Writing Improvements */}
					{AI_WRITING_OPTIONS.map((option) => (
						<DropdownMenuItem
							key={option.id}
							onClick={() => handleAIAction(option.prompt)}
							className="tiptap-dropdown-menu-item cursor-pointer flex items-center gap-2 px-3 py-2 text-sm"
						>
							<option.icon className="h-4 w-4 flex-shrink-0" />
							<span>{option.label}</span>
						</DropdownMenuItem>
					))}

					{/* <Separator className="tiptap-dropdown-menu-separator" /> */}

					{/* Change Tone */}
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="tiptap-dropdown-menu-item flex items-center gap-2 px-3 py-2 text-sm cursor-pointer">
							<SmileAiIcon className="h-4 w-4 flex-shrink-0" />
							<span className="flex-1">Change tone</span>
							<ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="tiptap-dropdown-menu">
							{TONE_OPTIONS.map((tone) => (
								<DropdownMenuItem
									key={tone.id}
									onClick={() => handleAIAction(tone.prompt)}
									className="tiptap-dropdown-menu-item cursor-pointer flex items-center px-3 py-2 text-sm"
								>
									<span>{tone.label}</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					{/* <Separator className="tiptap-dropdown-menu-separator" /> */}

					{/* Ask AI Option */}
					<DropdownMenuItem
						onClick={openCustomAsk}
						className="tiptap-dropdown-menu-item cursor-pointer flex items-center gap-2 px-3 py-2 text-sm"
					>
						<MessageSquareIcon className="h-4 w-4 flex-shrink-0" />
						<span>Ask AI</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
