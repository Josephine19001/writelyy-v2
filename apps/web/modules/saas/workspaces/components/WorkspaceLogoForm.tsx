"use client";

import { authClient } from "@repo/auth/client";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { workspaceListQueryKey } from "@saas/workspaces/lib/api";
import { Spinner } from "@shared/components/Spinner";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { CropImageDialog } from "../../settings/components/CropImageDialog";
import { WorkspaceLogo } from "./WorkspaceLogo";

export function WorkspaceLogoForm() {
	const t = useTranslations();
	const [uploading, setUploading] = useState(false);
	const [cropDialogOpen, setCropDialogOpen] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const { activeWorkspace, refetchActiveWorkspace } = useActiveWorkspace();
	const queryClient = useQueryClient();
	const getSignedUploadUrlMutation = useMutation(
		orpc.workspaces.createLogoUploadUrl.mutationOptions(),
	);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => {
			setImage(acceptedFiles[0]);
			setCropDialogOpen(true);
		},
		accept: {
			"image/png": [".png"],
			"image/jpeg": [".jpg", ".jpeg"],
		},
		multiple: false,
	});

	if (!activeWorkspace) {
		return null;
	}

	const onCrop = async (croppedImageData: Blob | null) => {
		if (!croppedImageData) {
			return;
		}

		setUploading(true);
		try {
			const { signedUploadUrl, path } =
				await getSignedUploadUrlMutation.mutateAsync({
					workspaceId: activeWorkspace.id,
				});

			const response = await fetch(signedUploadUrl, {
				method: "PUT",
				body: croppedImageData,
				headers: {
					"Content-Type": "image/png",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to upload image");
			}

			const { error } = await authClient.workspace.update({
				workspaceId: activeWorkspace.id,
				data: {
					logo: path,
				},
			});

			if (error) {
				throw error;
			}

			toast.success(t("settings.account.avatar.notifications.success"));

			refetchActiveWorkspace();
			queryClient.invalidateQueries({
				queryKey: workspaceListQueryKey,
			});
		} catch {
			toast.error(t("settings.account.avatar.notifications.error"));
		} finally {
			setUploading(false);
		}
	};

	return (
		<SettingsItem
			title={t("workspaces.settings.logo.title")}
			description={t("workspaces.settings.logo.description")}
		>
			<div className="relative size-24 rounded-full" {...getRootProps()}>
				<input {...getInputProps()} />
				<WorkspaceLogo
					className="size-24 cursor-pointer text-xl"
					logoUrl={activeWorkspace.logo}
					name={activeWorkspace.name ?? ""}
				/>

				{uploading && (
					<div className="absolute inset-0 z-20 flex items-center justify-center bg-card/90">
						<Spinner />
					</div>
				)}
			</div>

			<CropImageDialog
				image={image}
				open={cropDialogOpen}
				onOpenChange={setCropDialogOpen}
				onCrop={onCrop}
			/>
		</SettingsItem>
	);
}
