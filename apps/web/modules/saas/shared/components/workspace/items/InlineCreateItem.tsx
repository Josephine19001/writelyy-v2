"use client";

import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { File, Folder, Plus, X, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import {
	useCreateDocumentMutation,
	useCreateFolderMutation,
} from "@saas/lib/api";
import { toast } from "sonner";

interface InlineCreateItemProps {
	type: "folder" | "document";
	parentFolderId?: string;
	level?: number;
	onCancel: () => void;
	onSuccess?: () => void;
}

export function InlineCreateItem({
	type,
	parentFolderId,
	level = 0,
	onCancel,
	onSuccess,
}: InlineCreateItemProps) {
	const [name, setName] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const { activeWorkspace } = useActiveWorkspace();
	const createDocumentMutation = useCreateDocumentMutation();
	const createFolderMutation = useCreateFolderMutation();

	useEffect(() => {
		// Focus input when component mounts
		inputRef.current?.focus();
	}, []);

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
			
			onSuccess?.();
		} catch (error) {
			toast.error(`Failed to create ${type}`);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			onCancel();
		}
	};

	return (
		<div className="group flex items-center justify-between rounded-sm bg-primary/5 border border-primary/20">
			<form onSubmit={handleSubmit} className="flex-1 flex items-center">
				<div className="flex items-center space-x-2 p-1 px-2" style={{ paddingLeft: `${0.5 + level * 1.25}rem` }}>
					{type === "folder" ? (
						<Folder className="h-4 w-4 text-blue-500" />
					) : (
						<File className="h-4 w-4 text-gray-500" />
					)}
					<Input
						ref={inputRef}
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={`${type === "folder" ? "Folder" : "Document"} name`}
						className="h-auto border-none bg-transparent p-0 text-xs focus-visible:ring-0"
						onBlur={(e) => {
							// Only cancel if clicking outside and not on action buttons
							const relatedTarget = e.relatedTarget as HTMLElement;
							if (!relatedTarget?.closest('.inline-create-actions')) {
								onCancel();
							}
						}}
					/>
				</div>
			</form>
			<div className="inline-create-actions flex items-center space-x-1 pr-1">
				<Button
					type="submit"
					variant="ghost"
					size="sm"
					className="h-auto w-auto p-1"
					onClick={handleSubmit}
					disabled={!name.trim()}
				>
					<Check className="h-3 w-3 text-green-600" />
				</Button>
				<Button
					variant="ghost"
					size="sm"
					className="h-auto w-auto p-1"
					onClick={onCancel}
				>
					<X className="h-3 w-3 text-red-600" />
				</Button>
			</div>
		</div>
	);
}