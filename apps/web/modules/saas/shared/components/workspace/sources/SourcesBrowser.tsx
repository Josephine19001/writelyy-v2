"use client";

import { useSourcesQuery } from "@saas/lib/api";
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
import { File, FileImage, Image, Link, Search, Plus } from "lucide-react";
import { useState, useCallback, useMemo, memo } from "react";
import { AddSourceModal } from "./dialogs/AddSourceModal";
import { SourceContextMenu } from "./menus/SourceContextMenu";
import type { Source } from "./types";
import {
	formatFileSize,
	getSourceIcon,
	getSourceTypeLabel,
} from "./utils/sourceUtils";

interface SourcesBrowserProps {
	onSourceSelect?: (source: Source) => void;
	selectedSourceId?: string;
	mode?: "insertion" | "management"; // insertion = only images/links, management = all types
	onInsertSource?: (source: Source) => void; // Direct insertion callback
	onUseAsAIContext?: (source: Source) => void; // AI context callback
}

const ALL_SOURCE_TYPES = [
	{ key: "all", label: "All Files", icon: File },
	{ key: "image", label: "Images", icon: Image },
	{ key: "pdf", label: "PDFs", icon: FileImage },
	{ key: "doc", label: "Documents", icon: File },
	{ key: "url", label: "Links", icon: Link },
];

const INSERTION_SOURCE_TYPES = [
	{ key: "all", label: "All Files", icon: File },
	{ key: "image", label: "Images", icon: Image },
	{ key: "url", label: "Links", icon: Link },
];

export function SourcesBrowser({
	onSourceSelect,
	selectedSourceId,
	mode = "management",
	onInsertSource,
	onUseAsAIContext,
}: SourcesBrowserProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const { data: sourcesData, isLoading } = useSourcesQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id },
	);
	const sourceTypes =
		mode === "insertion" ? INSERTION_SOURCE_TYPES : ALL_SOURCE_TYPES;
	const [activeFilter, setActiveFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	const sources = sourcesData?.sources || [];

	// Filter sources with useMemo for performance
	const filteredSources = useMemo(() => {
		return sources.filter((source: Source) => {
			// In insertion mode, only show images and links
			if (mode === "insertion" && !["image", "url"].includes(source.type)) {
				return false;
			}

			const matchesFilter =
				activeFilter === "all" ||
				source.type === activeFilter ||
				(activeFilter === "doc" &&
					["doc", "docx"].includes(source.type as string));
			const matchesSearch = source.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			return matchesFilter && matchesSearch;
		});
	}, [sources, mode, activeFilter, searchQuery]);

	if (isLoading) {
		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="h-6 w-24 bg-muted/50 rounded animate-pulse" />
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0"
						disabled
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				<div className="text-xs text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (sources.length === 0) {
		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<Select value="all" disabled>
						<SelectTrigger className="h-6 text-xs bg-transparent border-0 p-1 flex-1 max-w-32">
							<SelectValue placeholder="All Files" />
						</SelectTrigger>
					</Select>
					<AddSourceModal />
				</div>
				<div className="text-center py-6">
					<FileImage className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
					<p className="text-xs text-muted-foreground">
						No sources yet
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2.5">
			{/* Header */}
			<div className="flex items-center justify-between gap-2">
				<Select value={activeFilter} onValueChange={setActiveFilter}>
					<SelectTrigger className="h-8 text-xs bg-background hover:bg-muted/30 border border-border/50 rounded-lg px-2.5 flex-1 max-w-32 transition-colors shadow-sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{sourceTypes.map((type) => (
							<SelectItem
								key={type.key}
								value={type.key}
								className="text-xs"
							>
								<div className="flex items-center gap-2">
									<type.icon className="h-3 w-3" />
									{type.label}
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<AddSourceModal />
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
				<Input
					placeholder="Search sources..."
					className="text-xs pl-8 h-9 bg-background hover:bg-muted/30 border border-border/50 rounded-lg transition-colors focus-visible:ring-1 shadow-sm"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{/* Sources List */}
			<div className="space-y-0.5 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pr-1">
				{filteredSources.map((source: Source) => (
					<SourceListItem
						key={source.id}
						source={source}
						selectedSourceId={selectedSourceId}
						onSourceSelect={onSourceSelect}
						onInsertSource={onInsertSource}
						onUseAsAIContext={onUseAsAIContext}
						mode={mode}
					/>
				))}
			</div>

			{filteredSources.length === 0 && (
				<div className="text-center py-6">
					<div className="text-xs text-muted-foreground">
						No sources found
					</div>
				</div>
			)}
		</div>
	);
}

const SourceListItem = memo(({
	source,
	selectedSourceId,
	onSourceSelect,
	onInsertSource,
	onUseAsAIContext,
	mode,
}: {
	source: Source;
	selectedSourceId?: string;
	onSourceSelect?: (source: Source) => void;
	onInsertSource?: (source: Source) => void;
	onUseAsAIContext?: (source: Source) => void;
	mode?: "insertion" | "management";
}) => {
	const isSelected = selectedSourceId === source.id;

	const handleClick = useCallback(() => {
		onSourceSelect?.(source);
	}, [onSourceSelect, source]);

	return (
		<div
			className={cn(
				"group flex items-center gap-2.5 p-2 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent cursor-pointer transition-all duration-300 hover:shadow-sm hover:shadow-primary/10 hover:translate-x-0.5",
				isSelected && "bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 shadow-sm shadow-primary/20",
			)}
			onClick={handleClick}
		>
			<div className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-md bg-muted/40">
				{getSourceIcon(source.type, "h-3.5 w-3.5 text-muted-foreground")}
			</div>

			<div className="flex-1 min-w-0">
				<div className="text-[11px] font-medium truncate text-foreground">
					{source.name}
				</div>
				<div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
					<span>{getSourceTypeLabel(source.type)}</span>
					{source.metadata?.size && (
						<>
							<span className="text-[8px]">•</span>
							<span>{formatFileSize(source.metadata.size)}</span>
						</>
					)}
				</div>
			</div>

			{/* Action Menu - Only show in management mode */}
			{mode !== "insertion" && (
				<div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
					<SourceContextMenu
						sourceId={source.id}
						source={source}
						onInsertSource={onInsertSource}
						onUseAsAIContext={onUseAsAIContext}
					/>
				</div>
			)}
		</div>
	);
});
