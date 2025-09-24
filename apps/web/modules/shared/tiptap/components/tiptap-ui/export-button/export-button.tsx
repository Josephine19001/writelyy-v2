"use client";

import { Download } from "lucide-react";
import * as React from "react";
import { 
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/dropdown-menu";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { ChevronDownIcon } from "@shared/tiptap/components/tiptap-icons/chevron-down-icon";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import type { Editor } from "@tiptap/react";

export interface ExportButtonProps {
	editor?: Editor | null;
	onExport?: (format: 'docx' | 'pdf' | 'doc') => void;
}

// Export utilities
const exportToHTML = (editor: Editor): string => {
	return editor.getHTML();
};

const exportToText = (editor: Editor): string => {
	return editor.getText();
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
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
		const printWindow = window.open('', '_blank');
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
		console.error('Error exporting to PDF:', error);
		alert('Error exporting to PDF. Please try again.');
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
		
		downloadFile(docxContent, `document-${Date.now()}.doc`, 'application/msword');
	} catch (error) {
		console.error('Error exporting to DOCX:', error);
		alert('Error exporting to DOCX. Please try again.');
	}
};

/**
 * Export button component with dropdown menu for different formats
 */
export const ExportButton = React.forwardRef<
	HTMLButtonElement,
	ExportButtonProps
>(({ editor: providedEditor, onExport }, ref) => {
	const { editor } = useTiptapEditor(providedEditor);

	const handleExport = async (format: 'docx' | 'pdf' | 'doc') => {
		if (!editor) {
			console.warn('No editor available for export');
			return;
		}

		try {
			// Call custom export handler if provided
			if (onExport) {
				onExport(format);
				return;
			}

			// Default export behavior
			switch (format) {
				case 'docx':
				case 'doc':
					await exportToDOCX(editor);
					break;
				case 'pdf':
					await exportToPDF(editor);
					break;
				default:
					console.warn(`Unsupported export format: ${format}`);
			}
		} catch (error) {
			console.error(`Error exporting as ${format}:`, error);
			alert(`Error exporting document as ${format.toUpperCase()}. Please try again.`);
		}
	};

	return (
		<DropdownMenu>
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
			<DropdownMenuContent align="start" sideOffset={5}>
				<DropdownMenuItem onClick={() => handleExport('docx')}>
					<span className="tiptap-button-text">DOCX</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleExport('pdf')}>
					<span className="tiptap-button-text">PDF</span>
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleExport('doc')}>
					<span className="tiptap-button-text">DOC</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
});

ExportButton.displayName = "ExportButton";