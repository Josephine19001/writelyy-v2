"use client";

import { useSourcesQuery } from "@saas/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { SourcesIcon } from "@shared/tiptap/components/tiptap-icons/sources-icon";
import { ChevronDownIcon } from "@shared/tiptap/components/tiptap-icons/chevron-down-icon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/dropdown-menu";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import { getSourceIcon } from "../../workspace/sources/utils/sourceUtils";
import type { Source } from "../../workspace/sources/types";
import { useMemo } from "react";

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

export function SourcesDropdown() {
	const { editor } = useTiptapEditor();
	const { activeWorkspace } = useActiveWorkspace();
	const { data: sourcesData } = useSourcesQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id }
	);

	const sources = sourcesData?.sources || [];
	
	// Filter to only insertable sources (images and links)
	const insertableSources = useMemo(() => {
		return sources.filter((source: Source) => 
			["image", "url"].includes(source.type)
		);
	}, [sources]);

	const handleSourceInsert = (source: Source) => {
		if (!editor) return;

		// Insert based on source type
		if (source.type === "image") {
			const imageUrl = getImageUrl(source);
			if (!imageUrl) {
				console.warn("🖼️ No valid image URL found");
				return;
			}

			try {
				const result = editor
					.chain()
					.focus()
					.insertContent({
						type: "image",
						attrs: {
							src: imageUrl,
							alt: source.name,
							title: source.name,
						},
					})
					.run();

				if (!result) {
					editor
						.chain()
						.focus()
						.setImage({
							src: imageUrl,
							alt: source.name,
							title: source.name,
						})
						.run();
				}
			} catch (error) {
				console.error("🖼️ Failed to insert image:", error);
				editor
					.chain()
					.focus()
					.insertContent({
						type: "text",
						text: `[Image: ${source.name}]`,
						marks: [{ type: "link", attrs: { href: imageUrl } }],
					})
					.run();
			}
		} else if (source.type === "url") {
			editor
				.chain()
				.focus()
				.insertContent({
					type: "text",
					text: source.name,
					marks: [{ type: "link", attrs: { href: source.url } }],
				})
				.run();
		}

	};

	// Don't render if no sources available
	if (insertableSources.length === 0) {
		return null;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					role="button"
					tabIndex={-1}
					tooltip="Insert from sources"
					className="flex items-center gap-1"
				>
					<SourcesIcon className="tiptap-button-icon" />
					<ChevronDownIcon className="h-3 w-3" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="center" side="top" sideOffset={8}>
				{insertableSources.map((source: Source) => (
					<DropdownMenuItem
						key={source.id}
						onClick={() => handleSourceInsert(source)}
						className="flex items-center gap-2 min-w-48"
					>
						<div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
							{getSourceIcon(source.type, "h-4 w-4")}
						</div>
						<div className="flex-1 min-w-0">
							<div className="font-medium truncate">
								{source.name}
							</div>
							<div className="text-xs text-muted-foreground">
								{source.type === "image" ? "Image" : "Link"}
							</div>
						</div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}