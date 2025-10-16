"use client";

import { useSnippetsQuery } from "@saas/lib/api";
import { AddSnippetModal } from "@saas/shared/components/workspace/snippets/dialogs/AddSnippetModal";
import { ViewSnippetModal } from "@saas/shared/components/workspace/snippets/dialogs/ViewSnippetModal";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { Input } from "@ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { cn } from "@ui/lib";
import { FileText, Search, Tag } from "lucide-react";
import * as React from "react";

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

interface SnippetsPopoverProps {
	children: React.ReactNode;
	onSnippetSelect?: (snippet: Snippet) => void;
	onInsertSnippet?: (snippet: Snippet) => void;
}

export function SnippetsPopover({
	children,
	onSnippetSelect,
	onInsertSnippet,
}: SnippetsPopoverProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const [searchQuery, setSearchQuery] = React.useState("");
	const [selectedCategory, setSelectedCategory] =
		React.useState<string>("all");
	const [viewingSnippet, setViewingSnippet] = React.useState<Snippet | null>(
		null,
	);

	const { data: snippetsData, isLoading } = useSnippetsQuery(
		activeWorkspace?.id || "",
		{
			enabled: !!activeWorkspace?.id,
			search: searchQuery || undefined,
			category: selectedCategory === "all" ? undefined : selectedCategory,
		},
	);

	const snippets = snippetsData?.snippets || [];

	// Get unique categories for filtering
	const categories = React.useMemo(() => {
		const categorySet = new Set<string>();
		snippets.forEach((snippet: Snippet) => {
			if (snippet.category) {
				categorySet.add(snippet.category);
			}
		});
		return Array.from(categorySet).sort();
	}, [snippets]);

	const handleSnippetClick = React.useCallback(
		(snippet: Snippet) => {
			onSnippetSelect?.(snippet);
			setViewingSnippet(snippet);
		},
		[onSnippetSelect],
	);

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>{children}</PopoverTrigger>
				<PopoverContent
					className="w-[400px] p-4 max-h-[500px] overflow-auto"
					side="left"
					align="center"
					sideOffset={10}
				>
					<div className="space-y-3">
						{/* Header */}
						<div className="flex items-center justify-between pb-2 border-b">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4" />
								<h3 className="font-semibold text-sm">
									Snippets
								</h3>
							</div>
							<AddSnippetModal />
						</div>

						{isLoading ? (
							<div className="text-center py-8 text-muted-foreground">
								<p className="text-xs">Loading snippets...</p>
							</div>
						) : snippets.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								<FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
								<p className="text-xs">No snippets yet</p>
								<p className="text-[10px] mt-1">
									Click "Add snippet" to get started
								</p>
							</div>
						) : (
							<>
								{/* Filter and Search on same line */}
								<div className="flex items-center gap-2">
									<Select
										value={selectedCategory}
										onValueChange={setSelectedCategory}
									>
										<SelectTrigger className="h-8 text-xs bg-background hover:bg-muted/30 border border-border/50 rounded-lg px-2.5 w-32 transition-colors shadow-sm">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem
												value="all"
												className="text-xs"
											>
												<div className="flex items-center gap-2">
													<FileText className="h-3 w-3" />
													All Snippets
												</div>
											</SelectItem>
											{categories.map((category) => (
												<SelectItem
													key={category}
													value={category}
													className="text-xs"
												>
													<div className="flex items-center gap-2">
														<Tag className="h-3 w-3" />
														{category}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									<div className="relative flex-1">
										<Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
										<Input
											placeholder="Search..."
											className="text-xs pl-8 h-8 bg-background hover:bg-muted/30 border border-border/50 rounded-lg transition-colors focus-visible:ring-1 shadow-sm"
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
										/>
									</div>
								</div>

								{/* Snippets List */}
								{snippets.length === 0 ? (
									<div className="text-center py-6">
										<div className="text-xs text-muted-foreground">
											No snippets found
										</div>
									</div>
								) : (
									<div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pr-1">
										{snippets.map((snippet: Snippet) => (
											<button
												type="button"
												key={snippet.id}
												className={cn(
													"group flex items-center gap-2.5 p-2 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent cursor-pointer transition-all duration-300 hover:shadow-sm hover:shadow-primary/10 hover:translate-x-0.5 w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
												)}
												onClick={() =>
													handleSnippetClick(snippet)
												}
												onKeyDown={(e) => {
													if (
														e.key === "Enter" ||
														e.key === " "
													) {
														e.preventDefault();
														handleSnippetClick(
															snippet,
														);
													}
												}}
											>
												<div className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-md bg-muted/40">
													<FileText className="h-3.5 w-3.5 text-muted-foreground" />
												</div>

												<div className="flex-1 min-w-0">
													<div className="text-[11px] font-medium truncate text-foreground">
														{snippet.title}
													</div>
													{snippet.category && (
														<div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
															<span>
																{
																	snippet.category
																}
															</span>
														</div>
													)}
												</div>
											</button>
										))}
									</div>
								)}
							</>
						)}
					</div>
				</PopoverContent>
			</Popover>

			{/* View Snippet Modal */}
			<ViewSnippetModal
				snippet={viewingSnippet}
				isOpen={!!viewingSnippet}
				onClose={() => setViewingSnippet(null)}
				onInsert={onInsertSnippet}
			/>
		</>
	);
}
