"use client";

import { EditorContext } from "@tiptap/react";
import * as React from "react";
import { AiMenuInputTextarea } from "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu-input";
import { AiMenuActions } from "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu-actions/ai-menu-actions";
import { AiMenuDiff } from "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu-diff/ai-menu-diff";
import { StopCircle2Icon } from "@shared/tiptap/components/tiptap-icons/stop-circle-2-icon";
import { Button, ButtonGroup } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Card } from "@shared/tiptap/components/tiptap-ui-primitive/card/card";
import { ComboboxProvider } from "@shared/tiptap/components/tiptap-ui-primitive/combobox";
import { useUiEditorState } from "@shared/tiptap/hooks/use-ui-editor-state";
import { useAiChatHistory } from "@saas/shared/hooks/use-ai-chat-history";
import "./editor-footer.scss";
import "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu.scss";

interface EditorFooterProps {
	isSaving?: boolean;
	lastSaved?: Date | null;
	hasUnsavedChanges?: boolean;
	documentId?: string;
}

// Word count hook
function useWordCount(editor: any) {
	const [wordCount, setWordCount] = React.useState(0);

	React.useEffect(() => {
		if (!editor) return;

		const updateWordCount = () => {
			const text = editor.getText();
			const words = text.trim() ? text.trim().split(/\s+/).length : 0;
			setWordCount(words);
		};

		// Update word count on content change
		editor.on("update", updateWordCount);
		updateWordCount(); // Initial count

		return () => {
			editor.off("update", updateWordCount);
		};
	}, [editor]);

	return wordCount;
}

// Page count hook (for PageKit extension)
function usePageCount(editor: any) {
	const [pageCount, setPageCount] = React.useState(1);
	const [currentPage, setCurrentPage] = React.useState(1);

	React.useEffect(() => {
		if (!editor) return;

		const updatePageInfo = () => {
			// Try to get page info from PageKit extension
			try {
				const pages = editor.storage?.pages?.pages || [];
				setPageCount(Math.max(1, pages.length));

				// Get current page based on cursor position
				const { from } = editor.state.selection;
				let page = 1;
				for (let i = 0; i < pages.length; i++) {
					if (from >= pages[i].from && from <= pages[i].to) {
						page = i + 1;
						break;
					}
				}
				setCurrentPage(page);
			} catch {
				// Fallback if PageKit is not available
				setPageCount(1);
				setCurrentPage(1);
			}
		};

		// Update on content change and selection change
		editor.on("update", updatePageInfo);
		editor.on("selectionUpdate", updatePageInfo);
		updatePageInfo(); // Initial count

		return () => {
			editor.off("update", updatePageInfo);
			editor.off("selectionUpdate", updatePageInfo);
		};
	}, [editor]);

	return { pageCount, currentPage };
}

export function EditorFooter({
	isSaving,
	lastSaved,
	hasUnsavedChanges,
	documentId,
}: EditorFooterProps) {
	const { editor } = React.useContext(EditorContext)!;
	const wordCount = useWordCount(editor);
	const { pageCount, currentPage } = usePageCount(editor);
	const [showAiInput, setShowAiInput] = React.useState(false);
	const [currentPrompt, setCurrentPrompt] = React.useState<string>("");
	const [currentMentions, setCurrentMentions] = React.useState<any[]>([]);

	// Get AI state from editor
	const {
		aiGenerationIsLoading,
		aiGenerationActive,
		aiGenerationHasMessage,
	} = useUiEditorState(editor);

	// Chat history hook
	const { saveConversation } = useAiChatHistory(documentId);

	// Get AI storage data for diff view
	const [aiData, setAiData] = React.useState({
		originalText: "",
		newText: "",
	});

	React.useEffect(() => {
		if (!editor || !aiGenerationHasMessage) {
			setAiData({ originalText: "", newText: "" });
			return;
		}

		const storage = (editor.storage as any).ai || {};
		const originalText = storage.originalText || "";
		const newText = storage.message || "";

		setAiData({
			originalText,
			newText,
		});
	}, [editor, aiGenerationHasMessage]);

	// Listen for the custom event to show AI input
	React.useEffect(() => {
		const handleShowAiInput = () => {
			setShowAiInput(true);
		};

		window.addEventListener("tiptap-show-ai-input", handleShowAiInput);

		return () => {
			window.removeEventListener("tiptap-show-ai-input", handleShowAiInput);
		};
	}, []);

	// Keep AI input visible while AI is active
	React.useEffect(() => {
		if (aiGenerationActive) {
			setShowAiInput(true);
		} else if (!aiGenerationActive && !aiGenerationHasMessage) {
			setShowAiInput(false);
		}
	}, [aiGenerationActive, aiGenerationHasMessage]);

	const handleSendMessage = React.useCallback((message: string, mentions?: any[]) => {
		if (!editor) return;

		// Save prompt and mentions for chat history
		setCurrentPrompt(message);
		setCurrentMentions(mentions || []);

		// Separate sources and snippets from mentions
		const sources = mentions?.filter(m => m.type === "source" || m.type === "doc" || m.type === "image" || m.type === "pdf" || m.type === "link");
		const snippets = mentions?.filter(m => m.type === "asset" || m.type === "snippet");

		// Insert the AI-generated content or trigger AI generation
		if ((editor.commands as any).bkAiTextPrompt) {
			(editor.commands as any).bkAiTextPrompt({
				prompt: message,
				command: "prompt",
				insert: true,
				stream: true,
				tone: "auto",
				format: "rich-text",
				sources: sources?.map(s => ({
					id: s.id,
					name: s.name,
					type: s.type,
					content: s.content || s.extractedText || s.url,
				})),
				snippets: snippets?.map(s => ({
					id: s.id,
					title: s.name || s.title,
					content: s.content,
				})),
			});
		}

		// Don't close the AI input - let it transition to loading state
		// It will be closed when user accepts/rejects or cancels
	}, [editor]);

	const handleCancel = React.useCallback(() => {
		if (!editor) return;

		// If AI is loading, reject it
		if (aiGenerationIsLoading) {
			if ((editor.commands as any).aiReject) {
				(editor.commands as any).aiReject({ type: "reset" });
			}
		}

		setShowAiInput(false);
		editor.commands.resetUiState();
	}, [editor, aiGenerationIsLoading]);

	const handleStop = React.useCallback(() => {
		if (!editor) return;

		if ((editor.commands as any).aiReject) {
			(editor.commands as any).aiReject({ type: "reset" });
		}
		setShowAiInput(false);
		editor.commands.resetUiState();
	}, [editor]);

	const handleAccept = React.useCallback(async () => {
		if (!editor) return;

		// Save conversation to chat history before accepting
		if (currentPrompt && aiData.newText && documentId) {
			const sources = currentMentions.filter(m => m.type === "source" || m.type === "doc" || m.type === "image" || m.type === "pdf" || m.type === "link");
			const snippets = currentMentions.filter(m => m.type === "asset" || m.type === "snippet");

			await saveConversation(
				currentPrompt,
				aiData.newText,
				{
					sources: sources.length > 0 ? sources : undefined,
					snippets: snippets.length > 0 ? snippets : undefined,
				}
			);
		}

		if ((editor.commands as any).aiAccept) {
			(editor.commands as any).aiAccept();
		}
		setShowAiInput(false);
		setCurrentPrompt("");
		setCurrentMentions([]);
		editor.commands.resetUiState();
	}, [editor, currentPrompt, currentMentions, aiData.newText, documentId, saveConversation]);

	const handleReject = React.useCallback(() => {
		if (!editor) return;
		if ((editor.commands as any).aiReject) {
			(editor.commands as any).aiReject();
		}
		setShowAiInput(false);
		editor.commands.resetUiState();
	}, [editor]);

	// State for combobox value (needed for AI input)
	const [comboboxValue, setComboboxValue] = React.useState("");

	if (!editor) {
		return null;
	}

	const formatLastSaved = (date: Date) => {
		const now = new Date();
		const diffInSeconds = Math.floor(
			(now.getTime() - date.getTime()) / 1000,
		);

		if (diffInSeconds < 60) {
			return "just now";
		}
		if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `${minutes}m ago`;
		}
		if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `${hours}h ago`;
		}
		return date.toLocaleDateString();
	};

	return (
		<>
			{/* AI Input - shown when triggered from slash menu */}
			{showAiInput && (
				<div className="editor-footer-ai-input">
					{/* Loading state */}
					{aiGenerationIsLoading && (
						<Card>
							<div className="tiptap-ai-menu-progress">
								<div className="tiptap-spinner-alt">
									<span>AI is writing</span>
									<div className="dots-container">
										<div className="dot" />
										<div className="dot" />
										<div className="dot" />
									</div>
								</div>

								<ButtonGroup>
									<Button data-style="ghost" title="Stop" onClick={handleStop}>
										<StopCircle2Icon className="tiptap-button-icon" />
									</Button>
								</ButtonGroup>
							</div>
						</Card>
					)}

					{/* Diff view with accept/reject actions */}
					{aiGenerationHasMessage && !aiGenerationIsLoading && (
						<Card>
							{aiData.originalText && aiData.newText ? (
								<AiMenuDiff
									originalText={aiData.originalText}
									newText={aiData.newText}
									mode="inline"
								/>
							) : (
								aiData.newText && (
									<AiMenuDiff
										originalText=""
										newText={aiData.newText}
										mode="inline"
									/>
								)
							)}
							<AiMenuActions
								editor={editor}
								options={{ tone: "auto", format: "rich-text" }}
								onAccept={handleAccept}
								onReject={handleReject}
							/>
						</Card>
					)}

					{/* Input state */}
					{!aiGenerationIsLoading && !aiGenerationHasMessage && (
						<ComboboxProvider value={comboboxValue} setValue={setComboboxValue}>
							<AiMenuInputTextarea
								onInputSubmit={(message, options) => {
									handleSendMessage(message, [
										...(options?.snippets || []),
										...(options?.sources || []),
									]);
								}}
								onClose={handleCancel}
								placeholder="Ask AI to write anything..."
								showPlaceholder={false}
							/>
						</ComboboxProvider>
					)}
				</div>
			)}

			<footer className="editor-footer">
				{/* Left side: Page and word count */}
				<div className="editor-footer-left">
					{/* <span className="page-count">
						Page {currentPage} of {pageCount}
					</span>
					<span className="separator">·</span> */}
					<span className="text-sm">{wordCount} words</span>
				</div>

				{/* Right side: Saving status */}
				<div className="editor-footer-right">
					{isSaving && (
						<span className="saving-indicator">
							<span className="saving-spinner" />
							Saving...
						</span>
					)}
					{!isSaving && hasUnsavedChanges && (
						<span className="unsaved-indicator">● Unsaved changes</span>
					)}
					{!isSaving && !hasUnsavedChanges && lastSaved && (
						<span className="last-saved">
							✓ Saved {formatLastSaved(lastSaved)}
						</span>
					)}
				</div>
			</footer>
		</>
	);
}
