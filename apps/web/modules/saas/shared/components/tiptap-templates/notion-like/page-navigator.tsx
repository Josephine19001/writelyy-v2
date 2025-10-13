"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@ui/components/tooltip";
import { useCurrentEditor } from "@tiptap/react";
import { cn } from "@ui/lib";
import * as React from "react";

interface PageInfo {
	pageNumber: number;
	previewText: string;
	estimatedFrom: number;
	estimatedTo: number;
}

// Hook to get page count (similar to footer)
function usePageCount(editor: any) {
	const [pageCount, setPageCount] = React.useState(1);

	React.useEffect(() => {
		if (!editor) return;

		const updatePageInfo = () => {
			try {
				const pages = editor.storage?.pages?.pages || [];
				const count = Math.max(1, pages.length);
				setPageCount(count);
			} catch {
				setPageCount(1);
			}
		};

		editor.on("update", updatePageInfo);
		editor.on("selectionUpdate", updatePageInfo);
		updatePageInfo();

		return () => {
			editor.off("update", updatePageInfo);
			editor.off("selectionUpdate", updatePageInfo);
		};
	}, [editor]);

	return pageCount;
}

export function PageNavigator() {
	const { editor } = useCurrentEditor();
	const [pages, setPages] = React.useState<PageInfo[]>([]);
	const [currentPage, setCurrentPage] = React.useState(1);
	const pageCount = usePageCount(editor);

	// Extract page information based on document structure
	React.useEffect(() => {
		if (!editor || pageCount === 0) return;

		const updatePages = () => {
			try {
				// Get the document
				const doc = editor.state.doc;
				const totalSize = doc.content.size;

				// Create pages based on pageCount and extract content from the document
				const pagesInfo: PageInfo[] = [];

				if (pageCount > 1) {
					// Estimate page boundaries based on total content size
					const estimatedPageSize = Math.floor(totalSize / pageCount);

					for (let i = 0; i < pageCount; i++) {
						const from = i * estimatedPageSize;
						const to = i === pageCount - 1 ? totalSize : (i + 1) * estimatedPageSize;

						let previewText = "";

						// Extract first text from this range
						try {
							doc.nodesBetween(from, Math.min(to, totalSize - 1), (node) => {
								if (!previewText && node.isText && node.text?.trim()) {
									previewText = node.text.trim().slice(0, 30);
									return false;
								}
							});
						} catch (e) {
							console.error("Error extracting page text:", e);
						}

						pagesInfo.push({
							pageNumber: i + 1,
							previewText: previewText || `Page ${i + 1}`,
							estimatedFrom: from,
							estimatedTo: to,
						});
					}
				} else {
					// Single page
					let previewText = "";
					doc.descendants((node) => {
						if (!previewText && node.isText && node.text?.trim()) {
							previewText = node.text.trim().slice(0, 30);
							return false;
						}
					});

					pagesInfo.push({
						pageNumber: 1,
						previewText: previewText || "Page 1",
						estimatedFrom: 0,
						estimatedTo: totalSize,
					});
				}

				console.log("Pages created:", pagesInfo, "PageCount:", pageCount);
				setPages(pagesInfo);
			} catch (error) {
				console.error("Error updating pages:", error);
			}
		};

		// Update pages on editor update
		editor.on("update", updatePages);

		// Initial update
		updatePages();

		// Also try after a short delay to catch late-rendered pages
		const timeout = setTimeout(updatePages, 500);

		return () => {
			editor.off("update", updatePages);
			clearTimeout(timeout);
		};
	}, [editor, pageCount]);

	// Track current page based on cursor position
	React.useEffect(() => {
		if (!editor || pages.length === 0) return;

		const updateCurrentPage = () => {
			try {
				const { from } = editor.state.selection;

				// Find which page contains the cursor
				for (let i = 0; i < pages.length; i++) {
					if (from >= pages[i].estimatedFrom && from <= pages[i].estimatedTo) {
						setCurrentPage(i + 1);
						return;
					}
				}

				// Default to first page if not found
				setCurrentPage(1);
			} catch (error) {
				console.error("Error updating current page:", error);
			}
		};

		editor.on("selectionUpdate", updateCurrentPage);
		updateCurrentPage();

		return () => {
			editor.off("selectionUpdate", updateCurrentPage);
		};
	}, [editor, pages]);

	const handlePageClick = (page: PageInfo) => {
		if (!editor) return;

		try {
			// Move cursor to the start of the page
			const targetPos = Math.max(page.estimatedFrom, 0);
			editor.chain().focus().setTextSelection(targetPos).run();

			// Scroll to that position
			const domNode = editor.view.domAtPos(targetPos).node as HTMLElement;
			if (domNode) {
				const element = domNode.nodeType === Node.ELEMENT_NODE
					? domNode
					: domNode.parentElement;
				element?.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		} catch (error) {
			console.error("Error navigating to page:", error);
		}
	};

	if (!editor || pages.length === 0) {
		return null;
	}

	return (
		<div className="fixed left-[280px] top-1/2 -translate-y-1/2 z-40 ml-4">
			<div className="flex flex-col items-start py-2 px-2 space-y-1 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg w-[160px]">
				<TooltipProvider delayDuration={300}>
					<div className="text-xs font-semibold text-muted-foreground px-2 py-1">
						Pages
					</div>
					<div className="w-full h-px bg-border" />
					<div className="flex flex-col gap-0.5 w-full overflow-y-auto pr-1" style={{ maxHeight: "calc(6 * 2.5rem)" }}>
						{pages.map((page) => (
							<Tooltip key={page.pageNumber}>
								<TooltipTrigger asChild>
									<button
										onClick={() => handlePageClick(page)}
										className={cn(
											"flex items-center gap-2 px-2 py-1.5 rounded-md text-left w-full transition-colors text-xs",
											"hover:bg-primary/10 hover:text-primary",
											currentPage === page.pageNumber
												? "bg-primary/20 text-primary font-medium"
												: "text-muted-foreground"
										)}
									>
										<span className="flex-shrink-0 font-mono text-[10px] w-3">
											{page.pageNumber}
										</span>
										<span className="truncate flex-1 text-[10px] leading-tight">
											{page.previewText}
										</span>
									</button>
								</TooltipTrigger>
								<TooltipContent side="right">
									<p className="max-w-xs text-xs">
										{page.previewText}
									</p>
								</TooltipContent>
							</Tooltip>
						))}
					</div>
				</TooltipProvider>
			</div>
		</div>
	);
}
