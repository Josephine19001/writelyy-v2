import { Heading, Link, Text } from "@react-email/components";
import React from "react";
import { createTranslator } from "use-intl/core";
import PrimaryButton from "../src/components/PrimaryButton";
import Wrapper from "../src/components/Wrapper";
import { defaultLocale, defaultTranslations } from "../src/util/translations";
import type { BaseMailProps } from "../types";

export function WorkspaceInvitation({
	url,
	workspaceName,
	locale,
	translations,
}: {
	url: string;
	workspaceName: string;
} & BaseMailProps) {
	const t = createTranslator({
		locale,
		messages: translations,
	});

	return (
		<Wrapper>
			<Heading className="text-xl">
				{t.markup("mail.workspaceInvitation.headline", {
					workspaceName,
					strong: (chunks) => `<strong>${chunks}</strong>`,
				})}
			</Heading>
			<Text>{t("mail.workspaceInvitation.body", { workspaceName })}</Text>

			<PrimaryButton href={url}>
				{t("mail.workspaceInvitation.join")}
			</PrimaryButton>

			<Text className="mt-4 text-muted-foreground text-sm">
				{t("mail.common.openLinkInBrowser")}
				<Link href={url}>{url}</Link>
			</Text>
		</Wrapper>
	);
}

WorkspaceInvitation.PreviewProps = {
	locale: defaultLocale,
	translations: defaultTranslations,
	url: "#",
	workspaceName: "Acme",
};

export default WorkspaceInvitation;
