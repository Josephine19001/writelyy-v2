"use client";

import { useState } from "react";
import { toast } from "sonner";

export interface FileUploadOptions {
	accept: string;
	maxSize: number;
	uploadType: "image" | "document";
	onProgress?: (progress: number) => void;
	onError?: (error: Error) => void;
	onSuccess?: (filePath: string) => void;
}

export interface UploadState {
	isUploading: boolean;
	progress: number;
	error: string | null;
}

export function useFileUpload(options: FileUploadOptions) {
	const [uploadState, setUploadState] = useState<UploadState>({
		isUploading: false,
		progress: 0,
		error: null,
	});

	const uploadFile = async (file: File): Promise<string | null> => {
		// Validate file size
		if (file.size > options.maxSize) {
			const maxSizeMB = Math.round(options.maxSize / (1024 * 1024));
			const error = new Error(`File size exceeds ${maxSizeMB}MB limit`);
			options.onError?.(error);
			toast.error(error.message);
			return null;
		}

		// Validate file type
		const isValidType = file.type.split("/")[0] === options.accept.split("/")[0] || 
		                   options.accept.includes(file.type) ||
		                   options.accept === "*/*";
		
		if (!isValidType) {
			const error = new Error(`File type ${file.type} is not supported`);
			options.onError?.(error);
			toast.error(error.message);
			return null;
		}

		setUploadState({
			isUploading: true,
			progress: 0,
			error: null,
		});

		try {
			// Upload to the appropriate API endpoint
			const formData = new FormData();
			formData.append("file", file);

			const uploadEndpoint = options.uploadType === "image" 
				? "/api/sources/upload-image"
				: "/api/sources/upload-document";

			// Simulate progress tracking
			let progress = 0;
			const progressInterval = setInterval(() => {
				progress += Math.random() * 20;
				if (progress >= 90) {
					progress = 90;
					clearInterval(progressInterval);
				}
				setUploadState(prev => ({ ...prev, progress }));
				options.onProgress?.(progress);
			}, 100);

			const response = await fetch(uploadEndpoint, {
				method: 'POST',
				body: formData,
			});

			clearInterval(progressInterval);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || `Upload failed: ${response.status}`);
			}

			const result = await response.json();
			
			if (!result.success || !result.filePath) {
				throw new Error("Upload failed: No file path returned");
			}

			setUploadState({
				isUploading: false,
				progress: 100,
				error: null,
			});

			options.onSuccess?.(result.filePath);
			return result.filePath;

		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Upload failed";
			
			setUploadState({
				isUploading: false,
				progress: 0,
				error: errorMessage,
			});

			const uploadError = new Error(errorMessage);
			options.onError?.(uploadError);
			toast.error(errorMessage);
			return null;
		}
	};

	const reset = () => {
		setUploadState({
			isUploading: false,
			progress: 0,
			error: null,
		});
	};

	return {
		uploadFile,
		uploadState,
		reset,
	};
}