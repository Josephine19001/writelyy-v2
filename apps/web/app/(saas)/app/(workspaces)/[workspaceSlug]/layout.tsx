import { config } from "@repo/config";
import { getActiveWorkspace } from "@saas/auth/lib/server";
import { NewAppWrapper } from "@saas/shared/components/NewAppWrapper";
import { activeWorkspaceQueryKey } from "@saas/workspaces/lib/api";
import { orpc } from "@shared/lib/orpc-query-utils";
import { getServerQueryClient } from "@shared/lib/server";
import { notFound } from "next/navigation";
import type { PropsWithChildren } from "react";

export default async function WorkspaceLayout({
	children,
	params,
}: PropsWithChildren<{
	params: Promise<{
		workspaceSlug: string;
	}>;
}>) {
	const { workspaceSlug } = await params;

	const workspace = await getActiveWorkspace(workspaceSlug);

	if (!workspace) {
		return notFound();
	}

	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery({
		queryKey: activeWorkspaceQueryKey(workspaceSlug),
		queryFn: () => workspace,
	});

	if (config.users.enableBilling) {
		await queryClient.prefetchQuery(
			orpc.payments.listPurchases.queryOptions({
				input: {
					organizationId: workspace.id,
				},
			}),
		);
	}

	return <NewAppWrapper>{children}</NewAppWrapper>;
}
