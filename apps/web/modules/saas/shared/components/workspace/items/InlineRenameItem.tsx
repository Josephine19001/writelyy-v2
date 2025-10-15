"use client";

import { useUpdateFolderMutation } from "@saas/folders/lib/api";
import { useUpdateDocumentMutation } from "@saas/lib/api";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Check, File, Folder, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useTabManager } from "../../../hooks/use-tab-manager";
import { useTabContext } from "../../providers/TabProvider";

interface InlineRenameItemProps {
	type: "folder" | "document";
	itemId: string;
	currentName: string;
	level?: number;
	onCancel: () => void;
	onSuccess?: (newName: string) => void;
}

export function InlineRenameItem({
	type,
	itemId,
	currentName,
	level = 0,
	onCancel,
	onSuccess,
}: InlineRenameItemProps) {
	const [name, setName] = useState(currentName);
	const inputRef = useRef<HTMLInputElement>(null);
	const updateDocumentMutation = useUpdateDocumentMutation();
	const updateFolderMutation = useUpdateFolderMutation();
	const { updateTabDocument } = useTabContext();
	const { updateTabTitle } = useTabManager();

	useEffect(() => {
		// Focus input and select all text when component mounts
		if (inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, []);

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!name.trim() || name.trim() === currentName) {
			onCancel();
			return;
		}

		const newName = name.trim();

		// Immediately call onSuccess with new name for optimistic UI update
		onSuccess?.(newName);

		try {
			if (type === "folder") {
				await updateFolderMutation.mutateAsync({
					id: itemId,
					name: newName,
				});
			} else {
				const updatedDocument =
					await updateDocumentMutation.mutateAsync({
						id: itemId,
						title: newName,
					});

				// Update any open tabs with the new document title
				updateTabDocument(itemId, updatedDocument);

				// Update browser tab title as well
				const tabId = `doc-${itemId}`;
				updateTabTitle(tabId, newName);
			}
		} catch {
			toast.error(`Failed to rename ${type}`);
			// Note: Parent should handle re-opening rename if needed
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			onCancel();
		}
	};

	return (
		<div className="group flex items-center justify-between rounded-sm bg-primary/5 border border-primary/20 relative">
			{/* Tree lines for proper indentation */}
			{level > 0 && (
				<div className="absolute left-0 top-0 bottom-0 pointer-events-none">
					{/* Add tree line spacing to match parent hierarchy */}
					<div
						className="absolute top-0 w-2 h-1/2 border-l border-b border-border/30"
						style={{
							left: `${8 + (level - 1) * 16.5}px`,
							borderBottomLeftRadius: "2px",
						}}
					/>
				</div>
			)}

			<form onSubmit={handleSubmit} className="flex-1 flex items-center">
				<div
					className="flex items-center space-x-2 p-1 px-2"
					style={{ paddingLeft: `${0.5 + level * 1.25}rem` }}
				>
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
							const relatedTarget =
								e.relatedTarget as HTMLElement;
							if (
								!relatedTarget?.closest(
									".inline-rename-actions",
								)
							) {
								onCancel();
							}
						}}
					/>
				</div>
			</form>
			<div className="inline-rename-actions flex items-center space-x-1 pr-1">
				<Button
					type="submit"
					variant="ghost"
					size="sm"
					className="h-auto w-auto p-1"
					onClick={handleSubmit}
					disabled={!name.trim() || name.trim() === currentName}
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
