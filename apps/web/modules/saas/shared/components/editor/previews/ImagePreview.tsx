"use client";

import { Button } from "@ui/components/button";
import { Download, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
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
	const [zoom, setZoom] = useState(100);
	const [rotation, setRotation] = useState(0);
	
	const imageUrl = source.filePath || source.url;
	
	const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 500));
	const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
	const handleRotateLeft = () => setRotation(prev => prev - 90);
	const handleRotateRight = () => setRotation(prev => prev + 90);
	const handleDownload = () => {
		if (imageUrl) {
			const link = document.createElement('a');
			link.href = imageUrl;
			link.download = source.name;
			link.click();
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
					<Button variant="outline" size="sm" onClick={handleZoomOut}>
						<ZoomOut className="h-4 w-4" />
					</Button>
					<span className="text-sm font-medium min-w-[60px] text-center">
						{zoom}%
					</span>
					<Button variant="outline" size="sm" onClick={handleZoomIn}>
						<ZoomIn className="h-4 w-4" />
					</Button>
					
					<div className="border-l pl-2 ml-2">
						<Button variant="outline" size="sm" onClick={handleRotateLeft}>
							<RotateCcw className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="sm" onClick={handleRotateRight}>
							<RotateCw className="h-4 w-4" />
						</Button>
					</div>
				</div>
				
				<div className="flex items-center space-x-4">
					<div className="text-sm text-muted-foreground">
						{source.metadata?.type} • {formatFileSize(source.metadata?.size)}
					</div>
					<Button variant="outline" size="sm" onClick={handleDownload}>
						<Download className="h-4 w-4 mr-2" />
						Download
					</Button>
				</div>
			</div>
			
			{/* Image Container */}
			<div className="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-4">
				{imageUrl ? (
					<div className="max-w-full max-h-full flex items-center justify-center">
						<img
							src={imageUrl}
							alt={source.name}
							className="max-w-full max-h-full object-contain shadow-lg"
							style={{
								transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
								transition: 'transform 0.2s ease-in-out'
							}}
						/>
					</div>
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