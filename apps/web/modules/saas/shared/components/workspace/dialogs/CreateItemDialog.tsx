"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import {
	DropdownMenuItem,
} from "@ui/components/dropdown-menu";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { FileText, FolderPlus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import {
	useCreateDocumentMutation,
	useCreateFolderMutation,
} from "@saas/lib/api";
import { toast } from "sonner";

interface CreateItemDialogProps {
	type: "folder" | "document";
	parentFolderId?: string;
	onSuccess?: () => void;
	children?: ReactNode;
}

export function CreateItemDialog({
	type,
	parentFolderId,
	onSuccess,
	children,
}: CreateItemDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const { activeWorkspace } = useActiveWorkspace();
	const createFolderMutation = useCreateFolderMutation();
	const createDocumentMutation = useCreateDocumentMutation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !activeWorkspace?.id) return;

		try {
			if (type === "folder") {
				await createFolderMutation.mutateAsync({
					name: name.trim(),
					organizationId: activeWorkspace.id,
					parentFolderId,
				});
				toast.success("Folder created successfully");
			} else {
				await createDocumentMutation.mutateAsync({
					title: name.trim(),
					organizationId: activeWorkspace.id,
					folderId: parentFolderId,
				});
				toast.success("Document created successfully");
			}
			
			setName("");
			setOpen(false);
			onSuccess?.();
		} catch (error) {
			toast.error(`Failed to create ${type}`);
		}
	};

	const trigger = children ? (
		children
	) : (
		<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
			{type === "folder" ? (
				<FolderPlus className="h-4 w-4 mr-2" />
			) : (
				<FileText className="h-4 w-4 mr-2" />
			)}
			New {type}
		</DropdownMenuItem>
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create {type}</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">
							{type === "folder" ? "Folder" : "Document"} name
						</Label>
						<Input
							id="name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder={`Enter ${type} name`}
							autoFocus
						/>
					</div>
					<div className="flex justify-end space-x-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!name.trim() || createFolderMutation.isPending || createDocumentMutation.isPending}
						>
							Create
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}