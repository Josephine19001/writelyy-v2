"use client";

import { CheckIcon } from "@shared/tiptap/components/tiptap-icons/check-icon";
import { RefreshAiIcon } from "@shared/tiptap/components/tiptap-icons/refresh-ai-icon";
import { XIcon } from "@shared/tiptap/components/tiptap-icons/x-icon";
import {
	Button,
	ButtonGroup,
} from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { useUiEditorState } from "@shared/tiptap/hooks/use-ui-editor-state";
import type { Editor } from "@tiptap/react";
import type { TextOptions } from "@shared/tiptap/types/ai-types";
import * as React from "react";

import "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu-actions/ai-menu-actions.scss";

export interface AiMenuActionsProps {
	editor: Editor | null;
	options: TextOptions;
	onRegenerate?: () => void;
	onAccept?: () => void;
	onReject?: () => void;
}

export function AiMenuActions({
	editor,
	options,
	onRegenerate,
	onAccept,
	onReject,
}: AiMenuActionsProps) {
	const { aiGenerationIsLoading } = useUiEditorState(editor);

	const handleRegenerate = React.useCallback(() => {
		if (!editor) return;
		// TODO: Implement regenerate functionality when AI commands are available
		// The specific AI command API needs to be verified
		console.warn('Regenerate functionality not yet implemented');
		onRegenerate?.();
	}, [editor, onRegenerate]);

	const handleDiscard = React.useCallback(() => {
		if (!editor) return;
		// TODO: Implement discard functionality when AI commands are available
		console.warn('Discard functionality not yet implemented');
		onReject?.();
	}, [editor, onReject]);

	const handleApply = React.useCallback(() => {
		if (!editor) return;
		// TODO: Implement apply functionality when AI commands are available
		console.warn('Apply functionality not yet implemented');
		onAccept?.();
	}, [editor, onAccept]);

	return (
		<div className="tiptap-ai-menu-actions">
			<div className="tiptap-ai-menu-results">
				<ButtonGroup orientation="horizontal">
					<Button
						data-style="ghost"
						className="tiptap-button"
						onClick={handleRegenerate}
						disabled={aiGenerationIsLoading}
					>
						<RefreshAiIcon className="tiptap-button-icon" />
						Try again
					</Button>
				</ButtonGroup>
			</div>

			<div className="tiptap-ai-menu-commit">
				<ButtonGroup orientation="horizontal">
					<Button
						data-style="ghost"
						className="tiptap-button"
						onClick={handleDiscard}
					>
						<XIcon className="tiptap-button-icon" />
						Discard
					</Button>
					<Button
						data-style="primary"
						className="tiptap-button"
						onClick={handleApply}
					>
						<CheckIcon className="tiptap-button-icon" />
						Apply
					</Button>
				</ButtonGroup>
			</div>
		</div>
	);
}
