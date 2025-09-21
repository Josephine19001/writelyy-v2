"use client";

// --- Tiptap UI ---
import type { UseMentionTriggerConfig } from "@shared/tiptap/components/tiptap-ui/mention-trigger-button";
import {
	MENTION_TRIGGER_SHORTCUT_KEY,
	useMentionTrigger,
} from "@shared/tiptap/components/tiptap-ui/mention-trigger-button";
import { Badge } from "@shared/tiptap/components/tiptap-ui-primitive/badge";
// --- UI Primitives ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
// --- Lib ---
import { parseShortcutKeys } from "@shared/tiptap/lib/tiptap-utils";
import * as React from "react";

export interface MentionTriggerButtonProps
	extends Omit<ButtonProps, "type">,
		UseMentionTriggerConfig {
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

export function MentionShortcutBadge({
	shortcutKeys = MENTION_TRIGGER_SHORTCUT_KEY,
}: {
	shortcutKeys?: string;
}) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for inserting mention triggers in a Tiptap editor.
 *
 * For custom button implementations, use the `useMention` hook instead.
 */
export const MentionTriggerButton = React.forwardRef<
	HTMLButtonElement,
	MentionTriggerButtonProps
>(
	(
		{
			editor: providedEditor,
			node,
			nodePos,
			text,
			trigger = "@",
			hideWhenUnavailable = false,
			onTriggered,
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
			canInsert,
			handleMention,
			label,
			shortcutKeys,
			Icon,
		} = useMentionTrigger({
			editor,
			node,
			nodePos,
			trigger,
			hideWhenUnavailable,
			onTriggered,
		});

		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				handleMention();
			},
			[handleMention, onClick],
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
				disabled={!canInsert}
				data-disabled={!canInsert}
				aria-label={label}
				tooltip={label}
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
							<MentionShortcutBadge shortcutKeys={shortcutKeys} />
						)}
					</>
				)}
			</Button>
		);
	},
);

MentionTriggerButton.displayName = "MentionTriggerButton";
