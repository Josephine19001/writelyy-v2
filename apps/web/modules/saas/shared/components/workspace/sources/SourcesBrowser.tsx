"use client";

import { useFixPendingSourcesMutation, useSourcesQuery } from "@saas/lib/api";
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
import { File, FileImage, Image, Link, Search, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddSourceModal } from "./dialogs/AddSourceModal";
import { SourceContextMenu } from "./menus/SourceContextMenu";
import type { Source } from "./types";
import {
	formatFileSize,
	getProcessingStatus,
	getSourceIcon,
	getSourceTypeLabel,
} from "./utils/sourceUtils";

interface SourcesBrowserProps {
	onSourceSelect?: (sourceId: string) => void;
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
	const fixPendingSourcesMutation = useFixPendingSourcesMutation();

	const sourceTypes =
		mode === "insertion" ? INSERTION_SOURCE_TYPES : ALL_SOURCE_TYPES;
	const [activeFilter, setActiveFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	const sources = sourcesData?.sources || [];
	const hasPendingSources = sources.some(
		(source: Source) => source.processingStatus === "pending",
	);

	// Filter sources
	const filteredSources = sources.filter((source: Source) => {
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

	const handleFixPendingSources = async () => {
		if (!activeWorkspace?.id) return;

		try {
			const result = await fixPendingSourcesMutation.mutateAsync({
				organizationId: activeWorkspace.id,
			});
			toast.success(`Fixed ${result.updatedCount} pending sources`);
		} catch {
			toast.error("Failed to fix pending sources");
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="h-6 w-24 bg-muted/50 rounded animate-pulse"></div>
					<Button variant="ghost" size="sm" className="h-6 w-6 p-0" disabled>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				<div className="text-xs text-muted-foreground">
					Loading...
				</div>
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
		<div className="space-y-3">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Select value={activeFilter} onValueChange={setActiveFilter}>
					<SelectTrigger className="h-6 text-xs bg-transparent border-0 p-1 flex-1 max-w-32">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{sourceTypes.map((type) => (
							<SelectItem key={type.key} value={type.key} className="text-xs">
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
			<div className="space-y-2">
				<div className="relative">
					<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
					<Input
						placeholder="Search..."
						className="text-xs pl-6 h-7 bg-muted/50 border-0"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{hasPendingSources && (
					<Button
						variant="outline"
						size="sm"
						onClick={handleFixPendingSources}
						disabled={fixPendingSourcesMutation.isPending}
						className="h-7 text-xs w-full"
					>
						Fix Pending Sources
					</Button>
				)}
			</div>

			{/* Sources List */}
			<div className="space-y-1">
				{filteredSources.map((source: Source) => (
					<SourceListItem
						key={source.id}
						source={source}
						selectedSourceId={selectedSourceId}
						onSourceSelect={onSourceSelect}
						onInsertSource={onInsertSource}
						onUseAsAIContext={onUseAsAIContext}
					/>
				))}
			</div>

			{filteredSources.length === 0 && (
				<div className="text-center py-4">
					<div className="text-xs text-muted-foreground">
						No sources found
					</div>
				</div>
			)}
		</div>
	);
}

const SourceCard = ({
	source,
	selectedSourceId,
	onSourceSelect,
	onInsertSource,
	onUseAsAIContext,
}: {
	source: Source;
	selectedSourceId?: string;
	onSourceSelect?: (sourceId: string) => void;
	onInsertSource?: (source: Source) => void;
	onUseAsAIContext?: (source: Source) => void;
}) => {
	const processingStatus = getProcessingStatus(source.processingStatus);
	const isSelected = selectedSourceId === source.id;
	
	// Determine if source is insertable (images, links) or needs AI context (PDFs, docs)
	const isInsertable = ['image', 'url'].includes(source.type);

	const handleActionClick = (e: React.MouseEvent, action: 'insert' | 'ai') => {
		e.stopPropagation(); // Prevent card selection
		if (action === 'insert' && onInsertSource) {
			onInsertSource(source);
		} else if (action === 'ai' && onUseAsAIContext) {
			onUseAsAIContext(source);
		}
	};

	return (
		<div
			className={cn(
				"group relative bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer",
				isSelected && "ring-2 ring-primary shadow-md",
			)}
			onClick={() => onSourceSelect?.(source.id)}
		>
			{/* Preview Area */}
			<div className="relative">
				<SourcePreview source={source} />

				{/* Processing Overlay */}
				{processingStatus && (
					<div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
						<div className="text-white text-xs flex items-center">
							<div className="w-1 h-1 bg-white rounded-full mr-1 animate-pulse" />
							{processingStatus}
						</div>
					</div>
				)}

				{/* Action Buttons - Always visible for MVP */}
				<div className="absolute top-2 right-2 flex gap-1">
					<SourceContextMenu 
						sourceId={source.id} 
						source={source}
						onInsertSource={onInsertSource}
						onUseAsAIContext={onUseAsAIContext}
					/>
				</div>
			</div>

			{/* Info Area */}
			<div className="p-2">
				<div className="text-sm font-medium truncate">
					{source.name}
				</div>
				<div className="text-xs text-gray-500 mt-1">
					<span>{getSourceTypeLabel(source.type)}</span>
				</div>
			</div>
		</div>
	);
};

const SourceListItem = ({
	source,
	selectedSourceId,
	onSourceSelect,
	onInsertSource,
	onUseAsAIContext,
}: {
	source: Source;
	selectedSourceId?: string;
	onSourceSelect?: (sourceId: string) => void;
	onInsertSource?: (source: Source) => void;
	onUseAsAIContext?: (source: Source) => void;
}) => {
	const processingStatus = getProcessingStatus(source.processingStatus);
	const isSelected = selectedSourceId === source.id;

	return (
		<div
			className={cn(
				"group flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors",
				isSelected && "bg-accent",
			)}
			onClick={() => onSourceSelect?.(source.id)}
		>
			<div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
				{getSourceIcon(source.type, "h-4 w-4 text-muted-foreground")}
			</div>

			<div className="flex-1 min-w-0">
				<div className="text-xs font-medium truncate">{source.name}</div>
				<div className="text-xs text-muted-foreground flex items-center gap-1">
					<span>{getSourceTypeLabel(source.type)}</span>
					{source.metadata?.size && (
						<>
							<span>•</span>
							<span>{formatFileSize(source.metadata.size)}</span>
						</>
					)}
					{processingStatus && (
						<>
							<span>•</span>
							<span className="text-amber-600">{processingStatus}</span>
						</>
					)}
				</div>
			</div>

			{/* Action Menu */}
			<div className="flex-shrink-0">
				<SourceContextMenu 
					sourceId={source.id} 
					source={source}
					onInsertSource={onInsertSource}
					onUseAsAIContext={onUseAsAIContext}
				/>
			</div>
		</div>
	);
};
