import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { getActiveWorkspace } from "@saas/auth/lib/server";
import { ActivePlan } from "@saas/payments/components/ActivePlan";
import { ChangePlan } from "@saas/payments/components/ChangePlan";
import { SettingsList } from "@saas/shared/components/SettingsList";
import { orpcClient } from "@shared/lib/orpc-client";
import { orpc } from "@shared/lib/orpc-query-utils";
import { getServerQueryClient } from "@shared/lib/server";
import { attemptAsync } from "es-toolkit";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("settings.billing.title"),
	};
}

export default async function BillingSettingsPage({
	params,
}: {
	params: Promise<{ workspaceSlug: string }>;
}) {
	const { workspaceSlug } = await params;
	const workspace = await getActiveWorkspace(workspaceSlug);

	if (!workspace) {
		return notFound();
	}

	const [error, purchasesData] = await attemptAsync(() =>
		orpcClient.payments.listPurchases({
			workspaceId: workspace.id,
		}),
	);

	if (error) {
		throw new Error("Failed to fetch purchases");
	}

	const purchases = purchasesData?.purchases ?? [];
	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery({
		queryKey: orpc.payments.listPurchases.queryKey({
			input: {
				workspaceId: workspace.id,
			},
		}),
		queryFn: () => purchasesData,
	});

	const { activePlan } = createPurchasesHelper(purchases);

	return (
		<SettingsList>
			{activePlan && <ActivePlan workspaceId={workspace.id} />}
			<ChangePlan
				workspaceId={workspace.id}
				activePlanId={activePlan?.id}
			/>
		</SettingsList>
	);
}
