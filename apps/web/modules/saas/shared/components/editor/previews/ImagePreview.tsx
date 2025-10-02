"use client";

import { Button } from "@ui/components/button";
import { Download, RotateCcw, RotateCw, ZoomIn, ZoomOut, Plus } from "lucide-react";
import { useState } from "react";

interface ImagePreviewProps {
	source: {
		id: string;
		name: string;
		filePath?: string;
		url?: string;
		metadata?: {
			size?: number;
			type?: string;
		};
	};
}

export function ImagePreview({ source }: ImagePreviewProps) {
	const imageUrl = source.filePath || source.url;
	
	// Get image URL with proper Supabase path
	const getImageUrl = (source: any) => {
		if (source.type === "image" && source.filePath) {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			const bucketName = process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME || "image-sources";
			return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${source.filePath}`;
		}
		return source.url;
	};

	const displayUrl = getImageUrl(source);

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Simple Image Display */}
			<div className="flex-1 flex items-center justify-center p-4">
				{displayUrl ? (
					<img
						src={displayUrl}
						alt={source.name}
						className="max-w-full max-h-full object-contain"
					/>
				) : (
					<div className="text-center text-muted-foreground">
						<div className="text-lg font-medium">Image not available</div>
						<div className="text-sm">The image could not be loaded</div>
					</div>
				)}
			</div>
		</div>
	);
}