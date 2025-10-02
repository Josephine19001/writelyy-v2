"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { MoreHorizontal, Trash2, Edit3, Plus, Sparkles } from "lucide-react";
import { useDeleteSourceMutation, useUpdateSourceMutation } from "@saas/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import type { Source } from "../types";

interface SourceContextMenuProps {
	sourceId: string;
	source: Source;
	onInsertSource?: (source: Source) => void;
	onUseAsAIContext?: (source: Source) => void;
}

export function SourceContextMenu({ sourceId, source, onInsertSource, onUseAsAIContext }: SourceContextMenuProps) {
	const deleteSourceMutation = useDeleteSourceMutation();
	const updateSourceMutation = useUpdateSourceMutation();
	const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
	const [newName, setNewName] = useState(source.name);

	// Determine if source is insertable (images, links) or needs AI context (PDFs, docs)
	const isInsertable = ['image', 'url'].includes(source.type);

	const handleDelete = async () => {
		try {
			await deleteSourceMutation.mutateAsync({ id: sourceId });
			toast.success("Source deleted successfully");
		} catch {
			toast.error("Failed to delete source");
		}
	};

	const handleRename = async () => {
		try {
			await updateSourceMutation.mutateAsync({ 
				id: sourceId, 
				name: newName.trim() 
			});
			toast.success("Source renamed successfully");
			setIsRenameDialogOpen(false);
		} catch {
			toast.error("Failed to rename source");
		}
	};

	const handleActionClick = (action: 'insert' | 'ai') => {
		if (action === 'insert' && onInsertSource) {
			onInsertSource(source);
		} else if (action === 'ai' && onUseAsAIContext) {
			onUseAsAIContext(source);
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm"
					>
						<MoreHorizontal className="h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					{isInsertable ? (
						<DropdownMenuItem onClick={() => handleActionClick('insert')}>
							<Plus className="h-4 w-4 mr-2" />
							Insert into document
						</DropdownMenuItem>
					) : (
						<DropdownMenuItem onClick={() => handleActionClick('ai')}>
							<Sparkles className="h-4 w-4 mr-2" />
							Use as AI context
						</DropdownMenuItem>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setIsRenameDialogOpen(true)}>
						<Edit3 className="h-4 w-4 mr-2" />
						Rename
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleDelete} className="text-destructive">
						<Trash2 className="h-4 w-4 mr-2" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Rename Dialog */}
			<Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Rename Source</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="name" className="text-right">
								Name
							</Label>
							<Input
								id="name"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								className="col-span-3"
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleRename();
									}
								}}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
							Cancel
						</Button>
						<Button 
							onClick={handleRename}
							disabled={!newName.trim() || updateSourceMutation.isPending}
						>
							{updateSourceMutation.isPending ? 'Renaming...' : 'Rename'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}