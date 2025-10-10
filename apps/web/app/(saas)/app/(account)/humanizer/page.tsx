import { PageHeader } from "@saas/shared/components/PageHeader";
import { ToolWrapper } from "@saas/tools/components/ToolWrapper";
import { getTranslations } from "next-intl/server";

export default async function HumanizerPage() {
	const t = await getTranslations("tools.humanizer");

	return (
		<>
			<PageHeader title={t("name")} subtitle={t("description")} />
			<ToolWrapper productKey="humanizer" />
		</>
	);
}
