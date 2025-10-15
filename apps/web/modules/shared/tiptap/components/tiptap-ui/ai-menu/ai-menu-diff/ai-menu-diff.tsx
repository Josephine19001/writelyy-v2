"use client";

import * as React from "react";
import { diff_match_patch, DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL } from "diff-match-patch";

import "./ai-menu-diff.scss";

export interface AiMenuDiffProps {
	originalText: string;
	newText: string;
	mode?: "inline" | "side-by-side";
}

// Helper function to strip HTML tags for diff comparison
function stripHtml(html: string): string {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.textContent || '';
}

export function AiMenuDiff({ originalText, newText, mode = "inline" }: AiMenuDiffProps) {
	const diffs = React.useMemo(() => {
		// Strip HTML tags for cleaner diff comparison
		const cleanOriginal = stripHtml(originalText);
		const cleanNew = stripHtml(newText);

		const dmp = new diff_match_patch();
		const diff = dmp.diff_main(cleanOriginal, cleanNew);
		dmp.diff_cleanupSemantic(diff);
		return diff;
	}, [originalText, newText]);

	if (mode === "side-by-side") {
		return (
			<div className="tiptap-ai-diff-container side-by-side">
				<div className="tiptap-ai-diff-panel original">
					<div className="tiptap-ai-diff-header">Original</div>
					<div className="tiptap-ai-diff-content">
						{diffs.map((diff, index) => {
							const [operation, text] = diff;
							if (operation === DIFF_DELETE) {
								return (
									<span key={index} className="tiptap-ai-diff-deleted">
										{text}
									</span>
								);
							}
							if (operation === DIFF_EQUAL) {
								return <span key={index}>{text}</span>;
							}
							return null;
						})}
					</div>
				</div>
				<div className="tiptap-ai-diff-panel new">
					<div className="tiptap-ai-diff-header">AI Suggestion</div>
					<div className="tiptap-ai-diff-content">
						{diffs.map((diff, index) => {
							const [operation, text] = diff;
							if (operation === DIFF_INSERT) {
								return (
									<span key={index} className="tiptap-ai-diff-inserted">
										{text}
									</span>
								);
							}
							if (operation === DIFF_EQUAL) {
								return <span key={index}>{text}</span>;
							}
							return null;
						})}
					</div>
				</div>
			</div>
		);
	}

	// Inline mode - show changes in one view
	return (
		<div className="tiptap-ai-diff-container inline">
			<div className="tiptap-ai-diff-content">
				{diffs.map((diff, index) => {
					const [operation, text] = diff;
					if (operation === DIFF_DELETE) {
						return (
							<span key={index} className="tiptap-ai-diff-deleted">
								{text}
							</span>
						);
					}
					if (operation === DIFF_INSERT) {
						return (
							<span key={index} className="tiptap-ai-diff-inserted">
								{text}
							</span>
						);
					}
					return <span key={index}>{text}</span>;
				})}
			</div>
		</div>
	);
}
