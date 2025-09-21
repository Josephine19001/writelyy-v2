"use client";

// --- Tiptap UI ---
import type { UseTextConfig } from "@shared/tiptap/components/tiptap-ui/text-button";
import {
	TEXT_SHORTCUT_KEY,
	useText,
} from "@shared/tiptap/components/tiptap-ui/text-button";
import { Badge } from "@shared/tiptap/components/tiptap-ui-primitive/badge";
// --- UI Primitives ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
// --- Lib ---
import { parseShortcutKeys } from "@shared/tiptap/lib/tiptap-utils";
import * as React from "react";

export interface TextButtonProps
	extends Omit<ButtonProps, "type">,
		UseTextConfig {
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

export function TextShortcutBadge({
	shortcutKeys = TEXT_SHORTCUT_KEY,
}: {
	shortcutKeys?: string;
}) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for converting to text/paragraph in a Tiptap editor.
 *
 * For custom button implementations, use the `useText` hook instead.
 */
export const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
	(
		{
			editor: providedEditor,
			text,
			hideWhenUnavailable = false,
			onToggled,
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
			canToggle,
			isActive,
			handleToggle,
			label,
			shortcutKeys,
			Icon,
		} = useText({
			editor,
			hideWhenUnavailable,
			onToggled,
		});

		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				handleToggle();
			},
			[handleToggle, onClick],
		);

		if (!isVisible) {
			return null;
		}

		return (
			<Button
				type="button"
				data-style="ghost"
				data-active-state={isActive ? "on" : "off"}
				role="button"
				tabIndex={-1}
				disabled={!canToggle}
				data-disabled={!canToggle}
				aria-label={label}
				aria-pressed={isActive}
				tooltip="Text"
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
							<TextShortcutBadge shortcutKeys={shortcutKeys} />
						)}
					</>
				)}
			</Button>
		);
	},
);

TextButton.displayName = "TextButton";
