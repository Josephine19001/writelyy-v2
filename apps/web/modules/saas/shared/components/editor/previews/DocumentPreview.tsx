"use client";

import { Button } from "@ui/components/button";
import { Download, ExternalLink, FileText, Sparkles } from "lucide-react";

interface DocumentPreviewProps {
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

export function DocumentPreview({ source }: DocumentPreviewProps) {
	// Get file extension for display
	const getFileExtension = () => {
		const extension = source.name.split('.').pop()?.toUpperCase();
		return extension || 'DOC';
	};

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Simple Document Display */}
			<div className="flex-1 flex items-center justify-center p-8">
				<div className="text-center max-w-md">
					<FileText className="h-24 w-24 mx-auto text-blue-600 mb-4" />
					<h3 className="text-xl font-medium mb-2">{getFileExtension()}</h3>
					<p className="text-muted-foreground mb-4">
						{source.name}
					</p>
					<p className="text-sm text-muted-foreground">
						Document preview not available
					</p>
				</div>
			</div>
		</div>
	);
}