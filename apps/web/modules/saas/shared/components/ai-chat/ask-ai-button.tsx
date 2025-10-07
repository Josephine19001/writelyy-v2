"use client";

import * as React from "react";
import { AIInputWithSources } from "./ai-input-with-sources";
import type { MentionItem } from "../ai-panel/types";

export interface AskAIButtonProps {
	placeholder?: string;
	onSendMessage: (message: string, mentions?: MentionItem[]) => void;
	disabled?: boolean;
	className?: string;
	minRows?: number;
	maxRows?: number;
}

export function AskAIButton({
	placeholder = "Ask what you want...",
	onSendMessage,
	disabled = false,
	className = "",
	minRows = 1,
	maxRows = 3,
}: AskAIButtonProps) {
	return (
		<AIInputWithSources
			placeholder={placeholder}
			onSendMessage={onSendMessage}
			disabled={disabled}
			className={className}
			minRows={minRows}
			maxRows={maxRows}
		/>
	);
}