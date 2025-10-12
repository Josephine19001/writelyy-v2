"use client";

import { IconButton } from "@ui/components/icon-button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@ui/components/tooltip";
import { Download, FileText, Image, Redo, Undo } from "lucide-react";
import * as React from "react";
import { ExportPopover } from "./export-popover";
import { SnippetsPopover } from "./snippets-popover";
import { SourcesPopover } from "./sources-popover";

interface EditorActionBarProps {
	onUndo?: () => void;
	onRedo?: () => void;
	onSourceSelect?: (source: any) => void;
	onSnippetSelect?: (snippet: any) => void;
	onInsertSource?: (source: any) => void;
	onUseAsAIContext?: (source: any) => void;
	onInsertSnippet?: (snippet: any) => void;
	onExport?: (format: string) => void;
}

export function EditorActionBar({
	onUndo,
	onRedo,
	onSourceSelect,
	onSnippetSelect,
	onInsertSource,
	onUseAsAIContext,
	onInsertSnippet,
	onExport,
}: EditorActionBarProps) {
	return (
		<div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
			<div className="flex flex-col items-center py-3 px-2 space-y-2 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg">
				<TooltipProvider delayDuration={300}>
					{/* Undo Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<IconButton
								variant="ghost"
								size="sm"
								icon={<Undo className="h-4 w-4" />}
								onClick={onUndo}
								className="hover:bg-primary/10 hover:text-primary transition-colors"
							/>
						</TooltipTrigger>
						<TooltipContent side="left">
							<p>Undo</p>
						</TooltipContent>
					</Tooltip>

					{/* Redo Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<IconButton
								variant="ghost"
								size="sm"
								icon={<Redo className="h-4 w-4" />}
								onClick={onRedo}
								className="hover:bg-primary/10 hover:text-primary transition-colors"
							/>
						</TooltipTrigger>
						<TooltipContent side="left">
							<p>Redo</p>
						</TooltipContent>
					</Tooltip>

					{/* Divider */}
					<div className="w-full h-px bg-border my-1" />

					{/* Sources Popover */}
					<SourcesPopover
						onSourceSelect={onSourceSelect}
						onInsertSource={onInsertSource}
						onUseAsAIContext={onUseAsAIContext}
					>
						<IconButton
							variant="ghost"
							size="sm"
							icon={<Image className="h-4 w-4" />}
							className="hover:bg-primary/10 hover:text-primary transition-colors"
						/>
					</SourcesPopover>

					{/* Snippets Popover */}
					<SnippetsPopover
						onSnippetSelect={onSnippetSelect}
						onInsertSnippet={onInsertSnippet}
					>
						<IconButton
							variant="ghost"
							size="sm"
							icon={<FileText className="h-4 w-4" />}
							className="hover:bg-primary/10 hover:text-primary transition-colors"
						/>
					</SnippetsPopover>

					{/* Divider */}
					<div className="w-full h-px bg-border my-1" />

					{/* Export Popover */}
					<ExportPopover onExport={onExport}>
						<IconButton
							variant="ghost"
							size="sm"
							icon={<Download className="h-4 w-4" />}
							className="hover:bg-primary/10 hover:text-primary transition-colors"
						/>
					</ExportPopover>
				</TooltipProvider>
			</div>
		</div>
	);
}
