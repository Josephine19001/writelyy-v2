"use client";

import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { FileImage } from "lucide-react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useCreateSourceMutation } from "@saas/lib/api";
import { toast } from "sonner";

interface DocumentUploadTabProps {
	onSuccess?: () => void;
}

export function DocumentUploadTab({ onSuccess }: DocumentUploadTabProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const createSourceMutation = useCreateSourceMutation();

	const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files?.[0] || !activeWorkspace?.id) return;

		const file = files[0];
		const fileExtension = file.name.split('.').pop()?.toLowerCase();
		
		let sourceType: "pdf" | "doc" | "docx" = "pdf";
		if (fileExtension === "doc") sourceType = "doc";
		if (fileExtension === "docx") sourceType = "docx";

		// In a real implementation, you'd upload to your storage service first
		const filePath = `/uploads/${Date.now()}-${file.name}`;

		try {
			await createSourceMutation.mutateAsync({
				name: file.name,
				organizationId: activeWorkspace.id,
				type: sourceType,
				filePath,
				originalFileName: file.name,
				metadata: {
					size: file.size,
					type: file.type,
				},
			});
			
			toast.success("Document uploaded successfully");
			onSuccess?.();
		} catch {
			toast.error("Failed to upload document");
		}
	};

	return (
		<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
			<FileImage className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
			<Label htmlFor="document-upload" className="cursor-pointer">
				<span className="text-sm font-medium">
					Click to upload document
				</span>
				<br />
				<span className="text-xs text-muted-foreground">
					PDF, DOC, DOCX up to 50MB
				</span>
			</Label>
			<Input
				id="document-upload"
				type="file"
				accept=".pdf,.doc,.docx"
				className="hidden"
				onChange={handleDocumentUpload}
				disabled={createSourceMutation.isPending}
			/>
		</div>
	);
}