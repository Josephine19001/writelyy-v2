import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { MailCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function WorkspaceInvitationAlert({
	className,
}: {
	className?: string;
}) {
	const t = useTranslations();
	return (
		<Alert variant="primary" className={className}>
			<MailCheckIcon />
			<AlertTitle>{t("workspaces.invitationAlert.title")}</AlertTitle>
			<AlertDescription>
				{t("workspaces.invitationAlert.description")}
			</AlertDescription>
		</Alert>
	);
}
