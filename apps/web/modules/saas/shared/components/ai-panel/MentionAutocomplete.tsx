"use client";

import { Button } from "@ui/components/button";
import {
	File,
	FileText,
	Folder,
	FolderOpen,
	Image,
	Link,
	X,
} from "lucide-react";
import React from "react";

import type { GroupedMentions, MentionAutocompleteProps, MentionItem } from "./types";

export function MentionAutocomplete({
	query,
	onSelect,
	onClose,
	position,
	mentionItems = [],
}: MentionAutocompleteProps) {
	// Utility function to truncate names
	const truncateName = (name: string, maxLength = 25) => {
		if (name.length <= maxLength) return name;
		return `${name.substring(0, maxLength - 3)}...`;
	};

	// Show all items if query is empty, otherwise filter
	const filteredItems =
		query.length === 0
			? mentionItems
			: mentionItems.filter((item) =>
					item.name.toLowerCase().includes(query.toLowerCase()),
				);

	// Simplified grouping for sources only
	const groupedItems = React.useMemo(() => {
		const groups: GroupedMentions = {};
		
		filteredItems.forEach((item) => {
			if (item.type === "source") {
				const groupKey = "Sources";
				if (!groups[groupKey]) {
					groups[groupKey] = [];
				}
				groups[groupKey].push(item);
			}
		});
		
		return groups;
	}, [filteredItems]);

	const getGroupIcon = (groupKey: string) => {
		if (groupKey === "Sources") {
			return <Link className="w-3 h-3" />;
		}
		return <File className="w-3 h-3" />;
	};

	const getItemIcon = (item: MentionItem) => {
		switch (item.type) {
			case "source":
				if (item.subtype === "image")
					return <Image className="w-3.5 h-3.5 text-green-600" />;
				if (item.subtype === "pdf")
					return <FileText className="w-3.5 h-3.5 text-red-600" />;
				if (item.subtype === "link")
					return <Link className="w-3.5 h-3.5 text-blue-600" />;
				return <File className="w-3.5 h-3.5 text-gray-600" />;
			default:
				return <File className="w-3.5 h-3.5 text-gray-600" />;
		}
	};


	// Check if we have any items to show
	const hasItems = Object.keys(groupedItems).length > 0;
	
	// Always show some options when autocomplete is open
	if (!hasItems && query.length > 0) {
		return (
			<div
				className="fixed z-[9999] w-64 max-h-48 bg-background border border-border rounded-md shadow-xl overflow-hidden"
				style={{
					top: position.top,
					left: position.left,
				}}
			>
				<div className="p-4 text-center text-xs text-muted-foreground">
					No matches found for "{query}"
				</div>
			</div>
		);
	}

	if (!hasItems) {
		return null;
	}

	return (
		<div
			className="fixed z-[9999] w-64 max-h-48 bg-background border border-border rounded-md shadow-xl flex flex-col overflow-hidden"
			style={{
				top: position.top,
				left: position.left,
			}}
		>
			<div className="p-3 border-b bg-muted/50 flex-shrink-0">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">
						Add sources to your question
					</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-5 w-5 p-0 hover:bg-muted-foreground/20"
						onClick={onClose}
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="p-1">
					{Object.entries(groupedItems).map(([groupKey, items]) => (
						<div key={groupKey} className="mb-1">
							{/* Group Header */}
							<div className="px-3 py-1 text-xs font-medium text-muted-foreground/80 bg-muted/30 rounded-sm flex items-center gap-2 mb-1">
								{getGroupIcon(groupKey)}
								{groupKey}
							</div>
							{/* Group Items */}
							{items.map((item) => (
								<Button
									key={item.id}
									variant="ghost"
									className="w-full justify-start h-auto px-3 py-1.5 text-left hover:bg-muted/50 rounded-sm"
									onClick={() => onSelect(item)}
									title={`${item.type}: ${item.name}${item.url ? ` (${item.url})` : ""}`}
								>
									<div className="flex items-center gap-2 w-full">
										{getItemIcon(item)}
										<div className="flex-1 min-w-0">
											<div className="font-medium text-[11px] truncate" title={item.name}>
												{item.name}
											</div>
										</div>
									</div>
								</Button>
							))}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}