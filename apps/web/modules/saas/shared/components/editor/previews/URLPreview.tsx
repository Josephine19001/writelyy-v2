"use client";

import { Button } from "@ui/components/button";
import { ExternalLink, Globe, RefreshCw } from "lucide-react";
import { useState } from "react";

interface URLPreviewProps {
	source: {
		id: string;
		name: string;
		url?: string;
		metadata?: {
			originalUrl?: string;
		};
	};
}

export function URLPreview({ source }: URLPreviewProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [key, setKey] = useState(0); // Force iframe reload
	
	const url = source.url || source.metadata?.originalUrl;
	
	const handleRefresh = () => {
		setIsLoading(true);
		setKey(prev => prev + 1);
		// Reset loading state after a delay
		setTimeout(() => setIsLoading(false), 1000);
	};

	const handleOpenExternal = () => {
		if (url) {
			window.open(url, '_blank', 'noopener,noreferrer');
		}
	};

	const getDomainFromUrl = (url: string) => {
		try {
			return new URL(url).hostname;
		} catch {
			return url;
		}
	};

	return (
		<div className="flex flex-col h-full">
			{/* Toolbar */}
			<div className="flex items-center justify-between p-4 border-b bg-background">
				<div className="flex items-center space-x-2 min-w-0 flex-1">
					<Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
					<div className="min-w-0 flex-1">
						<h3 className="font-medium truncate">{source.name}</h3>
						{url && (
							<p className="text-xs text-muted-foreground truncate">
								{getDomainFromUrl(url)}
							</p>
						)}
					</div>
				</div>
				
				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
						<RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
						Refresh
					</Button>
					<Button variant="outline" size="sm" onClick={handleOpenExternal}>
						<ExternalLink className="h-4 w-4 mr-2" />
						Open in New Tab
					</Button>
				</div>
			</div>
			
			{/* URL Preview */}
			<div className="flex-1 bg-muted/20 relative">
				{url ? (
					<>
						{isLoading && (
							<div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
								<div className="text-sm text-muted-foreground">Loading...</div>
							</div>
						)}
						<iframe
							key={key}
							src={url}
							className="w-full h-full border-0"
							title={source.name}
							sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
							onLoad={() => setIsLoading(false)}
						/>
					</>
				) : (
					<div className="flex items-center justify-center h-full">
						<div className="text-center text-muted-foreground">
							<Globe className="h-16 w-16 mx-auto mb-4" />
							<div className="text-lg font-medium">URL not available</div>
							<div className="text-sm">No valid URL found for this source</div>
						</div>
					</div>
				)}
			</div>
			
			{/* Security Notice */}
			<div className="px-4 py-2 bg-muted/50 border-t">
				<p className="text-xs text-muted-foreground">
					🔒 This external content is displayed in a sandboxed iframe for security.
				</p>
			</div>
		</div>
	);
}