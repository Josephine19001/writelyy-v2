"use client";

import { useSnippetsQuery } from "@saas/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { cn } from "@ui/lib";
import { FileText, Search, Tag } from "lucide-react";
import { useState, useCallback, useMemo, memo } from "react";
import { AddSnippetModal } from "./dialogs/AddSnippetModal";
import { ViewSnippetModal } from "./dialogs/ViewSnippetModal";

interface Snippet {
	id: string;
	title: string;
	content: string;
	category?: string | null;
	tags: string[];
	createdAt: Date;
	creator: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

interface SnippetsBrowserProps {
	onSnippetSelect?: (snippet: Snippet) => void;
	selectedSnippetId?: string;
	onInsertSnippet?: (snippet: Snippet) => void;
	onUseAsAIContext?: (snippet: Snippet) => void;
}

export function SnippetsBrowser({
	onSnippetSelect,
	selectedSnippetId,
	onInsertSnippet,
	onUseAsAIContext,
}: SnippetsBrowserProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [viewingSnippet, setViewingSnippet] = useState<Snippet | null>(null);
	
	const { data: snippetsData, isLoading } = useSnippetsQuery(
		activeWorkspace?.id || "",
		{
			enabled: !!activeWorkspace?.id,
			search: searchQuery || undefined,
			category: selectedCategory === "all" ? undefined : selectedCategory,
		}
	);

	const snippets = snippetsData?.snippets || [];

	// Get unique categories for filtering
	const categories = useMemo(() => {
		const categorySet = new Set<string>();
		snippets.forEach((snippet: Snippet) => {
			if (snippet.category) {
				categorySet.add(snippet.category);
			}
		});
		return Array.from(categorySet).sort();
	}, [snippets]);

	const handleSnippetClick = useCallback(
		(snippet: Snippet) => {
			onSnippetSelect?.(snippet);
			setViewingSnippet(snippet);
		},
		[onSnippetSelect],
	);

	if (!activeWorkspace) {
		return (
			<div className="flex items-center justify-center h-32 text-muted-foreground">
				No workspace selected
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-2">
					<Select value="all" disabled>
						<SelectTrigger className="h-6 text-xs bg-transparent border-0 p-1 flex-1 max-w-32">
							<SelectValue placeholder="All Snippets" />
						</SelectTrigger>
					</Select>
					<AddSnippetModal />
				</div>
				<div className="text-xs text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (snippets.length === 0) {
		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-2">
					<Select value="all" disabled>
						<SelectTrigger className="h-6 text-xs bg-transparent border-0 p-1 flex-1 max-w-32">
							<SelectValue placeholder="All Snippets" />
						</SelectTrigger>
					</Select>
					<AddSnippetModal />
				</div>
				<div className="text-center py-6">
					<FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
					<p className="text-xs text-muted-foreground">
						No snippets yet
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{/* Header */}
			<div className="flex items-center justify-between gap-2">
				<Select value={selectedCategory} onValueChange={setSelectedCategory}>
					<SelectTrigger className="border rounded-md h-6 text-xs bg-transparent p-1 flex-1 max-w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all" className="text-xs">
							<div className="flex items-center gap-2">
								<FileText className="h-3 w-3" />
								All Snippets
							</div>
						</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category} value={category} className="text-xs">
								<div className="flex items-center gap-2">
									<Tag className="h-3 w-3" />
									{category}
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<AddSnippetModal />
			</div>

			{/* Search */}
			<div className="space-y-2">
				<div className="relative border rounded-md">
					<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
					<Input
						placeholder="Search..."
						className="text-xs pl-6 h-7 bg-muted/50 border-0"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Snippets List */}
			<div className="space-y-1 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
				{snippets.map((snippet: Snippet) => (
					<SnippetItem
						key={snippet.id}
						snippet={snippet}
						isSelected={selectedSnippetId === snippet.id}
						onClick={() => handleSnippetClick(snippet)}
					/>
				))}
			</div>

			{snippets.length === 0 && (
				<div className="text-center py-4">
					<div className="text-xs text-muted-foreground">
						No snippets found
					</div>
				</div>
			)}

			<ViewSnippetModal
				snippet={viewingSnippet}
				isOpen={!!viewingSnippet}
				onClose={() => setViewingSnippet(null)}
				onInsert={onInsertSnippet}
			/>
		</div>
	);
}

interface SnippetItemProps {
	snippet: Snippet;
	isSelected: boolean;
	onClick: () => void;
}

const SnippetItem = memo(({ snippet, isSelected, onClick }: SnippetItemProps) => {
	const handleClick = useCallback(() => {
		onClick();
	}, [onClick]);

	return (
		<div
			className={cn(
				"group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors",
				isSelected && "bg-accent",
			)}
			onClick={handleClick}
		>
			<div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
				<FileText className="h-4 w-4 text-muted-foreground" />
			</div>

			<div className="flex-1 min-w-0">
				<div className="text-xs font-medium truncate">
					{snippet.title}
				</div>
				{snippet.category && (
					<div className="text-xs text-muted-foreground flex items-center gap-1">
						<span>{snippet.category}</span>
					</div>
				)}
			</div>
		</div>
	);
});