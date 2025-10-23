"use client";

import { useSourcesQuery } from "@saas/lib/api";
import { AddSourceModal } from "@saas/shared/components/workspace/sources/dialogs/AddSourceModal";
import { SourceContextMenu } from "@saas/shared/components/workspace/sources/menus/SourceContextMenu";
import type { Source } from "@saas/shared/components/workspace/sources/types";
import {
	formatFileSize,
	getSourceIcon,
	getSourceTypeLabel,
} from "@saas/shared/components/workspace/sources/utils/sourceUtils";
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
import {
	File,
	FileImage,
	Image as ImageIcon,
	Link as LinkIcon,
	Search,
} from "lucide-react";
import * as React from "react";

interface SourcesPopoverProps {
	children: React.ReactNode;
	onSourceSelect?: (source: Source) => void;
	onInsertSource?: (source: Source) => void;
	onUseAsAIContext?: (source: Source) => void;
}

const ALL_SOURCE_TYPES = [
	{ key: "all", label: "All Files", icon: File },
	{ key: "image", label: "Images", icon: ImageIcon },
	{ key: "pdf", label: "PDFs", icon: FileImage },
	{ key: "doc", label: "Documents", icon: File },
	{ key: "url", label: "Links", icon: LinkIcon },
];

export function SourcesPopover({
	children,
	onSourceSelect,
	onInsertSource,
	onUseAsAIContext,
}: SourcesPopoverProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const [isOpen, setIsOpen] = React.useState(false);
	const { data: sourcesData, isLoading, refetch } = useSourcesQuery(
		activeWorkspace?.id || "",
		{
			enabled: !!activeWorkspace?.id,
		},
	);
	const [activeFilter, setActiveFilter] = React.useState("all");
	const [searchQuery, setSearchQuery] = React.useState("");

	// Refetch sources when popover opens
	React.useEffect(() => {
		if (isOpen && activeWorkspace?.id) {
			refetch();
		}
	}, [isOpen, activeWorkspace?.id, refetch]);

	const sources = sourcesData?.sources || [];

	// Filter sources
	const filteredSources = React.useMemo(() => {
		return sources.filter((source: Source) => {
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
	}, [sources, activeFilter, searchQuery]);

	// Helper function to get proper image URL
	const getImageUrl = (source: Source) => {
		if (source.type === "image" && source.filePath) {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			const bucketName =
				process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME || "image-sources";
			return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${source.filePath}`;
		}
		return source.url || null;
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
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
							<ImageIcon className="h-4 w-4" />
							<h3 className="font-semibold text-sm">Sources</h3>
						</div>
						<AddSourceModal />
					</div>

					{isLoading ? (
						<div className="text-center py-8 text-muted-foreground">
							<p className="text-xs">Loading sources...</p>
						</div>
					) : sources.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
							<p className="text-xs">No sources yet</p>
							<p className="text-[10px] mt-1">
								Click "Add source" to get started
							</p>
						</div>
					) : (
						<>
							{/* Filter and Search on same line */}
							<div className="flex items-center gap-2">
								<Select
									value={activeFilter}
									onValueChange={setActiveFilter}
								>
									<SelectTrigger className="h-8 text-xs bg-background hover:bg-muted/30 border border-border/50 rounded-lg px-2.5 w-32 transition-colors shadow-sm">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{ALL_SOURCE_TYPES.map((type) => (
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

							{/* Sources List */}
							{filteredSources.length === 0 ? (
								<div className="text-center py-6">
									<div className="text-xs text-muted-foreground">
										No sources found
									</div>
								</div>
							) : (
								<div className="space-y-0.5 max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pr-1">
									{filteredSources.map((source: Source) => {
										const imageUrl =
											source.type === "image"
												? getImageUrl(source)
												: null;

										return (
											<button
												key={source.id}
												type="button"
												className={cn(
													"group flex items-center gap-2.5 p-2 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent cursor-pointer transition-all duration-300 hover:shadow-sm hover:shadow-primary/10 hover:translate-x-0.5",
												)}
												onClick={() =>
													onSourceSelect?.(source)
												}
												onKeyDown={(e) => {
													if (
														e.key === "Enter" ||
														e.key === " "
													) {
														e.preventDefault();
														onSourceSelect?.(
															source,
														);
													}
												}}
												tabIndex={0}
												aria-label={`Select source ${source.name}`}
											>
												{/* Image Preview or Icon */}
												{imageUrl ? (
													<div className="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-muted/40 border border-border/50">
														<img
															src={imageUrl}
															alt={source.name}
															className="w-full h-full object-cover"
															loading="lazy"
														/>
													</div>
												) : (
													<div className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-md bg-muted/40">
														{getSourceIcon(
															source.type,
															"h-3.5 w-3.5",
														)}
													</div>
												)}

												<div className="flex-1 min-w-0">
													<div className="text-[11px] font-medium truncate text-foreground">
														{source.name}
													</div>
													<div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
														<span>
															{getSourceTypeLabel(
																source.type,
															)}
														</span>
														{source.metadata
															?.size && (
															<>
																<span className="text-[8px]">
																	•
																</span>
																<span>
																	{formatFileSize(
																		source
																			.metadata
																			.size,
																	)}
																</span>
															</>
														)}
													</div>
												</div>

												{/* Context Menu */}
												<div className="flex-shrink-0">
													<SourceContextMenu
														sourceId={source.id}
														source={source}
														onInsertSource={
															onInsertSource
														}
														onUseAsAIContext={
															onUseAsAIContext
														}
													/>
												</div>
											</button>
										);
									})}
								</div>
							)}
						</>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
