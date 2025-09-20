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
		default:
			return null;
	}
}