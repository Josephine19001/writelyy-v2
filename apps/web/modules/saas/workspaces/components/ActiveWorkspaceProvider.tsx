"use client";

import { authClient } from "@repo/auth/client";
import { isWorkspaceAdmin } from "@repo/auth/lib/helper";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { sessionQueryKey } from "@saas/auth/lib/api";
import {
	activeWorkspaceQueryKey,
	useActiveWorkspaceQuery,
} from "@saas/workspaces/lib/api";
import { useRouter } from "@shared/hooks/router";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import nProgress from "nprogress";
import { type ReactNode, useEffect, useState } from "react";
import { ActiveWorkspaceContext } from "../lib/active-workspace-context";

export function ActiveWorkspaceProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { session, user } = useSession();
	const params = useParams();

	const activeWorkspaceSlug = params.workspaceSlug as string;

	const { data: activeWorkspace } = useActiveWorkspaceQuery(
		activeWorkspaceSlug,
		{
			enabled: !!activeWorkspaceSlug,
		},
	);

	const refetchActiveWorkspace = async () => {
		await queryClient.refetchQueries({
			queryKey: activeWorkspaceQueryKey(activeWorkspaceSlug),
		});
	};

	const setActiveWorkspace = async (workspaceSlug: string | null) => {
		nProgress.start();
		const { data: newActiveWorkspace } =
			await authClient.organization.setActive(
				workspaceSlug
					? {
							organizationSlug: workspaceSlug,
						}
					: {
							organizationId: null,
						},
			);

		if (!newActiveWorkspace) {
			nProgress.done();
			return;
		}

		await refetchActiveWorkspace();

		if (config.workspaces.enableBilling) {
			await queryClient.prefetchQuery(
				orpc.payments.listPurchases.queryOptions({
					input: {
						organizationId: newActiveWorkspace.id,
					},
				}),
			);
		}

		await queryClient.setQueryData(sessionQueryKey, (data: any) => {
			return {
				...data,
				session: {
					...data?.session,
					activeOrganizationId: newActiveWorkspace.id,
				},
			};
		});

		router.push(`/app/${newActiveWorkspace.slug}`);
		nProgress.done();
	};

	const [loaded, setLoaded] = useState(activeWorkspace !== undefined);

	useEffect(() => {
		if (!loaded && activeWorkspace !== undefined) {
			setLoaded(true);
		}
	}, [activeWorkspace]);

	const activeWorkspaceUserRole = activeWorkspace?.members.find(
		(member) => member.userId === session?.userId,
	)?.role;

	return (
		<ActiveWorkspaceContext.Provider
			value={{
				loaded,
				activeWorkspace: activeWorkspace ?? null,
				activeWorkspaceUserRole: activeWorkspaceUserRole ?? null,
				isWorkspaceAdmin:
					!!activeWorkspace &&
					!!user &&
					isWorkspaceAdmin(activeWorkspace, user),
				setActiveWorkspace,
				refetchActiveWorkspace,
			}}
		>
			{children}
		</ActiveWorkspaceContext.Provider>
	);
}
