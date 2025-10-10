import { PageHeader } from "@saas/shared/components/PageHeader";
import { ToolWrapper } from "@saas/tools/components/ToolWrapper";
import { getTranslations } from "next-intl/server";

export default async function DetectorPage() {
	const t = await getTranslations("tools.detector");

	return (
		<>
			<PageHeader title={t("name")} subtitle={t("description")} />
			<ToolWrapper productKey="detector" />
		</>
	);
}
