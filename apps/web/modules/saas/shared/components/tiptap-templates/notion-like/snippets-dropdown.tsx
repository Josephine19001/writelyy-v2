"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { useSnippetsQuery, useCreateSnippetMutation } from "@saas/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { SnippetIcon } from "@shared/tiptap/components/tiptap-icons/snippet-icon";
import { ChevronDownIcon } from "@shared/tiptap/components/tiptap-icons/chevron-down-icon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/dropdown-menu";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import { CreateSnippetModal } from "./create-snippet-modal";

interface Snippet {
	id: string;
	title: string;
	content: string;
	category?: string | null;
	tags: string[];
	createdBy: string;
	creator: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	};
}

// Simple separator component
const Separator = () => (
	<div className="h-px bg-border mx-1 my-1" />
);

// Helper function to extract text content from selection
const getSelectedTextContent = (editor: any) => {
	if (!editor) {
		return "";
	}
	
	const { from, to } = editor.state.selection;
	if (from === to) {
		return ""; // No selection
	}
	
	// Get the selected text content
	const selectedText = editor.state.doc.textBetween(from, to, " ");
	return selectedText.trim();
};

// Helper function to extract rich content from selection
const getSelectedRichContent = (editor: any) => {
	if (!editor) {
		return null;
	}
	
	const { from, to } = editor.state.selection;
	if (from === to) {
		return null; // No selection
	}
	
	// Get the selected content as JSON
	const selectedContent = editor.state.doc.slice(from, to);
	return selectedContent.toJSON();
};

export function SnippetsDropdown() {
	const { editor } = useTiptapEditor();
	const { activeWorkspace } = useActiveWorkspace();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedTextForSnippet, setSelectedTextForSnippet] = useState("");
	
	const { data: snippetsData } = useSnippetsQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id }
	);
	
	const createSnippetMutation = useCreateSnippetMutation();

	const snippets = snippetsData?.snippets || [];
	
	// Group snippets by category for better organization
	const groupedSnippets = useMemo(() => {
		const groups: Record<string, Snippet[]> = {};
		snippets.forEach((snippet: Snippet) => {
			const category = snippet.category || "General";
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(snippet);
		});
		return groups;
	}, [snippets]);

	const handleSnippetInsert = async (snippet: Snippet) => {
		if (!editor) {
			return;
		}

		try {
			// Parse the snippet content and insert it
			const contentToInsert = snippet.content;
			
			// Insert the snippet content at current cursor position
			editor
				.chain()
				.focus()
				.insertContent(contentToInsert)
				.run();

			// Link snippet to document for tracking (if we have document context)
			// Note: We'd need document ID from context - for now just log
			console.log(`📄 Inserted snippet: ${snippet.title}`);
			
		} catch (error) {
			console.error("❌ Failed to insert snippet:", error);
		}
	};

	const handleOpenCreateModal = () => {
		if (!editor) {
			return;
		}

		const selectedText = getSelectedTextContent(editor);
		if (!selectedText) {
			return;
		}

		setSelectedTextForSnippet(selectedText);
		setIsCreateModalOpen(true);
	};

	const handleCreateSnippet = async (data: { title: string; category?: string; content: string }) => {
		if (!activeWorkspace) {
			throw new Error("No active workspace");
		}

		const selectedRichContent = getSelectedRichContent(editor);

		await createSnippetMutation.mutateAsync({
			title: data.title,
			content: data.content,
			organizationId: activeWorkspace.id,
			category: data.category,
			tags: [], // Could auto-extract keywords from content
			metadata: {
				createdFrom: "selection",
				richContent: selectedRichContent,
				originalLength: data.content.length,
				createdAt: new Date().toISOString(),
			},
		});
	};

	// Check if user has any text selected
	const hasSelection = editor?.state.selection && !editor.state.selection.empty;

	return (
		<>
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					role="button"
					tabIndex={-1}
					tooltip="Snippets - reusable content blocks"
					className="flex items-center gap-1"
				>
					<SnippetIcon className="tiptap-button-icon" />
					<ChevronDownIcon className="h-3 w-3" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="center" side="top" sideOffset={8} className="min-w-64">
				{/* Create snippet from selection */}
				{hasSelection && (
					<>
						<DropdownMenuItem
							onClick={handleOpenCreateModal}
							className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md mb-2"
						>
							<PlusIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
							<div className="flex flex-col items-start">
								<span className="font-medium text-blue-700 dark:text-blue-300">
									💡 Turn into Snippet
								</span>
								<span className="text-xs text-blue-600 dark:text-blue-400">
									Save selected text as reusable snippet
								</span>
							</div>
						</DropdownMenuItem>
						<Separator />
					</>
				)}

				{/* List existing snippets */}
				{Object.keys(groupedSnippets).length === 0 ? (
					<DropdownMenuItem disabled className="text-center py-4">
						<div className="flex flex-col items-center gap-2">
							<SnippetIcon className="h-8 w-8 text-muted-foreground" />
							<div className="text-sm text-muted-foreground">
								No snippets yet
							</div>
							<div className="text-xs text-muted-foreground">
								Select text and create your first snippet
							</div>
						</div>
					</DropdownMenuItem>
				) : (
					Object.entries(groupedSnippets).map(([category, categorySnippets]) => (
						<div key={category}>
							{/* Category header */}
							<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								{category}
							</div>
							
							{/* Snippets in this category */}
							{categorySnippets.map((snippet: Snippet) => (
								<DropdownMenuItem
									key={snippet.id}
									onClick={() => handleSnippetInsert(snippet)}
									className="flex flex-col items-start gap-1 min-w-48 py-2"
								>
									<div className="flex items-center justify-between w-full">
										<div className="font-medium text-sm truncate">
											{snippet.title}
										</div>
										{snippet.tags.length > 0 && (
											<div className="flex gap-1">
												{snippet.tags.slice(0, 2).map(tag => (
													<span 
														key={tag}
														className="text-xs bg-muted px-1 rounded"
													>
														#{tag}
													</span>
												))}
											</div>
										)}
									</div>
									<div className="text-xs text-muted-foreground line-clamp-2 w-full">
										{snippet.content.slice(0, 100)}
										{snippet.content.length > 100 ? "..." : ""}
									</div>
									<div className="text-xs text-muted-foreground">
										by {snippet.creator.name}
									</div>
								</DropdownMenuItem>
							))}
							
							{/* Separator between categories */}
							{Object.keys(groupedSnippets).indexOf(category) < Object.keys(groupedSnippets).length - 1 && (
								<Separator />
							)}
						</div>
					))
				)}
			</DropdownMenuContent>
		</DropdownMenu>

		{/* Create Snippet Modal */}
		<CreateSnippetModal
			isOpen={isCreateModalOpen}
			onClose={() => setIsCreateModalOpen(false)}
			onSave={handleCreateSnippet}
			selectedText={selectedTextForSnippet}
			isLoading={createSnippetMutation.isPending}
		/>
	</>
	);
}