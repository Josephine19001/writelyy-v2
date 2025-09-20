"use client";

import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useDeleteSourceMutation } from "@saas/lib/api";
import { toast } from "sonner";

interface SourceContextMenuProps {
	sourceId: string;
}

export function SourceContextMenu({ sourceId }: SourceContextMenuProps) {
	const deleteSourceMutation = useDeleteSourceMutation();

	const handleDelete = async () => {
		try {
			await deleteSourceMutation.mutateAsync({ id: sourceId });
			toast.success("Source deleted successfully");
		} catch {
			toast.error("Failed to delete source");
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
				<DropdownMenuItem onClick={handleDelete} className="text-destructive">
					<Trash2 className="h-4 w-4 mr-2" />
					Delete source
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}