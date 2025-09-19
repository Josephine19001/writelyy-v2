import { auth } from "@repo/auth";
import { WorkspaceForm } from "@saas/admin/component/workspaces/WorkspaceForm";
import { getAdminPath } from "@saas/admin/lib/links";
import { fullWorkspaceQueryKey } from "@saas/workspaces/lib/api";
import { getServerQueryClient } from "@shared/lib/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Button } from "@ui/components/button";
import { ArrowLeftIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function WorkspaceFormPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ backTo?: string }>;
}) {
	const { id } = await params;
	const { backTo } = await searchParams;

	const t = await getTranslations();
	const queryClient = getServerQueryClient();

	await queryClient.prefetchQuery({
		queryKey: fullWorkspaceQueryKey(id),
		queryFn: async () =>
			await auth.api.getFullWorkspace({
				query: {
					workspaceId: id,
				},
				headers: await headers(),
			}),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div>
				<div className="mb-2 flex justify-start">
					<Button variant="link" size="sm" asChild className="px-0">
						<Link href={backTo ?? getAdminPath("/workspaces")}>
							<ArrowLeftIcon className="mr-1.5 size-4" />
							{t("admin.workspaces.backToList")}
						</Link>
					</Button>
				</div>
				<WorkspaceForm workspaceId={id} />
			</div>
		</HydrationBoundary>
	);
}
