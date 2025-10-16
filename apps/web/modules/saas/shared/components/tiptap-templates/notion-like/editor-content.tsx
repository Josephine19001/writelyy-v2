"use client";

import { useAi } from "@shared/tiptap/contexts/ai-context";
import { useCollab } from "@shared/tiptap/contexts/collab-context";
import * as React from "react";

import { EditorProvider } from "./editor-provider";
import { LoadingSpinner } from "./loading-spinner";

interface EditorContentProps {
	placeholder?: string;
	onChange?: (content: any) => void;
	initialContent?: any;
	savingState?: {
		isSaving: boolean;
		lastSaved: Date | null;
		hasUnsavedChanges: boolean;
	};
	documentId?: string;
}

/**
 * Internal component that handles the editor loading state
 */
export function EditorContent({
	placeholder,
	onChange,
	initialContent,
	savingState,
	documentId,
}: EditorContentProps) {
	const { provider, ydoc } = useCollab();
	const { aiToken } = useAi();

	// Since collaboration is disabled, only wait for AI token (if needed)
	// If AI token is null, we'll just disable AI features but still show editor
	const isWaitingForRequiredTokens = false; // No required tokens for now

	if (isWaitingForRequiredTokens) {
		return <LoadingSpinner />;
	}

	return (
		<EditorProvider
			provider={provider || null}
			ydoc={ydoc}
			placeholder={placeholder}
			aiToken={aiToken}
			onChange={onChange}
			initialContent={initialContent}
			savingState={savingState}
			documentId={documentId}
		/>
	);
}
