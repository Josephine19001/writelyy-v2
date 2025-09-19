"use client";

import { authClient } from "@repo/auth/client";
import { WorkspaceLogo } from "@saas/workspaces/components/WorkspaceLogo";
import { workspaceListQueryKey } from "@saas/workspaces/lib/api";
import { useRouter } from "@shared/hooks/router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { CheckIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function WorkspaceInvitationModal({
	invitationId,
	workspaceName,
	workspaceSlug,
	logoUrl,
}: {
	invitationId: string;
	workspaceName: string;
	workspaceSlug: string;
	logoUrl?: string;
}) {
	const t = useTranslations();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [submitting, setSubmitting] = useState<false | "accept" | "reject">(
		false,
	);

	const onSelectAnswer = async (accept: boolean) => {
		setSubmitting(accept ? "accept" : "reject");
		try {
			if (accept) {
				const { error } = await authClient.workspace.acceptInvitation({
					invitationId,
				});

				if (error) {
					throw error;
				}

				await queryClient.invalidateQueries({
					queryKey: workspaceListQueryKey,
				});

				router.replace(`/app/${workspaceSlug}`);
			} else {
				const { error } = await authClient.workspace.rejectInvitation({
					invitationId,
				});

				if (error) {
					throw error;
				}

				router.replace("/app");
			}
		} catch {
			// TODO: handle error
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div>
			<h1 className="font-bold text-xl md:text-2xl">
				{t("workspaces.invitationModal.title")}
			</h1>
			<p className="mt-1 mb-6 text-foreground/60">
				{t("workspaces.invitationModal.description", {
					workspaceName,
				})}
			</p>

			<div className="mb-6 flex items-center gap-3 rounded-lg border p-2">
				<WorkspaceLogo
					name={workspaceName}
					logoUrl={logoUrl}
					className="size-12"
				/>
				<div>
					<strong className="font-medium text-lg">
						{workspaceName}
					</strong>
				</div>
			</div>

			<div className="flex gap-2">
				<Button
					className="flex-1"
					variant="light"
					onClick={() => onSelectAnswer(false)}
					disabled={!!submitting}
					loading={submitting === "reject"}
				>
					<XIcon className="mr-1.5 size-4" />
					{t("workspaces.invitationModal.decline")}
				</Button>
				<Button
					className="flex-1"
					onClick={() => onSelectAnswer(true)}
					disabled={!!submitting}
					loading={submitting === "accept"}
				>
					<CheckIcon className="mr-1.5 size-4" />
					{t("workspaces.invitationModal.accept")}
				</Button>
			</div>
		</div>
	);
}
