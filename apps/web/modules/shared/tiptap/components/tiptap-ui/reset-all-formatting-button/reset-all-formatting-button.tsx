"use client";

// --- Tiptap UI ---
import type { UseResetAllFormattingConfig } from "@shared/tiptap/components/tiptap-ui/reset-all-formatting-button";
import {
	RESET_ALL_FORMATTING_SHORTCUT_KEY,
	useResetAllFormatting,
} from "@shared/tiptap/components/tiptap-ui/reset-all-formatting-button";
import { Badge } from "@shared/tiptap/components/tiptap-ui-primitive/badge";
// --- UI Primitives ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
// --- Lib ---
import { parseShortcutKeys } from "@shared/tiptap/lib/tiptap-utils";
import * as React from "react";

export interface ResetAllFormattingButtonProps
	extends Omit<ButtonProps, "type">,
		UseResetAllFormattingConfig {
	/**
	 * Optional text to display alongside the icon.
	 */
	text?: string;
	/**
	 * Optional show shortcut keys in the button.
	 * @default false
	 */
	showShortcut?: boolean;
}

export function ResetAllFormattingShortcutBadge({
	shortcutKeys = RESET_ALL_FORMATTING_SHORTCUT_KEY,
}: {
	shortcutKeys?: string;
}) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for resetting formatting of a node in a Tiptap editor.
 * Removes all marks and converts non-paragraph nodes to paragraphs.
 *
 * For custom button implementations, use the `useResetAllFormatting` hook instead.
 */
export const ResetAllFormattingButton = React.forwardRef<
	HTMLButtonElement,
	ResetAllFormattingButtonProps
>(
	(
		{
			editor: providedEditor,
			text,
			hideWhenUnavailable = false,
			preserveMarks = ["inlineThread"],
			onResetAllFormatting,
			showShortcut = false,
			onClick,
			children,
			...buttonProps
		},
		ref,
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const {
			isVisible,
			canReset,
			handleResetFormatting,
			label,
			shortcutKeys,
			Icon,
		} = useResetAllFormatting({
			editor,
			preserveMarks,
			hideWhenUnavailable,
			onResetAllFormatting,
		});

		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				handleResetFormatting();
			},
			[handleResetFormatting, onClick],
		);

		if (!isVisible) {
			return null;
		}

		return (
			<Button
				type="button"
				data-style="ghost"
				disabled={!canReset}
				data-disabled={!canReset}
				data-active-state="off"
				role="button"
				tabIndex={-1}
				aria-label={label}
				tooltip="Reset formatting"
				onClick={handleClick}
				{...buttonProps}
				ref={ref}
			>
				{children ?? (
					<>
						<Icon className="tiptap-button-icon" />
						{text && (
							<span className="tiptap-button-text">{text}</span>
						)}
						{showShortcut && (
							<ResetAllFormattingShortcutBadge
								shortcutKeys={shortcutKeys}
							/>
						)}
					</>
				)}
			</Button>
		);
	},
);

ResetAllFormattingButton.displayName = "ResetAllFormattingButton";
