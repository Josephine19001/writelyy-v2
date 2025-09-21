"use client";

import { Button } from "@ui/components/button";
import { Download, ExternalLink } from "lucide-react";

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
	
	const handleDownload = () => {
		if (pdfUrl) {
			const link = document.createElement('a');
			link.href = pdfUrl;
			link.download = source.name;
			link.click();
		}
	};

	const handleOpenExternal = () => {
		if (pdfUrl) {
			window.open(pdfUrl, '_blank');
		}
	};

	const formatFileSize = (bytes?: number) => {
		if (!bytes) return 'Unknown size';
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
	};

	return (
		<div className="flex flex-col h-full">
			{/* Toolbar */}
			<div className="flex items-center justify-between p-4 border-b bg-background">
				<div className="flex items-center space-x-2">
					<h3 className="font-medium">{source.name}</h3>
					{source.metadata && (
						<span className="text-sm text-muted-foreground">
							{formatFileSize(source.metadata.size)}
						</span>
					)}
				</div>
				
				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm" onClick={handleOpenExternal}>
						<ExternalLink className="h-4 w-4 mr-2" />
						Open in New Tab
					</Button>
					<Button variant="outline" size="sm" onClick={handleDownload}>
						<Download className="h-4 w-4 mr-2" />
						Download
					</Button>
				</div>
			</div>
			
			{/* PDF Viewer */}
			<div className="flex-1 bg-muted/20">
				{pdfUrl ? (
					<iframe
						src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
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