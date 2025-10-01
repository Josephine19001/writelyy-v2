"use client";

import { FileImage, File, Link2, FileText } from "lucide-react";
import { cn } from "@ui/lib";
import type { Source } from "../types";

interface SourcePreviewProps {
	source: Source;
	className?: string;
}

const getImageUrl = (source: Source) => {
	if (source.type === "image" && source.filePath) {
		const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
		const bucketName = process.env.NEXT_PUBLIC_IMAGES_BUCKET_NAME || "image-sources";
		return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${source.filePath}`;
	}
	return null;
};

const PDFPreview = ({ source }: { source: Source }) => (
	<div className="w-full h-full bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center p-3">
		<FileImage className="h-6 w-6 text-red-600 mb-1" />
		<div className="text-center">
			<div className="text-xs font-medium text-red-800">PDF</div>
			{source.metadata?.pageCount && (
				<div className="text-xs text-red-600">
					{source.metadata.pageCount}p
				</div>
			)}
		</div>
	</div>
);

const DocumentPreview = ({ source }: { source: Source }) => (
	<div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-3">
		<FileText className="h-6 w-6 text-blue-600 mb-1" />
		<div className="text-center">
			<div className="text-xs font-medium text-blue-800">
				{source.type.toUpperCase()}
			</div>
		</div>
	</div>
);

const LinkPreview = ({ source }: { source: Source }) => {
	// Extract domain from URL for display
	const getDomain = (url?: string) => {
		if (!url) return "Link";
		try {
			const domain = new URL(url).hostname;
			return domain.replace("www.", "");
		} catch {
			return "Link";
		}
	};

	return (
		<div className="w-full h-full bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col items-center justify-center p-3">
			<Link2 className="h-6 w-6 text-purple-600 mb-1" />
			<div className="text-center">
				<div className="text-xs font-medium text-purple-800 truncate max-w-full">
					{getDomain(source.url || undefined)}
				</div>
			</div>
		</div>
	);
};

const ImagePreview = ({ source }: { source: Source }) => {
	const imageUrl = getImageUrl(source);
	
	if (!imageUrl) {
		return (
			<div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center p-3">
				<FileImage className="h-6 w-6 text-green-600 mb-1" />
				<div className="text-center">
					<div className="text-xs font-medium text-green-800">Image</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full relative bg-gray-100">
			<img
				src={imageUrl}
				alt={source.name}
				className="w-full h-full object-cover"
				onError={(e) => {
					// Fallback to icon if image fails to load
					e.currentTarget.style.display = 'none';
					e.currentTarget.parentElement!.innerHTML = `
						<div class="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-center p-4">
							<svg class="h-8 w-8 text-green-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
								<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
							</svg>
							<div class="text-center">
								<div class="text-xs font-medium text-green-800">Image</div>
							</div>
						</div>
					`;
				}}
			/>
		</div>
	);
};

export function SourcePreview({ source, className }: SourcePreviewProps) {
	const renderPreview = () => {
		switch (source.type) {
			case "image":
				return <ImagePreview source={source} />;
			case "pdf":
				return <PDFPreview source={source} />;
			case "doc":
			case "docx":
				return <DocumentPreview source={source} />;
			case "url":
				return <LinkPreview source={source} />;
			default:
				return (
					<div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
						<File className="h-8 w-8 text-gray-600 mb-2" />
						<div className="text-center">
							<div className="text-xs font-medium text-gray-800">File</div>
						</div>
					</div>
				);
		}
	};

	return (
		<div className={cn("aspect-square rounded-lg overflow-hidden", className)}>
			{renderPreview()}
		</div>
	);
}