"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Button } from "@ui/components/button";
import { Download, FileText, File, Code } from "lucide-react";
import * as React from "react";

interface ExportModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onExport?: (format: string) => void;
}

const exportOptions = [
	{
		icon: <FileText className="h-6 w-6 text-blue-500" />,
		title: "Export as PDF",
		description: "Portable Document Format",
		format: "pdf",
	},
	{
		icon: <File className="h-6 w-6 text-blue-500" />,
		title: "Export as DOCX",
		description: "Microsoft Word Document",
		format: "docx",
	},
	{
		icon: <FileText className="h-6 w-6 text-blue-500" />,
		title: "Export as Markdown",
		description: "Plain text with formatting",
		format: "markdown",
	},
	{
		icon: <Code className="h-6 w-6 text-blue-500" />,
		title: "Export as HTML",
		description: "Web page format",
		format: "html",
	},
	{
		icon: <FileText className="h-6 w-6 text-blue-500" />,
		title: "Export as TXT",
		description: "Plain text without formatting",
		format: "txt",
	},
	{
		icon: <Code className="h-6 w-6 text-blue-500" />,
		title: "Export as JSON",
		description: "Structured data format",
		format: "json",
	},
];

export function ExportModal({ open, onOpenChange, onExport }: ExportModalProps) {
	const handleExport = (format: string) => {
		onExport?.(format);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<Download className="h-5 w-5" />
						<DialogTitle>Export Document</DialogTitle>
					</div>
					<DialogDescription>
						Choose a format to export your document.
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-2 gap-4 mt-4">
					{exportOptions.map((option, index) => (
						<Button
							key={index}
							variant="outline"
							className="h-auto flex flex-col items-center gap-3 p-6 hover:bg-accent hover:border-primary transition-all"
							onClick={() => handleExport(option.format)}
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
