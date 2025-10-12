"use client";

import { Button } from "@ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@ui/components/popover";
import { Code, Download, File, FileText } from "lucide-react";
import * as React from "react";

interface ExportPopoverProps {
	children: React.ReactNode;
	onExport?: (format: string) => void;
}

const exportOptions = [
	{
		icon: <FileText className="h-5 w-5 text-primary" />,
		title: "PDF",
		format: "pdf",
	},
	{
		icon: <File className="h-5 w-5 text-primary" />,
		title: "DOCX",
		format: "docx",
	},
	{
		icon: <FileText className="h-5 w-5 text-primary" />,
		title: "Markdown",
		format: "markdown",
	},
	{
		icon: <Code className="h-5 w-5 text-primary" />,
		title: "HTML",
		format: "html",
	},
	{
		icon: <FileText className="h-5 w-5 text-primary" />,
		title: "TXT",
		format: "txt",
	},
	{
		icon: <Code className="h-5 w-5 text-primary" />,
		title: "JSON",
		format: "json",
	},
];

export function ExportPopover({ children, onExport }: ExportPopoverProps) {
	const [open, setOpen] = React.useState(false);

	const handleExport = (format: string) => {
		onExport?.(format);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				className="w-[350px] p-4"
				side="left"
				align="start"
				sideOffset={8}
			>
				<div className="space-y-3">
					<div className="flex items-center gap-2 pb-2 border-b">
						<Download className="h-4 w-4" />
						<h3 className="font-semibold text-sm">Export Document</h3>
					</div>
					<p className="text-xs text-muted-foreground">
						Choose a format to export your document.
					</p>

					<div className="grid grid-cols-2 gap-2 mt-3">
						{exportOptions.map((option, index) => (
							<Button
								key={index}
								variant="outline"
								className="h-auto flex flex-col items-center gap-2 p-3 hover:bg-accent hover:border-primary transition-all"
								onClick={() => handleExport(option.format)}
							>
								<div className="flex items-center justify-center">
									{option.icon}
								</div>
								<div className="text-center text-xs font-medium">
									{option.title}
								</div>
							</Button>
						))}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
