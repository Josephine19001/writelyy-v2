"use client";

// --- TIptap UI ---
import type { UseAiAskConfig } from "@shared/tiptap/components/tiptap-ui/ai-ask-button";
import {
	AI_ASK_SHORTCUT_KEY,
	useAiAsk,
} from "@shared/tiptap/components/tiptap-ui/ai-ask-button";
import { Badge } from "@shared/tiptap/components/tiptap-ui-primitive/badge";
// --- UI Primitives ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
// --- Lib ---
import { parseShortcutKeys } from "@shared/tiptap/lib/tiptap-utils";
import * as React from "react";

export interface AiAskButtonProps
	extends Omit<ButtonProps, "type">,
		UseAiAskConfig {
	/**
	 * Optional text to display alongside the icon
	 */
	text?: string;
	/**
	 * Optional show shortcut keys in the button
	 */
	showShortcut?: boolean;
}

/**
 * Badge component displaying the AI shortcut key
 */
export function AskAiShortcutBadge({
	shortcutKeys = AI_ASK_SHORTCUT_KEY,
}: {
	shortcutKeys?: string;
}) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for triggering AI ask functionality on selected content in a Tiptap editor.
 */
export const AiAskButton = React.forwardRef<
	HTMLButtonElement,
	AiAskButtonProps
>(function AiAskButton(
	{
		editor: providedEditor,
		text,
		hideWhenUnavailable = false,
		onAiAsked,
		showShortcut = false,
		onClick,
		children,
		...buttonProps
	},
	ref,
) {
	const { editor } = useTiptapEditor(providedEditor);
	const { isVisible, canAiAsk, handleAiAsk, label, shortcutKeys, Icon } =
		useAiAsk({
			editor,
			hideWhenUnavailable,
			onAiAsked,
		});

	const handleClick = React.useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			onClick?.(event);
			if (event.defaultPrevented) return;
			handleAiAsk();
		},
		[handleAiAsk, onClick],
	);

	if (!isVisible) {
		return null;
	}

	return (
		<Button
			type="button"
			data-style="ghost"
			disabled={!canAiAsk}
			data-disabled={!canAiAsk}
			role="button"
			tabIndex={-1}
			aria-label={label}
			tooltip={label}
			onClick={handleClick}
			{...buttonProps}
			ref={ref}
		>
			{children ?? (
				<>
					<Icon className="tiptap-button-icon" />
					{text && <span className="tiptap-button-text">{text}</span>}
					{showShortcut && (
						<AskAiShortcutBadge shortcutKeys={shortcutKeys} />
					)}
				</>
			)}
		</Button>
	);
});
