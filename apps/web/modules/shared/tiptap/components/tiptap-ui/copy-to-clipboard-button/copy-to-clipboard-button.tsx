"use client";

// --- Tiptap UI ---
import type { UseCopyToClipboardConfig } from "@shared/tiptap/components/tiptap-ui/copy-to-clipboard-button";
import {
	COPY_TO_CLIPBOARD_SHORTCUT_KEY,
	useCopyToClipboard,
} from "@shared/tiptap/components/tiptap-ui/copy-to-clipboard-button";
import { Badge } from "@shared/tiptap/components/tiptap-ui-primitive/badge";
// --- UI Primitives ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
// --- Lib ---
import { parseShortcutKeys } from "@shared/tiptap/lib/tiptap-utils";
import * as React from "react";

export interface CopyToClipboardButtonProps
	extends Omit<ButtonProps, "type">,
		UseCopyToClipboardConfig {
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

export function CopyToClipboardShortcutBadge({
	shortcutKeys = COPY_TO_CLIPBOARD_SHORTCUT_KEY,
}: {
	shortcutKeys?: string;
}) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for copying content to clipboard in a Tiptap editor.
 *
 * For custom button implementations, use the `useCopyToClipboard` hook instead.
 */
export const CopyToClipboardButton = React.forwardRef<
	HTMLButtonElement,
	CopyToClipboardButtonProps
>(
	(
		{
			editor: providedEditor,
			text,
			copyWithFormatting = true,
			hideWhenUnavailable = false,
			onCopied,
			showShortcut = false,
			onClick,
			children,
			...buttonProps
		},
		ref,
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const { isVisible, handleCopyToClipboard, label, shortcutKeys, Icon } =
			useCopyToClipboard({
				editor,
				copyWithFormatting,
				hideWhenUnavailable,
				onCopied,
			});

		const handleClick = React.useCallback(
			async (event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				await handleCopyToClipboard();
			},
			[handleCopyToClipboard, onClick],
		);

		if (!isVisible) {
			return null;
		}

		return (
			<Button
				type="button"
				data-style="ghost"
				role="button"
				tabIndex={-1}
				aria-label={label}
				tooltip="Copy to clipboard"
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
							<CopyToClipboardShortcutBadge
								shortcutKeys={shortcutKeys}
							/>
						)}
					</>
				)}
			</Button>
		);
	},
);

CopyToClipboardButton.displayName = "CopyToClipboardButton";
