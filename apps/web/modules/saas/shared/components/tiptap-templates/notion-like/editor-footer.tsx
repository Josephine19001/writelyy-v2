"use client";

import { EditorContext } from "@tiptap/react";
import * as React from "react";
import "./editor-footer.scss";

interface EditorFooterProps {
	isSaving?: boolean;
	lastSaved?: Date | null;
	hasUnsavedChanges?: boolean;
}

// Word count hook
function useWordCount(editor: any) {
	const [wordCount, setWordCount] = React.useState(0);

	React.useEffect(() => {
		if (!editor) return;

		const updateWordCount = () => {
			const text = editor.getText();
			const words = text.trim() ? text.trim().split(/\s+/).length : 0;
			setWordCount(words);
		};

		// Update word count on content change
		editor.on("update", updateWordCount);
		updateWordCount(); // Initial count

		return () => {
			editor.off("update", updateWordCount);
		};
	}, [editor]);

	return wordCount;
}

// Page count hook (for PageKit extension)
function usePageCount(editor: any) {
	const [pageCount, setPageCount] = React.useState(1);
	const [currentPage, setCurrentPage] = React.useState(1);

	React.useEffect(() => {
		if (!editor) return;

		const updatePageInfo = () => {
			// Try to get page info from PageKit extension
			try {
				const pages = editor.storage?.pages?.pages || [];
				setPageCount(Math.max(1, pages.length));
				
				// Get current page based on cursor position
				const { from } = editor.state.selection;
				let page = 1;
				for (let i = 0; i < pages.length; i++) {
					if (from >= pages[i].from && from <= pages[i].to) {
						page = i + 1;
						break;
					}
				}
				setCurrentPage(page);
			} catch {
				// Fallback if PageKit is not available
				setPageCount(1);
				setCurrentPage(1);
			}
		};

		// Update on content change and selection change
		editor.on("update", updatePageInfo);
		editor.on("selectionUpdate", updatePageInfo);
		updatePageInfo(); // Initial count

		return () => {
			editor.off("update", updatePageInfo);
			editor.off("selectionUpdate", updatePageInfo);
		};
	}, [editor]);

	return { pageCount, currentPage };
}

export function EditorFooter({ isSaving, lastSaved, hasUnsavedChanges }: EditorFooterProps) {
	const { editor } = React.useContext(EditorContext)!;
	const wordCount = useWordCount(editor);
	const { pageCount, currentPage } = usePageCount(editor);

	if (!editor) {
		return null;
	}

	const formatLastSaved = (date: Date) => {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		
		if (diffInSeconds < 60) {
			return "just now";
		} else if (diffInSeconds < 3600) {
			const minutes = Math.floor(diffInSeconds / 60);
			return `${minutes}m ago`;
		} else if (diffInSeconds < 86400) {
			const hours = Math.floor(diffInSeconds / 3600);
			return `${hours}h ago`;
		} else {
			return date.toLocaleDateString();
		}
	};

	return (
		<footer className="editor-footer">
			{/* Left side: Page and word count */}
			<div className="editor-footer-left">
				<span className="page-count">
					Page {currentPage} of {pageCount}
				</span>
				<span className="separator">·</span>
				<span className="word-count">
					{wordCount} words
				</span>
			</div>

			{/* Right side: Saving status */}
			<div className="editor-footer-right">
				{isSaving && (
					<span className="saving-indicator">
						<span className="saving-spinner" />
						Saving...
					</span>
				)}
				{!isSaving && hasUnsavedChanges && (
					<span className="unsaved-indicator">
						● Unsaved changes
					</span>
				)}
				{!isSaving && !hasUnsavedChanges && lastSaved && (
					<span className="last-saved">
						✓ Saved {formatLastSaved(lastSaved)}
					</span>
				)}
			</div>
		</footer>
	);
}