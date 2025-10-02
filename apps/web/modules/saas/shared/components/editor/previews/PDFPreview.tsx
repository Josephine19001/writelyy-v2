"use client";

import { Button } from "@ui/components/button";
import { Download, ExternalLink, Sparkles } from "lucide-react";

interface PDFPreviewProps {
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

export function PDFPreview({ source }: PDFPreviewProps) {
	const pdfUrl = source.filePath || source.url;
	
	// Get PDF URL with proper Supabase path
	const getPdfUrl = (source: any) => {
		if (source.type === "pdf" && source.filePath) {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
			const bucketName = process.env.NEXT_PUBLIC_DOCUMENTS_BUCKET_NAME || "document-sources";
			return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${source.filePath}`;
		}
		return source.url;
	};

	const displayUrl = getPdfUrl(source);

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Simple PDF Display */}
			<div className="flex-1">
				{displayUrl ? (
					<iframe
						src={`${displayUrl}#toolbar=0&navpanes=0&scrollbar=1`}
						className="w-full h-full border-0"
						title={source.name}
					/>
				) : (
					<div className="flex items-center justify-center h-full">
						<div className="text-center text-muted-foreground">
							<div className="text-lg font-medium">PDF not available</div>
							<div className="text-sm">The PDF file could not be loaded</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}