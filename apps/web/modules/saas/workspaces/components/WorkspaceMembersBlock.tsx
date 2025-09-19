"use client";
import { SettingsItem } from "@saas/shared/components/SettingsItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { WorkspaceInvitationsList } from "./WorkspaceInvitationsList";
import { WorkspaceMembersList } from "./WorkspaceMembersList";

export function WorkspaceMembersBlock({
	workspaceId,
}: {
	workspaceId: string;
}) {
	const t = useTranslations();
	const [activeTab, setActiveTab] = useState("members");

	return (
		<SettingsItem
			title={t("workspaces.settings.members.title")}
			description={t("workspaces.settings.members.description")}
		>
			<Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab)}>
				<TabsList className="mb-4">
					<TabsTrigger value="members">
						{t("workspaces.settings.members.activeMembers")}
					</TabsTrigger>
					<TabsTrigger value="invitations">
						{t("workspaces.settings.members.pendingInvitations")}
					</TabsTrigger>
				</TabsList>
				<TabsContent value="members">
					<WorkspaceMembersList workspaceId={workspaceId} />
				</TabsContent>
				<TabsContent value="invitations">
					<WorkspaceInvitationsList workspaceId={workspaceId} />
				</TabsContent>
			</Tabs>
		</SettingsItem>
	);
}
