"use client";

import { ChevronDownIcon } from "@shared/tiptap/components/tiptap-icons/chevron-down-icon";
import {
	Button,
	ButtonGroup,
} from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	Card,
	CardBody,
	CardGroupLabel,
	CardItemGroup,
} from "@shared/tiptap/components/tiptap-ui-primitive/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/dropdown-menu";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import type { Editor } from "@tiptap/react";
import { Download } from "lucide-react";
import * as React from "react";

export interface ExportButtonProps {
	editor?: Editor | null;
	onExport?: (format: "docx" | "pdf" | "doc") => void;
}

// Export utilities

const downloadFile = (content: string, filename: string, mimeType: string) => {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

const exportToPDF = async (editor: Editor) => {
	try {
		// For now, we'll export as HTML and let the browser print to PDF
		const htmlContent = editor.getHTML();
		const printWindow = window.open("", "_blank");
		if (printWindow) {
			printWindow.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>Document Export</title>
					<style>
						body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
						h1, h2, h3 { color: #333; }
						blockquote { border-left: 4px solid #ddd; padding-left: 20px; margin: 20px 0; }
						code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
						pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
						ul, ol { padding-left: 30px; }
						img { max-width: 100%; height: auto; }
					</style>
				</head>
				<body>
					${htmlContent}
				</body>
				</html>
			`);
			printWindow.document.close();
			printWindow.focus();
			setTimeout(() => {
				printWindow.print();
				printWindow.close();
			}, 250);
		}
	} catch (error) {
		console.error("Error exporting to PDF:", error);
		alert("Error exporting to PDF. Please try again.");
	}
};

const exportToDOCX = async (editor: Editor) => {
	try {
		// For now, export as HTML wrapped for Word compatibility
		const htmlContent = editor.getHTML();
		const docxContent = `
			<html xmlns:o="urn:schemas-microsoft-com:office:office" 
				  xmlns:w="urn:schemas-microsoft-com:office:word" 
				  xmlns="http://www.w3.org/TR/REC-html40">
			<head>
				<meta charset="utf-8">
				<title>Document Export</title>
				<!--[if gte mso 9]>
				<xml>
					<w:WordDocument>
						<w:View>Print</w:View>
						<w:Zoom>90</w:Zoom>
						<w:DoNotPromptForConvert/>
						<w:DoNotShowInsertionsAndDeletions/>
					</w:WordDocument>
				</xml>
				<![endif]-->
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; }
					h1, h2, h3 { color: #333; }
					blockquote { border-left: 4px solid #ddd; padding-left: 20px; margin: 20px 0; }
					code { background: #f4f4f4; padding: 2px 4px; }
					pre { background: #f4f4f4; padding: 15px; }
					ul, ol { padding-left: 30px; }
					img { max-width: 100%; height: auto; }
				</style>
			</head>
			<body>
				${htmlContent}
			</body>
			</html>
		`;

		downloadFile(
			docxContent,
			`document-${Date.now()}.doc`,
			"application/msword",
		);
	} catch (error) {
		console.error("Error exporting to DOCX:", error);
		alert("Error exporting to DOCX. Please try again.");
	}
};

/**
 * Export button component with dropdown menu for different formats
 */
export const ExportButton = React.forwardRef<
	HTMLButtonElement,
	ExportButtonProps
>(({ editor: providedEditor, onExport }, ref) => {
	const triggerRef = React.useRef<HTMLDivElement>(null);
	const contentRef = React.useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = React.useState(false);
	const { editor } = useTiptapEditor(providedEditor);

	// Handle Radix UI's onOpenChange and our outside click detection
	const handleOpenChange = React.useCallback((open: boolean) => {
		setIsOpen(open);
	}, []);

	// Simple outside click detection with delay to avoid Radix UI conflicts
	React.useEffect(() => {
		if (!isOpen) return;

		let cleanupFn: (() => void) | null = null;

		// Add a small delay to let Radix UI finish its setup
		const timeoutId = setTimeout(() => {
			const handleClickOutside = (event: MouseEvent) => {
				const target = event.target as Node;

				// Check if click is outside trigger
				const clickedOutsideTrigger =
					triggerRef.current && !triggerRef.current.contains(target);

				// Check if click is outside content (if content exists, otherwise assume outside)
				const clickedOutsideContent =
					!contentRef.current || !contentRef.current.contains(target);

				if (clickedOutsideTrigger && clickedOutsideContent) {
					handleOpenChange(false);
				}
			};

			// Add event listener WITHOUT capture to avoid conflicts
			document.addEventListener("mousedown", handleClickOutside, false);

			// Store the cleanup function
			cleanupFn = () => {
				document.removeEventListener(
					"mousedown",
					handleClickOutside,
					false,
				);
			};
		}, 100);

		return () => {
			clearTimeout(timeoutId);
			if (cleanupFn) {
				cleanupFn();
			}
		};
	}, [isOpen, handleOpenChange]);

	const handleExport = async (format: "docx" | "pdf" | "doc") => {
		if (!editor) {
			console.warn("No editor available for export");
			return;
		}

		// Close the dropdown after selection
		handleOpenChange(false);

		try {
			// Call custom export handler if provided
			if (onExport) {
				onExport(format);
				return;
			}

			// Default export behavior
			switch (format) {
				case "docx":
				case "doc":
					await exportToDOCX(editor);
					break;
				case "pdf":
					await exportToPDF(editor);
					break;
				default:
					console.warn(`Unsupported export format: ${format}`);
			}
		} catch (error) {
			console.error(`Error exporting as ${format}:`, error);
			alert(
				`Error exporting document as ${format.toUpperCase()}. Please try again.`,
			);
		}
	};

	return (
		<div ref={triggerRef}>
			<DropdownMenu
				open={isOpen}
				onOpenChange={handleOpenChange}
				modal={false}
			>
				<DropdownMenuTrigger asChild>
					<Button
						ref={ref}
						type="button"
						data-style="ghost"
						role="button"
						aria-label="Export document"
						tooltip="Export document"
					>
						<Download size={16} className="tiptap-button-icon" />
						<span className="tiptap-button-text">Export</span>
						<ChevronDownIcon className="tiptap-button-icon" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<div ref={contentRef}>
						<Card>
							<CardBody>
								<CardItemGroup>
									<CardGroupLabel>Export as</CardGroupLabel>
									<ButtonGroup>
										<DropdownMenuItem asChild>
											<Button
												type="button"
												data-style="ghost"
												showTooltip={false}
												onClick={() =>
													handleExport("docx")
												}
											>
												<span className="tiptap-button-text">
													DOCX
												</span>
											</Button>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Button
												type="button"
												data-style="ghost"
												showTooltip={false}
												onClick={() =>
													handleExport("pdf")
												}
											>
												<span className="tiptap-button-text">
													PDF
												</span>
											</Button>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Button
												type="button"
												data-style="ghost"
												showTooltip={false}
												onClick={() =>
													handleExport("doc")
												}
											>
												<span className="tiptap-button-text">
													DOC
												</span>
											</Button>
										</DropdownMenuItem>
									</ButtonGroup>
								</CardItemGroup>
							</CardBody>
						</Card>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
});

ExportButton.displayName = "ExportButton";
