"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Copy, FileText } from "lucide-react";
import { toast } from "sonner";

interface Snippet {
	id: string;
	title: string;
	content: string;
	category?: string | null;
	tags: string[];
	createdAt: Date;
	creator: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

interface ViewSnippetModalProps {
	snippet: Snippet | null;
	isOpen: boolean;
	onClose: () => void;
	onInsert?: (snippet: Snippet) => void;
}

export function ViewSnippetModal({
	snippet,
	isOpen,
	onClose,
	onInsert,
}: ViewSnippetModalProps) {
	if (!snippet) return null;

	const handleCopyContent = async () => {
		try {
			await navigator.clipboard.writeText(snippet.content);
			toast.success("Content copied to clipboard");
		} catch (error) {
			toast.error("Failed to copy content");
		}
	};

	const handleInsert = () => {
		onInsert?.(snippet);
		onClose();
	};

	const formattedDate = new Date(snippet.createdAt).toLocaleDateString();

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<FileText className="h-5 w-5 text-muted-foreground" />
						<DialogTitle className="truncate">
							{snippet.title}
						</DialogTitle>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-hidden flex flex-col space-y-4">
					{/* Metadata */}
					<div className="flex items-center justify-between text-sm text-muted-foreground border-b pb-3">
						<div className="flex items-center gap-4">
							{snippet.category && (
								<span className="bg-muted px-2 py-1 rounded text-xs">
									{snippet.category}
								</span>
							)}
							<span>Created {formattedDate}</span>
						</div>
						<span>by {snippet.creator.name}</span>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-hidden">
						<div className="text-sm font-medium text-muted-foreground mb-2">
							Content
						</div>
						<div className="bg-muted/30 rounded-md p-4 text-sm overflow-y-auto max-h-[300px] font-mono whitespace-pre-wrap border">
							{snippet.content}
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-between pt-3 border-t">
						<div className="flex items-center gap-2">
							{onInsert && (
								<Button size="sm" onClick={handleInsert}>
									Insert into Document
								</Button>
							)}
						</div>

						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleCopyContent}
								className="gap-2"
							>
								<Copy className="h-4 w-4" />
								Copy Content
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
