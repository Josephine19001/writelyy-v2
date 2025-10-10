"use client";

import { useState, useEffect } from "react";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { 
	Dialog, 
	DialogContent, 
	DialogHeader, 
	DialogTitle,
	DialogFooter 
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";

interface CreateSnippetModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: { title: string; category?: string; content: string }) => Promise<void>;
	selectedText: string;
	isLoading?: boolean;
}

export function CreateSnippetModal({
	isOpen,
	onClose,
	onSave,
	selectedText,
	isLoading = false,
}: CreateSnippetModalProps) {
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [content, setContent] = useState(selectedText);

	// Update content when selectedText changes or modal opens
	useEffect(() => {
		if (isOpen && selectedText) {
			setContent(selectedText);
		}
	}, [isOpen, selectedText]);

	const handleSave = async () => {
		if (!title.trim()) return;

		try {
			await onSave({
				title: title.trim(),
				category: category.trim() || undefined,
				content: content.trim(),
			});
			
			// Reset form
			setTitle("");
			setCategory("");
			setContent("");
			onClose();
		} catch (error) {
			// Error handling is done in parent component
		}
	};

	const handleClose = () => {
		setTitle("");
		setCategory("");
		setContent(selectedText);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create New Snippet</DialogTitle>
				</DialogHeader>
				
				<div className="space-y-4">
					{/* Title */}
					<div className="space-y-2">
						<Label htmlFor="snippet-title">Title *</Label>
						<Input
							id="snippet-title"
							placeholder="Enter snippet title..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							autoFocus
						/>
					</div>

					{/* Category */}
					<div className="space-y-2">
						<Label htmlFor="snippet-category">Category</Label>
						<Input
							id="snippet-category"
							placeholder="e.g., Templates, Boilerplate, Quotes..."
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						/>
					</div>

					{/* Content Preview */}
					<div className="space-y-2">
						<Label htmlFor="snippet-content">Content</Label>
						<Textarea
							id="snippet-content"
							value={content}
							onChange={(e) => setContent(e.target.value)}
							rows={6}
							className="resize-none"
						/>
						<p className="text-xs text-muted-foreground">
							{content.length} characters
						</p>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={!title.trim() || isLoading}
					>
						{isLoading ? "Creating..." : "Create Snippet"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}