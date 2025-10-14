"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useDocumentsQuery } from "@saas/documents/lib/api";
import { File, FileText, Search, ArrowUpDown } from "lucide-react";
import { cn } from "@ui/lib";

interface SearchModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDocumentSelect: (document: any) => void;
	onSourceSelect?: (sourceId: string) => void;
}

interface SearchResult {
	id: string;
	title: string;
	type: "document" | "source";
	content?: string;
	preview?: string;
}

export function SearchModal({
	open,
	onOpenChange,
	onDocumentSelect,
	onSourceSelect,
}: SearchModalProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);

	// Fetch documents for search
	const { data: documentsData } = useDocumentsQuery(activeWorkspace?.id || "", {
		limit: 100,
		enabled: !!activeWorkspace?.id && open,
	});

	const documents = documentsData?.documents || [];

	// Helper function to safely extract text content
	const getTextContent = (content: any): string => {
		if (typeof content === 'string') {
			return content;
		}
		if (content && typeof content === 'object') {
			// Handle JSON content (like Tiptap document structure)
			return JSON.stringify(content);
		}
		return '';
	};

	// Filter results based on search query
	const searchResults: SearchResult[] = documents
		.filter((doc) => {
			const textContent = getTextContent(doc.content);
			return (
				doc.title.toLowerCase().includes(query.toLowerCase()) ||
				textContent.toLowerCase().includes(query.toLowerCase())
			);
		})
		.map((doc) => {
			return {
				id: doc.id,
				title: doc.title,
				type: "document" as const,
				content: getTextContent(doc.content),
				preview: "Document",
			};
		})
		.slice(0, 20); // Limit results

	// Reset selection when query changes
	useEffect(() => {
		setSelectedIndex(0);
	}, [query]);

	// Reset query when modal opens
	useEffect(() => {
		if (open) {
			setQuery("");
			setSelectedIndex(0);
		}
	}, [open]);

	// Handle keyboard navigation
	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setSelectedIndex((prev) => 
						prev < searchResults.length - 1 ? prev + 1 : prev
					);
					break;
				case "ArrowUp":
					e.preventDefault();
					setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
					break;
				case "Enter":
					e.preventDefault();
					if (searchResults[selectedIndex]) {
						handleResultSelect(searchResults[selectedIndex]);
					}
					break;
				case "Escape":
					e.preventDefault();
					onOpenChange(false);
					break;
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [open, searchResults, selectedIndex, onOpenChange]);

	const handleResultSelect = (result: SearchResult) => {
		if (result.type === "document") {
			// Find the full document object
			const fullDocument = documents.find((doc) => doc.id === result.id);
			if (fullDocument) {
				onDocumentSelect(fullDocument);
			}
		} else if (result.type === "source") {
			onSourceSelect?.(result.id);
		}
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[80vh] p-0">
				<DialogHeader className="p-4 pb-2">
					<DialogTitle className="flex items-center gap-2 text-base">
						<Search className="h-4 w-4" />
						Search through {activeWorkspace?.name || "workspace"}
					</DialogTitle>
				</DialogHeader>

				{/* Search Input */}
				<div className="px-4 pb-2">
					<Input
						placeholder="Search documents and sources..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full"
						autoFocus
					/>
				</div>

				{/* Results */}
				<div className="flex-1 overflow-y-auto max-h-96">
					{searchResults.length > 0 ? (
						<div className="p-2">
							{searchResults.map((result, index) => (
								<button
									key={result.id}
									onClick={() => handleResultSelect(result)}
									className={cn(
										"w-full text-left p-3 rounded-md flex items-start gap-3 hover:bg-accent transition-colors",
										index === selectedIndex && "bg-accent"
									)}
								>
									<div className="flex-shrink-0 mt-0.5">
										{result.type === "document" ? (
											<FileText className="h-4 w-4 text-blue-500" />
										) : (
											<File className="h-4 w-4 text-gray-500" />
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-sm truncate">
											{result.title}
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											{result.type === "document" ? "Document" : "Source"}
										</div>
									</div>
								</button>
							))}
						</div>
					) : query ? (
						<div className="p-8 text-center text-muted-foreground">
							<Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
							<div className="text-sm">No results found for "{query}"</div>
						</div>
					) : (
						<div className="p-8 text-center text-muted-foreground">
							<div className="flex items-center justify-center gap-2 text-xs mb-2">
								<ArrowUpDown className="h-3 w-3" />
								<span>Use ↑↓ to navigate</span>
								<span>•</span>
								<span>Enter to select</span>
								<span>•</span>
								<span>Esc to close</span>
							</div>
							<div className="text-sm">Start typing to search documents and sources</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}