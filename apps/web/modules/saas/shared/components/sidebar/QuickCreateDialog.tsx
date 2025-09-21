"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { FileText, FolderPlus } from "lucide-react";
import { useState } from "react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import {
	useCreateDocumentMutation,
	useCreateFolderMutation,
} from "@saas/lib/api";
import { toast } from "sonner";
import { useEditorContext } from "../NewAppWrapper";

interface QuickCreateDialogProps {
	type: "document" | "folder";
}

export function QuickCreateDialog({ type }: QuickCreateDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const { activeWorkspace } = useActiveWorkspace();
	const { selectedFolderId } = useEditorContext();
	const createDocumentMutation = useCreateDocumentMutation();
	const createFolderMutation = useCreateFolderMutation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !activeWorkspace?.id) return;

		try {
			if (type === "document") {
				await createDocumentMutation.mutateAsync({
					title: name.trim(),
					organizationId: activeWorkspace.id,
					folderId: selectedFolderId,
				});
				toast.success(`Document created successfully${selectedFolderId ? ' in selected folder' : ''}`);
			} else {
				await createFolderMutation.mutateAsync({
					name: name.trim(),
					organizationId: activeWorkspace.id,
					parentFolderId: selectedFolderId,
				});
				toast.success(`Folder created successfully${selectedFolderId ? ' in selected folder' : ''}`);
			}
			
			setName("");
			setOpen(false);
		} catch {
			toast.error(`Failed to create ${type}`);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
					{type === "document" ? (
						<FileText className="h-4 w-4" />
					) : (
						<FolderPlus className="h-4 w-4" />
					)}
				</Button>
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
							disabled={!name.trim() || createDocumentMutation.isPending || createFolderMutation.isPending}
						>
							Create
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}