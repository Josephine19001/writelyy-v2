"use client";

import { Button } from "@ui/components/button";
import { Download, ExternalLink, FileText } from "lucide-react";

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
	const docUrl = source.filePath || source.url;
	
	const handleDownload = () => {
		if (docUrl) {
			const link = document.createElement('a');
			link.href = docUrl;
			link.download = source.name;
			link.click();
		}
	};

	const handleOpenExternal = () => {
		if (docUrl) {
			window.open(docUrl, '_blank');
		}
	};

	const formatFileSize = (bytes?: number) => {
		if (!bytes) return 'Unknown size';
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
	};

	// Get file extension for display
	const getFileExtension = () => {
		const extension = source.name.split('.').pop()?.toUpperCase();
		return extension || 'DOC';
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
			
			{/* Document Preview */}
			<div className="flex-1 bg-muted/20 flex items-center justify-center">
				<div className="text-center p-8 max-w-md">
					<div className="mb-6">
						<FileText className="h-16 w-16 mx-auto text-blue-600 mb-4" />
						<h3 className="text-lg font-medium mb-2">{getFileExtension()} Document</h3>
						<p className="text-sm text-muted-foreground mb-4">
							{source.name}
						</p>
						{source.metadata?.size && (
							<p className="text-xs text-muted-foreground">
								{formatFileSize(source.metadata.size)}
							</p>
						)}
					</div>
					
					<div className="space-y-3">
						<p className="text-sm text-muted-foreground">
							Document preview is not available in the browser.
						</p>
						
						<div className="flex flex-col space-y-2">
							<Button onClick={handleDownload} className="w-full">
								<Download className="h-4 w-4 mr-2" />
								Download to View
							</Button>
							
							<Button variant="outline" onClick={handleOpenExternal} className="w-full">
								<ExternalLink className="h-4 w-4 mr-2" />
								Open in New Tab
							</Button>
						</div>
						
						<p className="text-xs text-muted-foreground mt-4">
							Tip: Use Microsoft Office Online or Google Docs to view this document online.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}