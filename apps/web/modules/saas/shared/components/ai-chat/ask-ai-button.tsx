"use client";

import * as React from "react";
import { AIInputWithSources } from "./ai-input-with-sources";
import type { MentionItem } from "../ai-panel/types";

export interface AskAIButtonProps {
	placeholder?: string;
	onSendMessage: (message: string, mentions?: MentionItem[]) => void;
	onCancel?: () => void;
	disabled?: boolean;
	className?: string;
	minRows?: number;
	maxRows?: number;
	autoFocus?: boolean;
}

export function AskAIButton({
	placeholder = "Ask what you want...",
	onSendMessage,
	onCancel,
	disabled = false,
	className = "",
	minRows = 1,
	maxRows = 3,
	autoFocus = true,
}: AskAIButtonProps) {
	return (
		<AIInputWithSources
			placeholder={placeholder}
			onSendMessage={onSendMessage}
			onCancel={onCancel}
			disabled={disabled}
			className={className}
			minRows={minRows}
			maxRows={maxRows}
			autoFocus={autoFocus}
		/>
	);
}