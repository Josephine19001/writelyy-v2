"use client";

import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Progress } from "@ui/components/progress";
import { FileImage, X } from "lucide-react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useCreateSourceMutation } from "@saas/lib/api";
import { useFileUpload } from "../utils/useFileUpload";
import { toast } from "sonner";
import { useState } from "react";

interface DocumentUploadTabProps {
	onSuccess?: () => void;
}

export function DocumentUploadTab({ onSuccess }: DocumentUploadTabProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const createSourceMutation = useCreateSourceMutation();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const { uploadFile, uploadState, reset } = useFileUpload({
		accept: "application/*",
		maxSize: 50 * 1024 * 1024, // 50MB
		uploadType: "document",
		onSuccess: async (filePath: string) => {
			if (!selectedFile || !activeWorkspace?.id) return;

			const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
			let sourceType: "pdf" | "doc" | "docx" = "pdf";
			if (fileExtension === "doc") sourceType = "doc";
			if (fileExtension === "docx") sourceType = "docx";

			try {
				await createSourceMutation.mutateAsync({
					name: selectedFile.name,
					organizationId: activeWorkspace.id,
					type: sourceType,
					filePath,
					originalFileName: selectedFile.name,
					metadata: {
						size: selectedFile.size,
						type: selectedFile.type,
						pageCount: sourceType === "pdf" ? await getPDFPageCount(selectedFile) : undefined,
					},
				});
				
				toast.success("Document uploaded successfully");
				reset();
				setSelectedFile(null);
				onSuccess?.();
			} catch {
				toast.error("Failed to save document source");
			}
		},
		onError: (error) => {
			console.error("Upload error:", error);
		}
	});

	const getPDFPageCount = async (file: File): Promise<number | undefined> => {
		try {
			// This is a simplified check - in a real implementation, you'd use a PDF parsing library
			const arrayBuffer = await file.arrayBuffer();
			const text = new TextDecoder().decode(arrayBuffer);
			const matches = text.match(/\/Count\s+(\d+)/);
			return matches ? parseInt(matches[1], 10) : undefined;
		} catch {
			return undefined;
		}
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files?.[0] || !activeWorkspace?.id) return;

		const file = files[0];
		const fileExtension = file.name.split('.').pop()?.toLowerCase();
		
		if (!['pdf', 'doc', 'docx'].includes(fileExtension || '')) {
			toast.error("Please select a PDF, DOC, or DOCX file");
			return;
		}

		setSelectedFile(file);
	};

	const handleUpload = async () => {
		if (!selectedFile) return;
		await uploadFile(selectedFile);
	};

	const handleCancel = () => {
		setSelectedFile(null);
		reset();
	};

	if (selectedFile) {
		return (
			<div className="space-y-4">
				<div className="border rounded-lg p-4">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center space-x-2">
							<FileImage className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm font-medium">{selectedFile.name}</span>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCancel}
							disabled={uploadState.isUploading}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
					
					<div className="text-xs text-muted-foreground mb-2">
						{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
					</div>

					{uploadState.isUploading && (
						<div className="space-y-2">
							<Progress value={uploadState.progress} className="h-2" />
							<div className="text-xs text-muted-foreground text-center">
								Uploading... {Math.round(uploadState.progress)}%
							</div>
						</div>
					)}

					{uploadState.error && (
						<div className="text-xs text-destructive mt-2">
							{uploadState.error}
						</div>
					)}

					{!uploadState.isUploading && !uploadState.error && (
						<Button 
							onClick={handleUpload} 
							className="w-full mt-2"
							disabled={createSourceMutation.isPending}
						>
							Upload Document
						</Button>
					)}
				</div>
			</div>
		);
	}

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
				onChange={handleFileSelect}
				disabled={uploadState.isUploading || createSourceMutation.isPending}
			/>
		</div>
	);
}