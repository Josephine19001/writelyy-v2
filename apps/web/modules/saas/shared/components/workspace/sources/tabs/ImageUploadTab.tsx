"use client";

import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Upload } from "lucide-react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useCreateSourceMutation } from "@saas/lib/api";
import { toast } from "sonner";

interface ImageUploadTabProps {
	onSuccess?: () => void;
}

export function ImageUploadTab({ onSuccess }: ImageUploadTabProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const createSourceMutation = useCreateSourceMutation();

	const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files?.[0] || !activeWorkspace?.id) return;

		const file = files[0];
		
		// In a real implementation, you'd upload to your storage service first
		// For now, we'll simulate with a placeholder path
		const filePath = `/uploads/${Date.now()}-${file.name}`;

		try {
			await createSourceMutation.mutateAsync({
				name: file.name,
				organizationId: activeWorkspace.id,
				type: "image",
				filePath,
				originalFileName: file.name,
				metadata: {
					size: file.size,
					type: file.type,
				},
			});
			
			toast.success("Image uploaded successfully");
			onSuccess?.();
		} catch {
			toast.error("Failed to upload image");
		}
	};

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
				onChange={handleImageUpload}
				disabled={createSourceMutation.isPending}
			/>
		</div>
	);
}