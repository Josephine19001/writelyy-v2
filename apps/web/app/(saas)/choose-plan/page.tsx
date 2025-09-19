import { config } from "@repo/config";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { getSession, getWorkspaceList } from "@saas/auth/lib/server";
import { PricingTable } from "@saas/payments/components/PricingTable";
import { getPurchases } from "@saas/payments/lib/server";
import { AuthWrapper } from "@saas/shared/components/AuthWrapper";
import { attemptAsync } from "es-toolkit";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("choosePlan.title"),
	};
}

export default async function ChoosePlanPage() {
	const t = await getTranslations();
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	let workspaceId: string | undefined;
	if (config.workspaces.enable && config.workspaces.enableBilling) {
		const workspace = (await getWorkspaceList()).at(0);

		if (!workspace) {
			redirect("/new-workspace");
		}

		workspaceId = workspace.id;
	}

	const [error, purchases] = await attemptAsync(() =>
		getPurchases(workspaceId),
	);

	if (error || !purchases) {
		throw new Error("Failed to fetch purchases");
	}

	const { activePlan } = createPurchasesHelper(purchases);

	if (activePlan) {
		redirect("/app");
	}

	return (
		<AuthWrapper contentClass="max-w-5xl">
			<div className="mb-4 text-center">
				<h1 className="text-center font-bold text-2xl lg:text-3xl">
					{t("choosePlan.title")}
				</h1>
				<p className="text-muted-foreground text-sm lg:text-base">
					{t("choosePlan.description")}
				</p>
			</div>

			<div>
				<PricingTable
					{...(workspaceId
						? {
								workspaceId,
							}
						: {
								userId: session.user.id,
							})}
				/>
			</div>
		</AuthWrapper>
	);
}
