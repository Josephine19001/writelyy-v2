/**
 * Tiptap Export Utilities
 * Custom export functions for PDF, DOCX, and Markdown formats
 * No Tiptap Pro extensions required
 */

import type { Editor } from "@tiptap/core";

/**
 * Convert Tiptap HTML to Markdown
 */
function htmlToMarkdown(html: string): string {
	// Create a temporary div to parse HTML
	const tempDiv = document.createElement("div");
	tempDiv.innerHTML = html;

	// Helper function to process nodes recursively
	function processNode(node: Node): string {
		if (node.nodeType === Node.TEXT_NODE) {
			return node.textContent || "";
		}

		if (node.nodeType !== Node.ELEMENT_NODE) {
			return "";
		}

		const element = node as HTMLElement;
		const tagName = element.tagName.toLowerCase();
		let result = "";

		// Get children content first
		const childrenContent = Array.from(element.childNodes)
			.map((child) => processNode(child))
			.join("");

		switch (tagName) {
			// Headings
			case "h1":
				return `# ${childrenContent}\n\n`;
			case "h2":
				return `## ${childrenContent}\n\n`;
			case "h3":
				return `### ${childrenContent}\n\n`;
			case "h4":
				return `#### ${childrenContent}\n\n`;
			case "h5":
				return `##### ${childrenContent}\n\n`;
			case "h6":
				return `###### ${childrenContent}\n\n`;

			// Paragraph
			case "p":
				return `${childrenContent}\n\n`;

			// Bold
			case "strong":
			case "b":
				return `**${childrenContent}**`;

			// Italic
			case "em":
			case "i":
				return `*${childrenContent}*`;

			// Code
			case "code":
				return `\`${childrenContent}\``;

			// Code block
			case "pre":
				return `\`\`\`\n${childrenContent}\n\`\`\`\n\n`;

			// Links
			case "a": {
				const href = element.getAttribute("href") || "";
				return `[${childrenContent}](${href})`;
			}

			// Images
			case "img": {
				const src = element.getAttribute("src") || "";
				const alt = element.getAttribute("alt") || "";
				return `![${alt}](${src})\n\n`;
			}

			// Lists
			case "ul":
				return `${childrenContent}\n`;
			case "ol":
				return `${childrenContent}\n`;
			case "li": {
				const parent = element.parentElement;
				if (parent?.tagName.toLowerCase() === "ol") {
					return `1. ${childrenContent}\n`;
				}
				return `- ${childrenContent}\n`;
			}

			// Blockquote
			case "blockquote":
				return `> ${childrenContent}\n\n`;

			// Horizontal rule
			case "hr":
				return "---\n\n";

			// Strike
			case "s":
			case "strike":
			case "del":
				return `~~${childrenContent}~~`;

			// Underline (Markdown doesn't have native underline, use HTML)
			case "u":
				return `<u>${childrenContent}</u>`;

			// Highlight (using mark tag for Markdown)
			case "mark":
				return `==${childrenContent}==`;

			// Subscript
			case "sub":
				return `~${childrenContent}~`;

			// Superscript
			case "sup":
				return `^${childrenContent}^`;

			// Table elements
			case "table":
				return `\n${childrenContent}\n`;
			case "thead":
			case "tbody":
				return childrenContent;
			case "tr":
				return `| ${childrenContent}\n`;
			case "th":
			case "td":
				return `${childrenContent} |`;

			// Line break
			case "br":
				return "\n";

			// Default - just return children content
			default:
				return childrenContent;
		}
	}

	let markdown = processNode(tempDiv);

	// Clean up excessive newlines
	markdown = markdown.replace(/\n{3,}/g, "\n\n");

	return markdown.trim();
}

/**
 * Writelyy Logo SVG (from Logo.tsx component)
 */
const WRITELYY_LOGO_SVG = `
<svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
	<title>Writelyy</title>
	<path d="M494.006 333.939C482.96 326.354 469.908 323.55 458.391 321.08C454.133 320.115 449.922 322.828 448.996 327.023C448.063 331.218 450.762 335.367 455.028 336.279C465.588 338.552 476.511 340.9 484.981 346.706C491.522 351.198 497.724 359.816 495.865 368.13C493.196 380.084 475.832 385.396 465.712 387.501C430.097 394.919 392.547 394.584 356.269 394.288C335.28 394.113 313.565 393.931 292.198 395.207C276.4 396.157 259.893 398.24 246.24 406.964C232.146 415.962 220.807 435.235 227.549 453.239C228.853 456.712 230.642 459.699 232.378 462.594C234.592 466.303 236.505 469.502 236.605 472.451C236.736 476.395 233.319 480.233 229.879 482.285C225.158 485.097 219.087 486.237 212.746 487.263C149.478 497.485 79.0408 499.217 18.076 492.173C21.0656 476.931 26.6604 460.312 35.0376 441.701C48.2566 441.406 62.8038 439.707 78.4555 436.539C124.19 427.512 170.003 407.278 210.841 378.017C225.77 367.433 240.383 356.305 254.285 344.865C255.549 343.854 256.023 342.141 255.549 340.585C254.996 339.106 253.574 338.017 251.915 337.939C238.171 337.472 219.056 334.748 199.545 325.954C221.82 326.344 261.394 324.009 296.465 307.745C296.86 307.589 297.176 307.356 297.492 307.044C321.662 284.398 344.174 260.273 364.474 235.371C365.422 234.281 365.58 232.647 364.948 231.324C364.317 230.001 362.973 229.067 361.473 229.067C348.835 228.912 325.849 226.732 302.468 215.215C323.795 213.736 365.58 209.534 391.489 199.106C392.2 198.873 392.752 198.406 393.226 197.783C419.767 160.429 441.647 121.752 458.392 82.8412C458.866 81.7521 458.787 80.5067 458.234 79.4171C457.603 78.4054 456.655 77.7052 455.47 77.4716C441.726 74.9812 427.903 74.5922 417.634 74.9038C435.011 66.1878 451.915 63.308 464.158 62.53C465.659 62.3742 467.002 61.4404 467.555 59.9617C478.377 31.3236 481.852 14.1255 481.931 13.4248C482.326 11.5572 481.299 9.76747 479.561 9.06684C477.35 8.21089 424.585 -12.1007 342.278 11.0124C341.489 11.2456 340.857 11.6351 340.383 12.2573C324.348 30.7009 312.974 55.2147 306.654 71.168C305.944 57.1602 307.286 42.6857 310.683 28.1331C311.078 26.7324 310.525 25.2537 309.419 24.3199C308.313 23.3862 306.733 23.1525 305.391 23.6972C275.533 35.9152 245.754 52.7244 216.844 73.6582C216.37 73.9698 216.054 74.4368 215.738 74.9036C202.073 98.7169 197.887 131.868 196.623 151.868C191.094 137.394 187.855 121.752 186.907 105.176C186.828 103.697 185.88 102.374 184.538 101.829C183.116 101.207 181.536 101.518 180.351 102.452C163.211 117.16 145.754 133.97 128.377 152.335C128.139 152.569 127.981 152.802 127.824 153.114C114.001 176.927 109.893 210.39 108.629 230.39C104.364 219.262 101.441 207.355 99.8612 194.904C99.7035 193.347 98.5976 192.024 97.0967 191.635C95.5169 191.246 93.937 191.713 92.9101 192.88C73.4 216.616 53.9686 242.686 35.1691 270.623C16.765 297.706 5.15338 327.122 1.44114 355.604C-2.66645 387.122 2.70472 408.912 8.78703 422.453C115.027 195.76 298.598 128.756 300.414 128.133C304.522 126.654 309.024 128.756 310.525 132.803C312.026 136.849 309.893 141.285 305.785 142.763C303.969 143.386 126.085 208.6 22.8468 429.612C21.425 432.725 20.0823 435.838 18.8973 438.795C18.9422 438.843 18.9817 438.885 19.025 438.931C9.50283 460.698 3.63221 480.005 1.11128 497.826C0.50962 502.082 3.518 506.011 7.84541 506.604C7.86373 506.607 7.88158 506.607 7.89991 506.61C35.492 510.212 65.1743 512 95.4277 512C135.593 512 176.762 508.846 215.3 502.622C222.905 501.398 230.92 499.848 238.055 495.6C247.204 490.143 252.696 481.077 252.387 471.942C252.164 465.018 248.878 459.531 245.985 454.69C244.542 452.281 243.185 450.009 242.375 447.843C238.611 437.812 245.754 425.819 254.833 420.021C265.956 412.922 280.45 411.509 293.162 410.741C313.982 409.495 335.411 409.677 356.138 409.852C393.272 410.164 431.686 410.49 468.975 402.731C493.219 397.693 507.852 386.878 511.292 371.474C514.733 356.092 505.091 341.538 494.006 333.939Z" fill="#d946ef"/>
</svg>
`;

/**
 * Add Writelyy branding for free users (text format)
 */
function addWritelyyBrandingText(content: string, isPro: boolean): string {
	if (isPro) return content;
	const branding = "\n\n---\n\nCreated with Writelyy - https://writelyy.com";
	return content + branding;
}

/**
 * Add Writelyy branding for free users (HTML format)
 */
function addWritelyyBrandingHTML(html: string, isPro: boolean): string {
	if (isPro) return html;
	const branding = `
		<hr style="margin: 2em 0; border: none; border-top: 1px solid #ddd;">
		<div style="text-align: center; margin-top: 1.5em; margin-bottom: 1em;">
			<div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
				${WRITELYY_LOGO_SVG}
				<span style="font-size: 0.9em; color: #666;">
					Created with <a href="https://writelyy.app" style="color: #d946ef; text-decoration: none; font-weight: 600;">Writelyy</a>
				</span>
			</div>
		</div>
	`;
	return html + branding;
}

/**
 * Export editor content as Markdown
 */
export function exportAsMarkdown(
	editor: Editor,
	filename = "document.md",
	isPro = false,
): void {
	const html = editor.getHTML();
	let markdown = htmlToMarkdown(html);

	// Add branding for free users
	markdown = addWritelyyBrandingText(markdown, isPro);

	// Create blob and download
	const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Export editor content as PDF using browser's print functionality
 */
export function exportAsPDF(
	editor: Editor,
	filename = "document.pdf",
	isPro = false,
): void {
	// Get HTML content
	let html = editor.getHTML();

	// Add branding for free users
	html = addWritelyyBrandingHTML(html, isPro);

	// Create a styled HTML document
	const styledHtml = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<title>${filename}</title>
			<style>
				@page {
					size: A4;
					margin: 2cm;
				}
				body {
					font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
					font-size: 12pt;
					line-height: 1.6;
					color: #000;
					max-width: 210mm;
					margin: 0 auto;
					padding: 20px;
				}
				h1, h2, h3, h4, h5, h6 {
					margin-top: 1em;
					margin-bottom: 0.5em;
					font-weight: 600;
				}
				h1 { font-size: 2em; }
				h2 { font-size: 1.5em; }
				h3 { font-size: 1.25em; }
				p { margin: 0.5em 0; }
				ul, ol { margin: 0.5em 0; padding-left: 2em; }
				li { margin: 0.25em 0; }
				blockquote {
					border-left: 4px solid #ddd;
					padding-left: 1em;
					margin: 1em 0;
					color: #666;
				}
				code {
					background: #f5f5f5;
					padding: 2px 6px;
					border-radius: 3px;
					font-family: 'Courier New', monospace;
					font-size: 0.9em;
				}
				pre {
					background: #f5f5f5;
					padding: 1em;
					border-radius: 5px;
					overflow-x: auto;
				}
				pre code {
					background: none;
					padding: 0;
				}
				table {
					border-collapse: collapse;
					width: 100%;
					margin: 1em 0;
				}
				th, td {
					border: 1px solid #ddd;
					padding: 8px;
					text-align: left;
				}
				th {
					background-color: #f5f5f5;
					font-weight: 600;
				}
				img {
					max-width: 100%;
					height: auto;
					display: block;
					margin: 1em 0;
				}
				a {
					color: #0066cc;
					text-decoration: none;
				}
				a:hover {
					text-decoration: underline;
				}
				hr {
					border: none;
					border-top: 1px solid #ddd;
					margin: 1.5em 0;
				}
				mark {
					background-color: #ffeb3b;
					padding: 2px 4px;
				}
				/* Print-specific styles */
				@media print {
					body {
						padding: 0;
					}
					a {
						color: #000;
						text-decoration: none;
					}
					a[href]:after {
						content: " (" attr(href) ")";
						font-size: 0.8em;
						color: #666;
					}
				}
			</style>
		</head>
		<body>
			${html}
		</body>
		</html>
	`;

	// Open print dialog
	const printWindow = window.open("", "_blank");
	if (printWindow) {
		printWindow.document.write(styledHtml);
		printWindow.document.close();
		printWindow.focus();

		// Wait for content to load, then trigger print
		printWindow.onload = () => {
			printWindow.print();
			// Close the window after printing (optional)
			// printWindow.close();
		};
	} else {
		alert("Please allow pop-ups to export as PDF");
	}
}

/**
 * Export editor content as DOCX (Word Document)
 * Uses HTML format with proper Word-compatible styling
 */
export function exportAsDOCX(
	editor: Editor,
	filename = "document.docx",
	isPro = false,
): void {
	let html = editor.getHTML();

	// Add branding for free users
	html = addWritelyyBrandingHTML(html, isPro);

	// Create a complete HTML document with Word-compatible styling
	const docxHtml = `
		<!DOCTYPE html>
		<html xmlns:o='urn:schemas-microsoft-com:office:office'
		      xmlns:w='urn:schemas-microsoft-com:office:word'
		      xmlns='http://www.w3.org/TR/REC-html40'>
		<head>
			<meta charset='utf-8'>
			<title>${filename}</title>
			<!--[if gte mso 9]>
			<xml>
				<w:WordDocument>
					<w:View>Print</w:View>
					<w:Zoom>100</w:Zoom>
					<w:DoNotOptimizeForBrowser/>
				</w:WordDocument>
			</xml>
			<![endif]-->
			<style>
				body {
					font-family: Calibri, Arial, sans-serif;
					font-size: 11pt;
					line-height: 1.5;
					margin: 1in;
				}
				h1, h2, h3, h4, h5, h6 {
					margin-top: 12pt;
					margin-bottom: 6pt;
					font-weight: bold;
				}
				h1 { font-size: 20pt; }
				h2 { font-size: 16pt; }
				h3 { font-size: 14pt; }
				h4 { font-size: 12pt; }
				h5 { font-size: 11pt; }
				h6 { font-size: 10pt; }
				p {
					margin: 0;
					margin-bottom: 8pt;
				}
				ul, ol {
					margin: 0;
					margin-bottom: 8pt;
					padding-left: 40px;
				}
				li {
					margin-bottom: 4pt;
				}
				table {
					border-collapse: collapse;
					width: 100%;
					margin-bottom: 12pt;
				}
				th, td {
					border: 1pt solid #000;
					padding: 4pt 8pt;
					vertical-align: top;
				}
				th {
					background-color: #f0f0f0;
					font-weight: bold;
				}
				blockquote {
					margin: 12pt 0;
					padding-left: 12pt;
					border-left: 3pt solid #ccc;
					color: #666;
				}
				code {
					font-family: 'Courier New', Courier, monospace;
					font-size: 10pt;
					background-color: #f5f5f5;
					padding: 2pt 4pt;
				}
				pre {
					font-family: 'Courier New', Courier, monospace;
					font-size: 10pt;
					background-color: #f5f5f5;
					padding: 8pt;
					margin-bottom: 12pt;
					border: 1pt solid #ddd;
				}
				img {
					max-width: 100%;
					height: auto;
				}
				a {
					color: #0563c1;
					text-decoration: underline;
				}
				mark {
					background-color: #ffff00;
				}
				hr {
					border: none;
					border-top: 1pt solid #000;
					margin: 12pt 0;
				}
			</style>
		</head>
		<body>
			${html}
		</body>
		</html>
	`;

	// Create blob with proper MIME type for Word
	const blob = new Blob(["\ufeff", docxHtml], {
		type: "application/vnd.ms-word",
	});

	// Create download link
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Main export function that handles all formats
 */
export function exportDocument(
	editor: Editor,
	format: "pdf" | "docx" | "markdown" | "html" | "txt" | "json",
	options?: {
		filename?: string;
		isPro?: boolean;
	},
): void {
	const baseFilename = options?.filename || "document";
	const isPro = options?.isPro || false;

	switch (format) {
		case "pdf":
			exportAsPDF(editor, `${baseFilename}.pdf`, isPro);
			break;

		case "docx":
			exportAsDOCX(editor, `${baseFilename}.docx`, isPro);
			break;

		case "markdown":
			exportAsMarkdown(editor, `${baseFilename}.md`, isPro);
			break;

		case "html": {
			let html = editor.getHTML();
			// Add branding for free users
			html = addWritelyyBrandingHTML(html, isPro);
			const blob = new Blob([html], { type: "text/html;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${baseFilename}.html`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			break;
		}

		case "txt": {
			let text = editor.getText();
			// Add branding for free users
			text = addWritelyyBrandingText(text, isPro);
			const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${baseFilename}.txt`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			break;
		}

		case "json": {
			const content = editor.getJSON();
			const jsonStr = JSON.stringify(content, null, 2);
			const blob = new Blob([jsonStr], {
				type: "application/json;charset=utf-8",
			});
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `${baseFilename}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			break;
		}

		default:
			console.error(`Unsupported export format: ${format}`);
	}
}
