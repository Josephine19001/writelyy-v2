"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Button } from "@ui/components/button";
import { Image, Search, Sparkles, Camera, Image as ImageIcon, Box, Music, Heart, Grid3x3, QrCode, ImageUp, FolderOpen } from "lucide-react";
import * as React from "react";

interface SourcesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const imageOptions = [
	{
		icon: <ImageIcon className="h-6 w-6 text-blue-500" />,
		title: "Image upload or URL",
		description: "Upload from device or paste URL",
	},
	{
		icon: <Search className="h-6 w-6 text-blue-500" />,
		title: "Web image search",
		description: "Search images from the web",
	},
	{
		icon: <Sparkles className="h-6 w-6 text-blue-500" />,
		title: "AI images",
		description: "Generate images with AI",
	},
	{
		icon: <Camera className="h-6 w-6" />,
		title: "Unsplash images",
		description: "Free high-quality photos",
	},
	{
		icon: <Box className="h-6 w-6" style={{ background: 'linear-gradient(45deg, #9333ea 0%, #3b82f6 50%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />,
		title: "GIFs from GIPHY",
		description: "Animated GIFs",
	},
	{
		icon: <Box className="h-6 w-6" />,
		title: "Pictographic illustrations",
		description: "Vector illustrations",
	},
	{
		icon: <Music className="h-6 w-6 text-blue-500" />,
		title: "Icons (classic)",
		description: "Classic icon sets",
	},
	{
		icon: <Heart className="h-6 w-6 text-blue-500" />,
		title: "Icons (modern)",
		description: "Modern icon sets",
	},
	{
		icon: <QrCode className="h-6 w-6 text-blue-500" />,
		title: "QR Code",
		description: "Generate QR codes",
	},
	{
		icon: <ImageUp className="h-6 w-6 text-blue-500" />,
		title: "Accent images",
		description: "Decorative images",
	},
	{
		icon: <Grid3x3 className="h-6 w-6 text-blue-500" />,
		title: "Gallery",
		description: "/gallery",
	},
];

export function SourcesModal({ open, onOpenChange }: SourcesModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<Image className="h-5 w-5" />
						<DialogTitle>Images</DialogTitle>
					</div>
					<DialogDescription>
						Upload, browse, or generate images.
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-3 gap-4 mt-4">
					{imageOptions.map((option, index) => (
						<Button
							key={index}
							variant="outline"
							className="h-auto flex flex-col items-center gap-3 p-6 hover:bg-accent hover:border-primary transition-all"
							onClick={() => {
								console.log(`Selected: ${option.title}`);
								// Handle option selection
							}}
						>
							<div className="flex items-center justify-center">
								{option.icon}
							</div>
							<div className="text-center">
								<div className="font-medium text-sm">{option.title}</div>
								{option.description && (
									<div className="text-xs text-muted-foreground mt-1">
										{option.description}
									</div>
								)}
							</div>
						</Button>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
