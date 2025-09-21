"use client";

// --- Tiptap UI ---
import type {
	ImageAlign,
	UseImageAlignConfig,
} from "@shared/tiptap/components/tiptap-ui/image-align-button";
import {
	IMAGE_ALIGN_SHORTCUT_KEYS,
	useImageAlign,
} from "@shared/tiptap/components/tiptap-ui/image-align-button";
import { Badge } from "@shared/tiptap/components/tiptap-ui-primitive/badge";
// --- UI Primitives ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
// --- Lib ---
import { parseShortcutKeys } from "@shared/tiptap/lib/tiptap-utils";
import * as React from "react";

export interface ImageAlignButtonProps
	extends Omit<ButtonProps, "type">,
		UseImageAlignConfig {
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

export function ImageAlignShortcutBadge({
	align,
	shortcutKeys = IMAGE_ALIGN_SHORTCUT_KEYS[align],
}: {
	align: ImageAlign;
	shortcutKeys?: string;
}) {
	return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for setting image alignment in a Tiptap editor.
 *
 * For custom button implementations, use the `useImageAlign` hook instead.
 */
export const ImageAlignButton = React.forwardRef<
	HTMLButtonElement,
	ImageAlignButtonProps
>(
	(
		{
			editor: providedEditor,
			align,
			text,
			extensionName,
			attributeName = "data-align",
			hideWhenUnavailable = false,
			onAligned,
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
			handleImageAlign,
			label,
			canAlign,
			isActive,
			Icon,
			shortcutKeys,
		} = useImageAlign({
			editor,
			align,
			extensionName,
			attributeName,
			hideWhenUnavailable,
			onAligned,
		});

		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				handleImageAlign();
			},
			[handleImageAlign, onClick],
		);

		if (!isVisible) {
			return null;
		}

		return (
			<Button
				type="button"
				disabled={!canAlign}
				data-style="ghost"
				data-active-state={isActive ? "on" : "off"}
				data-disabled={!canAlign}
				role="button"
				tabIndex={-1}
				aria-label={label}
				aria-pressed={isActive}
				tooltip={label}
				onClick={handleClick}
				{...buttonProps}
				ref={ref}
			>
				{children ?? (
					<>
						<Icon className="tiptap-button-icon" />
						{text ? <span>{text}</span> : null}
						{showShortcut ? (
							<ImageAlignShortcutBadge
								align={align}
								shortcutKeys={shortcutKeys}
							/>
						) : null}
					</>
				)}
			</Button>
		);
	},
);

ImageAlignButton.displayName = "ImageAlignButton";
