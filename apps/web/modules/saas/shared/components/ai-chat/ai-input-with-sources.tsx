"use client";

import {
	useSourcesQuery,
} from "@saas/lib/api";
import { useSnippetsQuery } from "@saas/snippets/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { IconButton } from "@ui/components/icon-button";
import { Button } from "@ui/components/button";
import { ArrowUp, Plus, Link, Image, FileText, File } from "lucide-react";
import * as React from "react";

import type { MentionItem } from "../ai-panel/types";

export interface AIInputWithSourcesProps {
	placeholder?: string;
	onSendMessage: (message: string, mentions?: MentionItem[]) => void;
	onCancel?: () => void;
	disabled?: boolean;
	className?: string;
	minRows?: number;
	maxRows?: number;
	autoFocus?: boolean;
}

export function AIInputWithSources({
	placeholder = "Ask what you want...",
	onSendMessage,
	onCancel,
	disabled = false,
	className = "",
	minRows = 1,
	maxRows = 4,
	autoFocus = false,
}: AIInputWithSourcesProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const [inputValue, setInputValue] = React.useState("");
	const [selectedMentions, setSelectedMentions] = React.useState<
		MentionItem[]
	>([]);
	const [showDropdown, setShowDropdown] = React.useState(false);
	const inputRef = React.useRef<HTMLTextAreaElement>(null);
	const dropdownRef = React.useRef<HTMLDivElement>(null);

	// Fetch workspace data for mentions
	const sourcesQuery = useSourcesQuery(activeWorkspace?.id || "", {
		enabled: !!activeWorkspace?.id,
		limit: 100,
	});

	const snippetsQuery = useSnippetsQuery(activeWorkspace?.id || "", {
		enabled: !!activeWorkspace?.id,
	});

	// Transform real data into grouped mention items
	const groupedMentionItems = React.useMemo(() => {
		const sources: MentionItem[] = [];
		const snippets: MentionItem[] = [];

		// Add sources
		if (sourcesQuery.data?.sources) {
			sourcesQuery.data.sources.forEach((source: any) => {
				sources.push({
					id: `source-${source.id}`,
					name: source.name,
					type: "source",
					originalName: source.name,
					subtype: source.type as "image" | "pdf" | "link",
					url: source.url,
				} as MentionItem & { originalName?: string });
			});
		}

		// Add snippets
		if (snippetsQuery.data?.snippets) {
			snippetsQuery.data.snippets.forEach((snippet: any) => {
				snippets.push({
					id: `snippet-${snippet.id}`,
					name: snippet.title,
					type: "asset",
					originalName: snippet.title,
					content: snippet.content,
					category: snippet.category,
				} as MentionItem & { originalName?: string; content?: string; category?: string });
			});
		}

		return { sources, snippets };
	}, [sourcesQuery.data, snippetsQuery.data]);

	// Close dropdown when clicking outside
	React.useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		if (showDropdown) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showDropdown]);

	const getItemIcon = (item: MentionItem) => {
		if (item.type === "asset" && 'category' in item) {
			return <FileText className="w-3.5 h-3.5 text-purple-600" />;
		}
		
		// Source icons
		if (item.subtype === "image") {
			return <Image className="w-3.5 h-3.5 text-green-600" />;
		}
		if (item.subtype === "pdf") {
			return <FileText className="w-3.5 h-3.5 text-red-600" />;
		}
		if (item.subtype === "link") {
			return <Link className="w-3.5 h-3.5 text-blue-600" />;
		}
		return <File className="w-3.5 h-3.5 text-gray-600" />;
	};

	const resizeTextarea = (textarea: HTMLTextAreaElement) => {
		textarea.style.height = "auto";
		const scrollHeight = textarea.scrollHeight;
		const maxHeight = maxRows * 24; // Approximate line height
		const minHeight = minRows * 24;

		const newHeight = Math.max(
			minHeight,
			Math.min(scrollHeight, maxHeight),
		);
		textarea.style.height = `${newHeight}px`;
		textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setInputValue(value);
		resizeTextarea(e.target);
	};

	const handleMentionSelect = (item: MentionItem) => {
		// Add mention to the end of the input
		setInputValue(
			(prev) => prev + (prev ? " " : "") + `@${item.name} `,
		);
		setSelectedMentions((prev) => [...prev, item]);
		
		// Close dropdown and focus input
		setShowDropdown(false);
		setTimeout(() => {
			inputRef.current?.focus();
		}, 0);
	};

	const handleSendMessage = () => {
		if (!inputValue.trim() || disabled) return;

		onSendMessage(
			inputValue,
			selectedMentions.length > 0 ? selectedMentions : undefined,
		);
		setInputValue("");
		setSelectedMentions([]);

		if (inputRef.current) {
			resizeTextarea(inputRef.current);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		} else if (e.key === "Escape") {
			e.preventDefault();
			onCancel?.();
		}
	};

	// Auto-focus on mount if requested
	React.useEffect(() => {
		if (autoFocus && inputRef.current) {
			// Small delay to ensure the component is rendered
			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	}, [autoFocus]);

	return (
		<div className={`relative ${className}`}>
			<div className="border border-input rounded-md bg-background">
				<textarea
					ref={inputRef}
					placeholder={placeholder}
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					rows={minRows}
					disabled={disabled}
					className="w-full bg-transparent text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none border-0 p-3 pb-2"
					style={{
						height: "auto",
						minHeight: `${minRows * 1.5}rem`,
					}}
				/>
				<div className="flex items-center justify-between px-3 pb-2">
					<div className="relative" ref={dropdownRef}>
						<IconButton
							variant="ghost"
							size="xs"
							icon={<Plus />}
							onClick={() => setShowDropdown(!showDropdown)}
							disabled={disabled}
							title="Add sources and snippets to your question"
						/>
						
						{showDropdown && (
							<div className="absolute bottom-full left-0 mb-2 w-64 max-h-48 bg-background border border-border rounded-md shadow-xl z-50">
								{(groupedMentionItems.sources.length > 0 || groupedMentionItems.snippets.length > 0) ? (
									<div className="max-h-48 overflow-y-auto">
										{/* Sources Section */}
										{groupedMentionItems.sources.length > 0 && (
											<>
												<div className="px-2 py-0.5 text-xs text-muted-foreground">
													Sources
												</div>
												<div className="px-1">
													{groupedMentionItems.sources.map((item) => (
														<Button
															key={item.id}
															variant="ghost"
															onClick={() => handleMentionSelect(item)}
															className="w-full justify-start h-auto px-2 py-1.5 text-left hover:bg-muted/50 rounded-sm"
														>
															<div className="flex items-center gap-2 w-full">
																{getItemIcon(item)}
																<span className="text-xs truncate" title={item.name}>
																	{item.name}
																</span>
															</div>
														</Button>
													))}
												</div>
											</>
										)}

										{/* Snippets Section */}
										{groupedMentionItems.snippets.length > 0 && (
											<>
												<div className="px-2 py-0.5 text-xs text-muted-foreground">
													Snippets
												</div>
												<div className="px-1">
													{groupedMentionItems.snippets.map((item) => (
														<Button
															key={item.id}
															variant="ghost"
															onClick={() => handleMentionSelect(item)}
															className="w-full justify-start h-auto px-2 py-1.5 text-left hover:bg-muted/50 rounded-sm"
														>
															<div className="flex items-center gap-2 w-full">
																{getItemIcon(item)}
																<div className="flex flex-col items-start flex-1 min-w-0">
																	<span className="text-xs font-medium truncate w-full" title={item.name}>
																		{item.name}
																	</span>
																	{(item as any).category && (
																		<span className="text-xs text-muted-foreground truncate w-full">
																			{(item as any).category}
																		</span>
																	)}
																</div>
															</div>
														</Button>
													))}
												</div>
											</>
										)}
									</div>
								) : (
									<div className="p-3 text-xs text-muted-foreground text-center">
										No sources or snippets available
									</div>
								)}
							</div>
						)}
					</div>
					<IconButton
						variant="primary"
						size="xs"
						icon={<ArrowUp />}
						onClick={handleSendMessage}
						disabled={disabled || !inputValue.trim()}
					/>
				</div>
			</div>
		</div>
	);
}
