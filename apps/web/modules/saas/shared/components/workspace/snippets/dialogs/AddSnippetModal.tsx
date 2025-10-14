"use client";

import { useState } from "react";
import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import { Plus } from "lucide-react";
import { useCreateSnippetMutation } from "@saas/snippets/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { toast } from "sonner";

export function AddSnippetModal() {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [content, setContent] = useState("");
	
	const { activeWorkspace } = useActiveWorkspace();
	const createSnippetMutation = useCreateSnippetMutation();

	const handleSave = async () => {
		if (!title.trim() || !activeWorkspace?.id) return;

		try {
			await createSnippetMutation.mutateAsync({
				organizationId: activeWorkspace.id,
				title: title.trim(),
				content: content.trim(),
				category: category.trim() || undefined,
				tags: [],
			});

			toast.success("Snippet created successfully!");
			
			// Reset form and close modal
			setTitle("");
			setCategory("");
			setContent("");
			setOpen(false);
		} catch (error) {
			toast.error("Failed to create snippet");
		}
	};

	const handleClose = () => {
		setTitle("");
		setCategory("");
		setContent("");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="primary" size="xs">
					<Plus size={14} />
					Add snippet
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add New Snippet</DialogTitle>
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

					{/* Content */}
					<div className="space-y-2">
						<Label htmlFor="snippet-content">Content</Label>
						<Textarea
							id="snippet-content"
							placeholder="Enter snippet content..."
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
						disabled={createSnippetMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={!title.trim() || createSnippetMutation.isPending}
					>
						{createSnippetMutation.isPending ? "Creating..." : "Create Snippet"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}