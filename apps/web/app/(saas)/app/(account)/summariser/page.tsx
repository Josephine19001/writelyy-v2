import { PageHeader } from "@saas/shared/components/PageHeader";
import { ToolWrapper } from "@saas/tools/components/ToolWrapper";
import { getTranslations } from "next-intl/server";

export default async function SummariserPage() {
	const t = await getTranslations("tools.summariser");

	return (
		<>
			<PageHeader title={t("name")} subtitle={t("description")} />
			<ToolWrapper productKey="summariser" />
		</>
	);
}
