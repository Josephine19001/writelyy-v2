"use client";

import { Button } from "@ui/components/button";
import { ExternalLink, Globe, RefreshCw, Plus } from "lucide-react";
import React, { useState } from "react";

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
	const url = source.url || source.metadata?.originalUrl;
	
	// Automatically open the URL in a new tab when this component loads
	React.useEffect(() => {
		if (url) {
			window.open(url, '_blank', 'noopener,noreferrer');
		}
	}, [url]);

	const getDomainFromUrl = (url: string) => {
		try {
			return new URL(url).hostname;
		} catch {
			return url;
		}
	};

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Simple Link Display */}
			<div className="flex-1 flex items-center justify-center p-8">
				<div className="text-center max-w-md">
					<Globe className="h-24 w-24 mx-auto text-purple-600 mb-4" />
					<h3 className="text-xl font-medium mb-2">Link</h3>
					<p className="text-muted-foreground mb-2">
						{source.name}
					</p>
					{url && (
						<p className="text-sm text-muted-foreground mb-4">
							{getDomainFromUrl(url)}
						</p>
					)}
					<p className="text-sm text-muted-foreground">
						Link opened in new tab
					</p>
				</div>
			</div>
		</div>
	);
}