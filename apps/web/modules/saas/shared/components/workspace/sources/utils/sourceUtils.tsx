import { File, FileImage, Image, Link } from "lucide-react";

export function getSourceIcon(type: string) {
	switch (type) {
		case "image":
			return <Image className="h-4 w-4 text-green-600" />;
		case "pdf":
			return <FileImage className="h-4 w-4 text-red-600" />;
		case "doc":
		case "docx":
			return <File className="h-4 w-4 text-blue-600" />;
		case "url":
			return <Link className="h-4 w-4 text-purple-600" />;
		default:
			return <File className="h-4 w-4 text-gray-600" />;
	}
}

export function getProcessingStatus(status: string) {
	switch (status) {
		case "pending":
			return "Processing...";
		case "processing":
			return "Processing...";
		case "failed":
			return "Failed";
		case "completed":
			return null; // Don't show status for completed sources
		default:
			return null;
	}
}

export function getSourceTypeLabel(type: string) {
	switch (type) {
		case "image":
			return "Image";
		case "pdf":
			return "PDF";
		case "doc":
			return "DOC";
		case "docx":
			return "DOCX";
		case "url":
			return "Link";
		default:
			return "File";
	}
}

export function formatFileSize(bytes: number) {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}