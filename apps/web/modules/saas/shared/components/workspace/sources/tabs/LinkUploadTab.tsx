"use client";

import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useCreateSourceMutation } from "@saas/lib/api";
import { toast } from "sonner";

interface LinkUploadTabProps {
	onSuccess?: () => void;
}

export function LinkUploadTab({ onSuccess }: LinkUploadTabProps) {
	const [linkUrl, setLinkUrl] = useState("");
	const [linkTitle, setLinkTitle] = useState("");
	const { activeWorkspace } = useActiveWorkspace();
	const createSourceMutation = useCreateSourceMutation();

	const handleLinkSubmit = async () => {
		if (!linkUrl.trim() || !linkTitle.trim() || !activeWorkspace?.id) return;

		try {
			await createSourceMutation.mutateAsync({
				name: linkTitle.trim(),
				organizationId: activeWorkspace.id,
				type: "url",
				url: linkUrl.trim(),
				metadata: {
					originalUrl: linkUrl.trim(),
				},
			});
			
			toast.success("Link added successfully");
			setLinkUrl("");
			setLinkTitle("");
			onSuccess?.();
		} catch {
			toast.error("Failed to add link");
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="link-title">Title</Label>
				<Input
					id="link-title"
					placeholder="Enter link title"
					value={linkTitle}
					onChange={(e) => setLinkTitle(e.target.value)}
					disabled={createSourceMutation.isPending}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="link-url">URL</Label>
				<Input
					id="link-url"
					placeholder="https://example.com"
					value={linkUrl}
					onChange={(e) => setLinkUrl(e.target.value)}
					disabled={createSourceMutation.isPending}
				/>
			</div>
			<Button
				onClick={handleLinkSubmit}
				className="w-full"
				disabled={!linkUrl.trim() || !linkTitle.trim() || createSourceMutation.isPending}
			>
				<ExternalLink className="h-4 w-4 mr-2" />
				Add Link
			</Button>
		</div>
	);
}