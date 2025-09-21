"use client";

import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useDeleteDocumentMutation } from "@saas/lib/api";
import { toast } from "sonner";

interface DocumentContextMenuProps {
	documentId: string;
	onDelete?: () => void;
	onRename?: () => void;
}

export function DocumentContextMenu({
	documentId,
	onDelete,
	onRename,
}: DocumentContextMenuProps) {
	const deleteDocumentMutation = useDeleteDocumentMutation();

	const handleDelete = async () => {
		try {
			await deleteDocumentMutation.mutateAsync({ id: documentId });
			toast.success("Document deleted successfully");
			onDelete?.();
		} catch (error) {
			toast.error("Failed to delete document");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-auto w-auto p-1 opacity-0 group-hover:opacity-100"
				>
					<MoreHorizontal className="h-3 w-3" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={onRename}>
					<Edit className="h-4 w-4 mr-2" />
					Rename
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleDelete} className="text-destructive">
					<Trash2 className="h-4 w-4 mr-2" />
					Delete document
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}