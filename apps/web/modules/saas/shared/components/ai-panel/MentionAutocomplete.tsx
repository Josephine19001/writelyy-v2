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

	// Group items by type and category for better organization
	const groupedItems = React.useMemo(() => {
		const groups: GroupedMentions = {};
		
		filteredItems.forEach((item) => {
			let groupKey = "";
			
			if (item.type === "document") {
				// Group documents by folder
				const folderName = (item as any).folderName || "Documents";
				groupKey = folderName === "Documents" ? "Documents" : truncateName(folderName, 20);
			} else if (item.type === "folder") {
				groupKey = "Folders";
			} else if (item.type === "source") {
				// Group sources by type
				const sourceType = item.subtype || "file";
				groupKey = `${sourceType.charAt(0).toUpperCase() + sourceType.slice(1)}s`;
			} else {
				groupKey = "Other";
			}
			
			if (!groups[groupKey]) {
				groups[groupKey] = [];
			}
			groups[groupKey].push(item);
		});
		
		return groups;
	}, [filteredItems]);

	const getGroupIcon = (groupKey: string) => {
		if (groupKey === "Folders") {
			return <FolderOpen className="w-3 h-3" />;
		}
		if (groupKey === "Documents") {
			return <File className="w-3 h-3" />;
		}
		if (groupKey === "Pdfs") {
			return <FileText className="w-3 h-3" />;
		}
		if (groupKey === "Images") {
			return <Image className="w-3 h-3" />;
		}
		if (groupKey === "Links") {
			return <Link className="w-3 h-3" />;
		}
		if (groupKey === "Files") {
			return <File className="w-3 h-3" />;
		}
		if (groupKey !== "Documents" && groupKey !== "Folders" && !["Pdfs", "Images", "Links", "Files"].includes(groupKey)) {
			// This is a folder name
			return <Folder className="w-3 h-3" />;
		}
		return <File className="w-3 h-3" />;
	};

	const getItemIcon = (item: MentionItem) => {
		switch (item.type) {
			case "document":
				return <File className="w-4 h-4 text-blue-600" />;
			case "folder":
				return <Folder className="w-4 h-4 text-yellow-600" />;
			case "source":
				if (item.subtype === "image")
					return <Image className="w-4 h-4 text-green-600" />;
				if (item.subtype === "pdf")
					return <FileText className="w-4 h-4 text-red-600" />;
				if (item.subtype === "link")
					return <Link className="w-4 h-4 text-blue-600" />;
				return <File className="w-4 h-4 text-gray-600" />;
			case "asset":
				return <Image className="w-4 h-4 text-purple-600" />;
			default:
				return <File className="w-4 h-4 text-gray-600" />;
		}
	};

	const getItemTypeLabel = (item: MentionItem) => {
		if (item.type === "source" && item.subtype) {
			return `${item.type} (${item.subtype})`;
		}
		return item.type;
	};

	// Check if we have any items to show
	const hasItems = Object.keys(groupedItems).length > 0;
	
	// Always show some options when autocomplete is open
	if (!hasItems && query.length > 0) {
		return (
			<div
				className="fixed z-[9999] w-80 max-h-64 bg-background border border-border rounded-md shadow-xl overflow-hidden"
				style={{
					top: position.top,
					left: position.left,
				}}
			>
				<div className="p-4 text-center text-sm text-muted-foreground">
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
			className="fixed z-[9999] w-80 max-h-64 bg-background border border-border rounded-md shadow-xl flex flex-col overflow-hidden"
			style={{
				top: position.top,
				left: position.left,
			}}
		>
			<div className="p-2 border-b bg-muted flex-shrink-0">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">
						Select context for your question
					</span>
					<Button
						variant="ghost"
						size="sm"
						className="h-4 w-4 p-0"
						onClick={onClose}
					>
						<X className="h-3 w-3" />
					</Button>
				</div>
			</div>
			<div className="flex-1 overflow-y-auto">
				<div className="p-1">
					{Object.entries(groupedItems).map(([groupKey, items]) => (
						<div key={groupKey} className="mb-2">
							{/* Group Header */}
							<div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50 rounded flex items-center gap-2">
								{getGroupIcon(groupKey)}
								{groupKey}
							</div>
							{/* Group Items */}
							{items.map((item) => (
								<Button
									key={item.id}
									variant="ghost"
									className="w-full justify-start h-auto p-2 text-left ml-2"
									onClick={() => onSelect(item)}
									title={`${item.type}: ${item.name}${item.url ? ` (${item.url})` : ""}`}
								>
									<div className="flex items-center gap-3 w-full">
										{getItemIcon(item)}
										<div className="flex-1 min-w-0">
											<div className="font-medium text-sm" title={item.name}>
												{truncateName(item.name)}
											</div>
											<div className="text-xs text-muted-foreground">
												{getItemTypeLabel(item)}
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