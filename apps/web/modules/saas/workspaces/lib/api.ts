import type { WorkspaceMetadata } from "@repo/auth";
import { authClient } from "@repo/auth/client";
import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery } from "@tanstack/react-query";

export const workspaceListQueryKey = ["user", "workspaces"] as const;
export const useWorkspaceListQuery = () => {
	return useQuery({
		queryKey: workspaceListQueryKey,
		queryFn: async () => {
			const { data, error } = await authClient.organization.list();

			if (error) {
				throw new Error(error.message || "Failed to fetch workspaces");
			}

			return data;
		},
	});
};

export const activeWorkspaceQueryKey = (slug: string) =>
	["user", "activeWorkspace", slug] as const;
export const useActiveWorkspaceQuery = (
	slug: string,
	options?: {
		enabled?: boolean;
	},
) => {
	return useQuery({
		queryKey: activeWorkspaceQueryKey(slug),
		queryFn: async () => {
			const { data, error } =
				await authClient.organization.getFullOrganization({
					query: {
						organizationSlug: slug,
					},
				});

			if (error) {
				throw new Error(
					error.message || "Failed to fetch active workspace",
				);
			}

			return data;
		},
		enabled: options?.enabled,
	});
};

export const fullWorkspaceQueryKey = (id: string) =>
	["fullWorkspace", id] as const;
export const useFullWorkspaceQuery = (id: string) => {
	return useQuery({
		queryKey: fullWorkspaceQueryKey(id),
		queryFn: async () => {
			const { data, error } =
				await authClient.organization.getFullOrganization({
					query: {
						organizationId: id,
					},
				});

			if (error) {
				throw new Error(
					error.message || "Failed to fetch full workspace",
				);
			}

			return data;
		},
	});
};

/*
 * Create workspace
 */
export const createWorkspaceMutationKey = ["create-workspace"] as const;
export const useCreateWorkspaceMutation = () => {
	return useMutation({
		mutationKey: createWorkspaceMutationKey,
		mutationFn: async ({
			name,
			metadata,
		}: {
			name: string;
			metadata?: WorkspaceMetadata;
		}) => {
			const { slug } = await orpcClient.workspaces.generateSlug({
				name,
			});

			const { error, data } = await authClient.organization.create({
				name,
				slug,
				metadata,
			});

			if (error) {
				throw error;
			}

			return data;
		},
	});
};

/*
 * Update workspace
 */
export const updateWorkspaceMutationKey = ["update-workspace"] as const;
export const useUpdateWorkspaceMutation = () => {
	return useMutation({
		mutationKey: updateWorkspaceMutationKey,
		mutationFn: async ({
			id,
			name,
			metadata,
			updateSlug,
		}: {
			id: string;
			name: string;
			metadata?: WorkspaceMetadata;
			updateSlug?: boolean;
		}) => {
			const slug = updateSlug
				? (
						await orpcClient.workspaces.generateSlug({
							name,
						})
					).slug
				: undefined;

			const { error, data } = await authClient.organization.update({
				organizationId: id,
				data: {
					name,
					slug,
					metadata,
				},
			});

			if (error) {
				throw error;
			}

			return data;
		},
	});
};
