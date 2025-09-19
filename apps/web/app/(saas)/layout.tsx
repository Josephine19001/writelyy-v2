import { config } from "@repo/config";
import { SessionProvider } from "@saas/auth/components/SessionProvider";
import { sessionQueryKey } from "@saas/auth/lib/api";
import { getSession, getWorkspaceList } from "@saas/auth/lib/server";
import { ConfirmationAlertProvider } from "@saas/shared/components/ConfirmationAlertProvider";
import { ActiveWorkspaceProvider } from "@saas/workspaces/components/ActiveWorkspaceProvider";
import { workspaceListQueryKey } from "@saas/workspaces/lib/api";
import { Document } from "@shared/components/Document";
import { orpc } from "@shared/lib/orpc-query-utils";
import { getServerQueryClient } from "@shared/lib/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { PropsWithChildren } from "react";

export default async function SaaSLayout({ children }: PropsWithChildren) {
	const locale = await getLocale();
	const messages = await getMessages();
	const session = await getSession();

	if (!session) {
		redirect("/auth/login");
	}

	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery({
		queryKey: sessionQueryKey,
		queryFn: () => session,
	});

	if (config.workspaces.enable) {
		await queryClient.prefetchQuery({
			queryKey: workspaceListQueryKey,
			queryFn: getWorkspaceList,
		});
	}

	if (config.users.enableBilling) {
		await queryClient.prefetchQuery(
			orpc.payments.listPurchases.queryOptions({
				input: {},
			}),
		);
	}

	return (
		<Document locale={locale}>
			<NextIntlClientProvider messages={messages}>
				<HydrationBoundary state={dehydrate(queryClient)}>
					<SessionProvider>
						<ActiveWorkspaceProvider>
							<ConfirmationAlertProvider>
								{children}
							</ConfirmationAlertProvider>
						</ActiveWorkspaceProvider>
					</SessionProvider>
				</HydrationBoundary>
			</NextIntlClientProvider>
		</Document>
	);
}
