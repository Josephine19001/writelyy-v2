"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Button } from "@ui/components/button";
import { FileText, Plus } from "lucide-react";
import * as React from "react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useSnippetsQuery } from "@saas/snippets/lib/api";

interface SnippetsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSnippetSelect?: (snippet: any) => void;
}

export function SnippetsModal({
	open,
	onOpenChange,
	onSnippetSelect,
}: SnippetsModalProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const { data: snippetsData } = useSnippetsQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id }
	);

	const snippets = snippetsData?.snippets || [];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						<DialogTitle>Snippets</DialogTitle>
					</div>
					<DialogDescription>
						Reusable text snippets for quick insertion.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 space-y-3">
					{/* Create new snippet button */}
					<Button
						variant="outline"
						className="w-full justify-start gap-2 hover:bg-accent"
						onClick={() => {
							console.log("Create new snippet");
							// Handle create new snippet
						}}
					>
						<Plus className="h-4 w-4" />
						<span>Create new snippet</span>
					</Button>

					{/* List of snippets */}
					{snippets.length > 0 ? (
						<div className="space-y-2">
							{snippets.map((snippet: any) => (
								<Button
									key={snippet.id}
									variant="outline"
									className="w-full h-auto flex flex-col items-start p-4 hover:bg-accent hover:border-primary transition-all"
									onClick={() => {
										onSnippetSelect?.(snippet);
										onOpenChange(false);
									}}
								>
									<div className="font-medium text-sm">{snippet.name}</div>
									<div className="text-xs text-muted-foreground mt-1 line-clamp-2 text-left">
										{snippet.content}
									</div>
								</Button>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							<FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
							<p>No snippets yet</p>
							<p className="text-sm mt-1">Create your first snippet to get started</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
