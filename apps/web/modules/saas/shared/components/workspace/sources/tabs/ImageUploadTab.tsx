"use client";

import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Progress } from "@ui/components/progress";
import { Upload, X } from "lucide-react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useCreateSourceMutation } from "@saas/lib/api";
import { useFileUpload } from "../utils/useFileUpload";
import { toast } from "sonner";
import { useState } from "react";

interface ImageUploadTabProps {
	onSuccess?: () => void;
}

export function ImageUploadTab({ onSuccess }: ImageUploadTabProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const createSourceMutation = useCreateSourceMutation();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const { uploadFile, uploadState, reset } = useFileUpload({
		accept: "image/*",
		maxSize: 10 * 1024 * 1024, // 10MB
		uploadType: "image",
		onSuccess: async (filePath: string) => {
			if (!selectedFile || !activeWorkspace?.id) return;

			try {
				await createSourceMutation.mutateAsync({
					name: selectedFile.name,
					organizationId: activeWorkspace.id,
					type: "image",
					filePath,
					originalFileName: selectedFile.name,
					metadata: {
						size: selectedFile.size,
						type: selectedFile.type,
						dimensions: selectedFile.type.startsWith('image/') ? await getImageDimensions(selectedFile) : undefined,
					},
				});
				
				toast.success("Image uploaded successfully");
				reset();
				setSelectedFile(null);
				onSuccess?.();
			} catch {
				toast.error("Failed to save image source");
			}
		},
		onError: (error) => {
			console.error("Upload error:", error);
		}
	});

	const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				resolve({ width: img.naturalWidth, height: img.naturalHeight });
			};
			img.src = URL.createObjectURL(file);
		});
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files?.[0] || !activeWorkspace?.id) return;

		const file = files[0];
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
							<Upload className="h-4 w-4 text-muted-foreground" />
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
							Upload Image
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
			<Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
			<Label htmlFor="image-upload" className="cursor-pointer">
				<span className="text-sm font-medium">
					Click to upload image
				</span>
				<br />
				<span className="text-xs text-muted-foreground">
					PNG, JPG, GIF up to 10MB
				</span>
			</Label>
			<Input
				id="image-upload"
				type="file"
				accept="image/*"
				className="hidden"
				onChange={handleFileSelect}
				disabled={uploadState.isUploading || createSourceMutation.isPending}
			/>
		</div>
	);
}