import { config } from "@repo/config";
import { createPurchasesHelper } from "@repo/payments/lib/helper";
import { getSession, getWorkspaceList } from "@saas/auth/lib/server";
import { orpcClient } from "@shared/lib/orpc-client";
import { attemptAsync } from "es-toolkit";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Layout({ children }: PropsWithChildren) {
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	if (config.users.enableOnboarding && !session.user.onboardingComplete) {
		redirect("/onboarding");
	}

	const workspaces = await getWorkspaceList();

	if (config.workspaces.enable && config.workspaces.requireWorkspace) {
		const workspace =
			workspaces.find(
				(org) => org.id === session?.session.activeOrganizationId,
			) || workspaces[0];

		if (!workspace) {
			redirect("/new-workspace");
		}
	}

	const hasFreePlan = Object.values(config.payments.plans).some(
		(plan) => "isFree" in plan,
	);

	if (
		((config.workspaces.enable && config.workspaces.enableBilling) ||
			config.users.enableBilling) &&
		!hasFreePlan
	) {
		const organizationId = config.workspaces.enable
			? session?.session.activeOrganizationId || workspaces?.at(0)?.id
			: undefined;

		const [error, data] = await attemptAsync(() =>
			orpcClient.payments.listPurchases({
				organizationId,
			}),
		);

		if (error) {
			// If it's an unauthorized error, treat as no purchases (free tier)
			const errorMessage = error instanceof Error ? error.message : String(error);
			if (errorMessage === "Unauthorized") {
				console.warn("No billing access, treating as free tier");
			} else {
				throw new Error("Failed to fetch purchases");
			}
		}

		const purchases = data?.purchases ?? [];

		const { activePlan } = createPurchasesHelper(purchases);

		if (!activePlan) {
			redirect("/choose-plan");
		}
	}

	return children;
}
