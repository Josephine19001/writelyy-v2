"use client";

// -- Icons --
import { StopCircle2Icon } from "@shared/tiptap/components/tiptap-icons/stop-circle-2-icon";
import { AiMenuActions } from "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu-actions/ai-menu-actions";
import { AiMenuInputTextarea } from "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu-input/ai-menu-input";
import { AiMenuItems } from "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu-items/ai-menu-items";
import {
	Button,
	ButtonGroup,
} from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Card } from "@shared/tiptap/components/tiptap-ui-primitive/card/card";
import {
	ComboboxList,
	ComboboxPopover,
} from "@shared/tiptap/components/tiptap-ui-primitive/combobox";
// -- UI Primitives --
import {
	Menu,
	MenuContent,
	useFloatingMenuStore,
} from "@shared/tiptap/components/tiptap-ui-primitive/menu";
// -- Hooks --
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import { useUiEditorState } from "@shared/tiptap/hooks/use-ui-editor-state";
// -- Utils --
import {
	getSelectedDOMElement,
	selectionHasText,
} from "@shared/tiptap/lib/tiptap-advanced-utils";
import type { Editor } from "@tiptap/react";
import * as React from "react";
import {
	useAiContentTracker,
	useAiMenuState,
	useAiMenuStateProvider,
	useTextSelectionTracker,
} from "./ai-menu-hooks";
import { getContextAndInsertAt } from "./ai-menu-utils";

import "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu.scss";

export function AiMenuStateProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const { value, AiMenuStateContext } = useAiMenuStateProvider();

	return (
		<AiMenuStateContext.Provider value={value}>
			{children}
		</AiMenuStateContext.Provider>
	);
}

export function AiMenuContent({
	editor: providedEditor,
}: {
	editor?: Editor | null;
}) {
	const { editor } = useTiptapEditor(providedEditor);
	const { state, updateState, setFallbackAnchor, reset } = useAiMenuState();
	const { show, store } = useFloatingMenuStore();
	const {
		aiGenerationIsLoading,
		aiGenerationActive,
		aiGenerationHasMessage,
	} = useUiEditorState(editor);
	const tiptapAiPromptInputRef = React.useRef<HTMLDivElement | null>(null);

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

	const closeAiMenu = React.useCallback(() => {
		if (!editor) return;
		reset();
		store?.hideAll();
		editor.commands.resetUiState();
	}, [editor, reset, store]);

	const handlePromptSubmit = React.useCallback(
		(userPrompt: string) => {
			if (!editor || !userPrompt.trim()) return;

			const { context } = getContextAndInsertAt(editor);
			// if context, add it to the user prompt
			const promptWithContext = context
				? `${context}\n\n${userPrompt}`
				: userPrompt;

			// Ensure fallback anchor is set before submitting
			if (!state.fallbackAnchor.element || !state.fallbackAnchor.rect) {
				const currentSelectedElement = getSelectedDOMElement(editor);
				if (currentSelectedElement) {
					const rect = currentSelectedElement.getBoundingClientRect();
					setFallbackAnchor(currentSelectedElement, rect);
				}
			}

			if ((editor.commands as any).aiTextPrompt) {
				(editor.commands as any).aiTextPrompt({
					text: promptWithContext,
					insert: true,
					stream: true,
					tone: state.tone,
					format: "rich-text",
				});
			}
		},
		[editor, state.tone, state.fallbackAnchor, setFallbackAnchor],
	);

	const setAnchorElement = React.useCallback(
		(element: HTMLElement) => {
			store.setAnchorElement(element);
		},
		[store],
	);

	const handleSelectionChange = React.useCallback(
		(element: HTMLElement | null, rect: DOMRect | null) => {
			setFallbackAnchor(element, rect);
		},
		[setFallbackAnchor],
	);

	const handleOnReject = React.useCallback(() => {
		if (!editor) return;
		if ((editor.commands as any).aiReject) {
			(editor.commands as any).aiReject();
		}
		closeAiMenu();
	}, [closeAiMenu, editor]);

	const handleOnAccept = React.useCallback(() => {
		if (!editor) return;
		if ((editor.commands as any).aiAccept) {
			(editor.commands as any).aiAccept();
		}
		closeAiMenu();
	}, [closeAiMenu, editor]);

	const handleInputOnClose = React.useCallback(() => {
		if (!editor) return;
		if (aiGenerationIsLoading) {
			if ((editor.commands as any).aiReject) {
				(editor.commands as any).aiReject({ type: "reset" });
			}
		} else {
			if ((editor.commands as any).aiAccept) {
				(editor.commands as any).aiAccept();
			}
		}
		closeAiMenu();
	}, [aiGenerationIsLoading, closeAiMenu, editor]);

	const handleClickOutside = React.useCallback(() => {
		if (!aiGenerationIsLoading) {
			closeAiMenu();

			if (!editor) return;
			if ((editor.commands as any).aiAccept) {
				(editor.commands as any).aiAccept();
			}
		}
	}, [aiGenerationIsLoading, closeAiMenu, editor]);

	useAiContentTracker({
		editor,
		aiGenerationActive,
		setAnchorElement,
		fallbackAnchor: state.fallbackAnchor,
	});

	useTextSelectionTracker({
		editor,
		aiGenerationActive,
		showMenuAtElement: show,
		setMenuVisible: (visible) => updateState({ isOpen: visible }),
		onSelectionChange: handleSelectionChange,
		prevent: aiGenerationIsLoading,
	});

	React.useEffect(() => {
		if (aiGenerationIsLoading) {
			updateState({ shouldShowInput: false });
		}
	}, [aiGenerationIsLoading, updateState]);

	React.useEffect(() => {
		if (!aiGenerationActive && state.isOpen) {
			closeAiMenu();
		}
	}, [aiGenerationActive, state.isOpen, closeAiMenu]);

	// Position menu at selection when AI generation first becomes active
	React.useEffect(() => {
		if (!editor || !aiGenerationActive) return;

		const selectedElement = getSelectedDOMElement(editor);
		if (selectedElement) {
			const rect = selectedElement.getBoundingClientRect();
			setFallbackAnchor(selectedElement, rect);
			show(selectedElement);
		}
	}, [editor, aiGenerationActive, setFallbackAnchor, show]);

	const smoothFocusAndScroll = (element: HTMLElement | null) => {
		element?.focus();
		element?.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "nearest",
		});

		// Ensure the menu back to focus after focusing on the popover
		setTimeout(() => store.setAutoFocusOnShow(false), 0);
		return false;
	};

	const shouldShowList =
		selectionHasText(editor) ||
		(aiGenerationHasMessage &&
			state.shouldShowInput &&
			state.inputIsFocused);

	// Show menu when AI generation is active
	if (!editor || !state.isOpen || !aiGenerationActive) {
		return null;
	}

	return (
		<Menu open={state.isOpen} placement="bottom-start" store={store}>
			<MenuContent
				onClickOutside={handleClickOutside}
				className="tiptap-ai-menu"
				flip={false}
				gutter={2}
			>
				{aiGenerationIsLoading && (
					<Card>
						<AiMenuProgress editor={editor} />
					</Card>
				)}

				{aiGenerationHasMessage && !aiGenerationIsLoading && (
					<Card>
						<AiMenuActions
							editor={editor}
							options={{ tone: state.tone, format: "rich-text" }}
							onAccept={handleOnAccept}
							onReject={handleOnReject}
						/>
					</Card>
				)}

				{!aiGenerationIsLoading && !aiGenerationHasMessage && (
					<Card>
						<AiMenuInputTextarea
							onInputSubmit={handlePromptSubmit}
							onToneChange={(tone) => updateState({ tone })}
							onClose={handleInputOnClose}
							onInputFocus={() =>
								updateState({ inputIsFocused: true })
							}
							onInputBlur={() =>
								updateState({ inputIsFocused: false })
							}
							onEmptyBlur={closeAiMenu}
							onPlaceholderClick={() =>
								updateState({ shouldShowInput: true })
							}
							showPlaceholder={!state.shouldShowInput}
						/>
					</Card>
				)}

				{!aiGenerationIsLoading && state.shouldShowInput && (
					<ComboboxPopover
						flip={false}
						unmountOnHide
						autoFocus={false}
						gutter={36}
						onFocus={() => updateState({ inputIsFocused: true })}
						autoFocusOnShow={smoothFocusAndScroll}
						autoFocusOnHide={smoothFocusAndScroll}
						getAnchorRect={() => {
							const rect =
								tiptapAiPromptInputRef.current?.getBoundingClientRect();
							if (!rect) {
								return null;
							}
							// Position below the input by offsetting the rect
							return new DOMRect(
								rect.left,
								rect.bottom,
								rect.width,
								0,
							);
						}}
					>
						<ComboboxList
							style={{
								display: shouldShowList ? "block" : "none",
							}}
						>
							<AiMenuItems />
						</ComboboxList>
					</ComboboxPopover>
				)}
			</MenuContent>
		</Menu>
	);
}

export function AiMenuProgress({ editor }: { editor: Editor }) {
	const { reset } = useAiMenuState();

	const handleStop = React.useCallback(() => {
		if (!editor) return;

		if ((editor.commands as any).aiReject) {
			(editor.commands as any).aiReject({ type: "reset" });
		}
		reset();
		editor.commands.resetUiState();
	}, [editor, reset]);

	return (
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
	);
}

export function AiMenu({ editor }: { editor?: Editor | null }) {
	return (
		<AiMenuStateProvider>
			<AiMenuContent editor={editor} />
		</AiMenuStateProvider>
	);
}
