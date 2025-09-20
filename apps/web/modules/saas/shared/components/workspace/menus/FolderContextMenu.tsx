"use client";

import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useDeleteFolderMutation } from "@saas/lib/api";
import { toast } from "sonner";
import { CreateItemDialog } from "../dialogs/CreateItemDialog";

interface FolderContextMenuProps {
	folderId: string;
	onDelete?: () => void;
}

export function FolderContextMenu({
	folderId,
	onDelete,
}: FolderContextMenuProps) {
	const deleteFolderMutation = useDeleteFolderMutation();

	const handleDelete = async () => {
		try {
			await deleteFolderMutation.mutateAsync({
				id: folderId,
				deleteContents: false, // Move contents to parent
			});
			toast.success("Folder deleted successfully");
			onDelete?.();
		} catch (error) {
			toast.error("Failed to delete folder");
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
				<CreateItemDialog type="folder" parentFolderId={folderId} />
				<CreateItemDialog type="document" parentFolderId={folderId} />
				<DropdownMenuItem onClick={handleDelete} className="text-destructive">
					<Trash2 className="h-4 w-4 mr-2" />
					Delete folder
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}