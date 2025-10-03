"use client";

import type { Editor } from "@tiptap/react";
import * as React from "react";

export interface EditorContextValue {
	editor: Editor | null;
	/**
	 * Get the current selected text in the editor
	 */
	getSelectedText: () => string;
	/**
	 * Get the current document content as text
	 */
	getDocumentText: () => string;
	/**
	 * Get the current document content as JSON
	 */
	getDocumentJSON: () => any;
	/**
	 * Get the current cursor position and surrounding context
	 */
	getCurrentContext: () => {
		selectedText: string;
		cursorPosition: number;
		surroundingText: string;
		wordCount: number;
		characterCount: number;
	};
	/**
	 * Insert content at the current cursor position
	 */
	insertContent: (content: string) => void;
	/**
	 * Replace the selected text with new content
	 */
	replaceSelection: (content: string) => void;
}

const EditorContext = React.createContext<EditorContextValue | null>(null);

export interface EditorProviderProps {
	editor: Editor | null;
	children: React.ReactNode;
}

export function EditorProvider({ editor, children }: EditorProviderProps) {
	const getSelectedText = React.useCallback(() => {
		if (!editor) return "";
		const { from, to } = editor.state.selection;
		return editor.state.doc.textBetween(from, to);
	}, [editor]);

	const getDocumentText = React.useCallback(() => {
		if (!editor) return "";
		return editor.getText();
	}, [editor]);

	const getDocumentJSON = React.useCallback(() => {
		if (!editor) return null;
		return editor.getJSON();
	}, [editor]);

	const getCurrentContext = React.useCallback(() => {
		if (!editor) {
			return {
				selectedText: "",
				cursorPosition: 0,
				surroundingText: "",
				wordCount: 0,
				characterCount: 0,
			};
		}

		const { from, to } = editor.state.selection;
		const selectedText = editor.state.doc.textBetween(from, to);
		const documentText = editor.getText();
		
		// Get surrounding context (50 characters before and after selection)
		const contextStart = Math.max(0, from - 50);
		const contextEnd = Math.min(editor.state.doc.content.size, to + 50);
		const surroundingText = editor.state.doc.textBetween(contextStart, contextEnd);

		// Calculate word and character counts
		const words = documentText.trim().split(/\s+/).filter(word => word.length > 0);
		
		return {
			selectedText,
			cursorPosition: from,
			surroundingText,
			wordCount: words.length,
			characterCount: documentText.length,
		};
	}, [editor]);

	const insertContent = React.useCallback((content: string) => {
		if (!editor) return;
		editor.chain().focus().insertContent(content).run();
	}, [editor]);

	const replaceSelection = React.useCallback((content: string) => {
		if (!editor) return;
		editor.chain().focus().deleteSelection().insertContent(content).run();
	}, [editor]);

	const value = React.useMemo<EditorContextValue>(() => ({
		editor,
		getSelectedText,
		getDocumentText,
		getDocumentJSON,
		getCurrentContext,
		insertContent,
		replaceSelection,
	}), [
		editor,
		getSelectedText,
		getDocumentText,
		getDocumentJSON,
		getCurrentContext,
		insertContent,
		replaceSelection,
	]);

	return (
		<EditorContext.Provider value={value}>
			{children}
		</EditorContext.Provider>
	);
}

export function useEditorContext(): EditorContextValue {
	const context = React.useContext(EditorContext);
	if (!context) {
		throw new Error("useEditorContext must be used within an EditorProvider");
	}
	return context;
}

/**
 * Hook to check if editor context is available
 */
export function useEditorContextOptional(): EditorContextValue | null {
	return React.useContext(EditorContext);
}