"use client";

import { useFixPendingSourcesMutation, useSourcesQuery } from "@saas/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { cn } from "@ui/lib";
import { File, FileImage, Grid, Image, Link, List, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ScrollableTabs } from "./components/ScrollableTabs";
import { SourcePreview } from "./components/SourcePreview";
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
	{ key: "image", label: "Images", icon: Image },
	{ key: "pdf", label: "PDFs", icon: FileImage },
	{ key: "doc", label: "Docs", icon: File },
	{ key: "url", label: "Links", icon: Link },
];

const INSERTION_SOURCE_TYPES = [
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
	const [activeFilter, setActiveFilter] = useState(sourceTypes[0].key);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<AddSourceModal />
					<div className="flex items-center space-x-2">
						<Button variant="ghost" size="sm">
							<Grid className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="sm">
							<List className="h-4 w-4" />
						</Button>
					</div>
				</div>
				<div className="text-sm text-muted-foreground">
					Loading sources...
				</div>
			</div>
		);
	}

	if (sources.length === 0) {
		return (
			<div className="space-y-4">
				<AddSourceModal />
				<div className="text-center py-8">
					<FileImage className="h-12 w-12 mx-auto text-gray-400 mb-4" />
					<h3 className="text-sm font-medium text-gray-900 mb-1">
						No sources yet
					</h3>
					<p className="text-sm text-gray-500">
						Add images, PDFs, documents, or links to reference in
						your documents
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<AddSourceModal />
				<div className="flex items-center space-x-2">
					{hasPendingSources && (
						<Button
							variant="outline"
							size="sm"
							onClick={handleFixPendingSources}
							disabled={fixPendingSourcesMutation.isPending}
						>
							Fix Pending
						</Button>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setViewMode("grid")}
						className={cn(viewMode === "grid" && "bg-gray-100")}
					>
						<Grid className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setViewMode("list")}
						className={cn(viewMode === "list" && "bg-gray-100")}
					>
						<List className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Search */}
			<div className="relative">
				<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
				<Input
					placeholder="Search sources..."
					className="text-sm pl-6 h-8"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{/* Filter Tabs */}
			<ScrollableTabs
				tabs={sourceTypes}
				activeTab={activeFilter}
				onTabChange={setActiveFilter}
				maxVisibleTabs={3}
			/>

			{/* Content */}
			<div className="mt-4">
				{viewMode === "grid" ? (
					<div className="grid grid-cols-2 gap-3">
						{filteredSources.map((source: Source) => (
							<SourceCard
								key={source.id}
								source={source}
								selectedSourceId={selectedSourceId}
								onSourceSelect={onSourceSelect}
							/>
						))}
					</div>
				) : (
					<div className="space-y-2">
						{filteredSources.map((source: Source) => (
							<SourceListItem
								key={source.id}
								source={source}
								selectedSourceId={selectedSourceId}
								onSourceSelect={onSourceSelect}
							/>
						))}
					</div>
				)}
			</div>

			{filteredSources.length === 0 && (
				<div className="text-center py-8">
					<div className="text-sm text-gray-500">
						No sources found matching your criteria
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

				{/* Context Menu */}
				<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
					<SourceContextMenu sourceId={source.id} />
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
}: {
	source: Source;
	selectedSourceId?: string;
	onSourceSelect?: (sourceId: string) => void;
}) => {
	const processingStatus = getProcessingStatus(source.processingStatus);
	const isSelected = selectedSourceId === source.id;

	return (
		<div
			className={cn(
				"group flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer",
				isSelected && "bg-primary/5 border-primary",
			)}
			onClick={() => onSourceSelect?.(source.id)}
		>
			<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
				{getSourceIcon(source.type)}
			</div>

			<div className="flex-1 min-w-0">
				<div className="font-medium truncate">{source.name}</div>
				<div className="text-sm text-gray-500 flex items-center space-x-2">
					<span>{getSourceTypeLabel(source.type)}</span>
					{source.metadata?.size && (
						<>
							<span>•</span>
							<span>{formatFileSize(source.metadata.size)}</span>
						</>
					)}
				</div>
				{processingStatus && (
					<div className="text-xs text-amber-600 mt-1 flex items-center">
						<div className="w-1 h-1 bg-amber-600 rounded-full mr-1 animate-pulse" />
						{processingStatus}
					</div>
				)}
			</div>

			<SourceContextMenu sourceId={source.id} />
		</div>
	);
};
