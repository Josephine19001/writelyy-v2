"use client";

// --- Tiptap UI ---
import type { UseDuplicateConfig } from "@shared/tiptap/components/tiptap-ui/duplicate-button";
import {
	DUPLICATE_SHORTCUT_KEY,
	useDuplicate,
} from "@shared/tiptap/components/tiptap-ui/duplicate-button";
import { Badge } from "@shared/tiptap/components/tiptap-ui-primitive/badge";
// --- UI Primitives ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
// --- Lib ---
import { parseShortcutKeys } from "@shared/tiptap/lib/tiptap-utils";
import * as React from "react";

export interface DuplicateButtonProps
	extends Omit<ButtonProps, "type">,
		UseDuplicateConfig {
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

export function DuplicateShortcutBadge({
	shortcutKeys = DUPLICATE_SHORTCUT_KEY,
}: {
	shortcutKeys?: string;
}) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for duplicating a node in a Tiptap editor.
 *
 * For custom button implementations, use the `useDuplicate` hook instead.
 */
export const DuplicateButton = React.forwardRef<
	HTMLButtonElement,
	DuplicateButtonProps
>(
	(
		{
			editor: providedEditor,
			text,
			hideWhenUnavailable = false,
			onDuplicated,
			showShortcut = false,
			onClick,
			children,
			...buttonProps
		},
		ref,
	) => {
		const { editor } = useTiptapEditor(providedEditor);
		const { isVisible, handleDuplicate, label, shortcutKeys, Icon } =
			useDuplicate({
				editor,
				hideWhenUnavailable,
				onDuplicated,
			});

		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				handleDuplicate();
			},
			[handleDuplicate, onClick],
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
				tooltip="Duplicate"
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
							<DuplicateShortcutBadge
								shortcutKeys={shortcutKeys}
							/>
						)}
					</>
				)}
			</Button>
		);
	},
);

DuplicateButton.displayName = "DuplicateButton";
