import { PageHeader } from "@saas/shared/components/PageHeader";
import { ToolWrapper } from "@saas/tools/components/ToolWrapper";
import { getTranslations } from "next-intl/server";

export default async function ParaphraserPage() {
	const t = await getTranslations("tools.paraphraser");

	return (
		<>
			<PageHeader title={t("name")} subtitle={t("description")} />
			<ToolWrapper productKey="paraphraser" />
		</>
	);
}
