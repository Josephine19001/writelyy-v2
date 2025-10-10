"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreateSnippetMutation } from "@saas/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { SnippetIcon } from "@shared/tiptap/components/tiptap-icons/snippet-icon";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import { CreateSnippetModal } from "./create-snippet-modal";

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

export function SnippetButton() {
	const { editor } = useTiptapEditor();
	const { activeWorkspace } = useActiveWorkspace();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [selectedTextForSnippet, setSelectedTextForSnippet] = useState("");
	
	const createSnippetMutation = useCreateSnippetMutation();

	// Check if user has any text selected
	const hasSelection = editor?.state.selection && !editor.state.selection.empty;

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

		try {
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

			// Show success toast
			toast.success(`Snippet "${data.title}" created successfully!`);
		} catch (error) {
			// Show error toast
			toast.error("Failed to create snippet. Please try again.");
			throw error; // Re-throw so modal can handle it
		}
	};

	// Only show when text is selected
	if (!hasSelection) {
		return null;
	}

	return (
		<>
			<Button
				type="button"
				data-style="ghost"
				role="button"
				tabIndex={-1}
				tooltip="Turn into Snippet"
				onClick={handleOpenCreateModal}
			>
				Snippet
			</Button>

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