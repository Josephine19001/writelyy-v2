import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/*
 * Query Keys
 */
export const foldersQueryKey = (organizationId: string) =>
	["folders", organizationId] as const;
export const folderQueryKey = (id: string) => ["folder", id] as const;
export const folderTreeQueryKey = (organizationId: string, parentFolderId?: string) =>
	["folders", organizationId, "tree", parentFolderId] as const;

/*
 * List Folders
 */
export const useFoldersQuery = (
	organizationId: string,
	options?: {
		parentFolderId?: string | null;
		includeDocuments?: boolean;
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: folderTreeQueryKey(organizationId, options?.parentFolderId || undefined),
		queryFn: async () => {
			const { folders } = await orpcClient.folders.list({
				organizationId,
				parentFolderId: options?.parentFolderId,
				includeDocuments: options?.includeDocuments || false,
			});

			return folders;
		},
		enabled: options?.enabled !== false,
	});
};

/*
 * Get All Folders (flat list for workspace)
 */
export const useAllFoldersQuery = (
	organizationId: string,
	options?: {
		enabled?: boolean;
	}
) => {
	return useQuery({
		queryKey: foldersQueryKey(organizationId),
		queryFn: async () => {
			const { folders } = await orpcClient.folders.list({
				organizationId,
				includeDocuments: false,
			});

			return folders;
		},
		enabled: options?.enabled !== false,
	});
};

/*
 * Create Folder
 */
export const createFolderMutationKey = ["create-folder"] as const;
export const useCreateFolderMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: createFolderMutationKey,
		mutationFn: async ({
			name,
			organizationId,
			parentFolderId,
		}: {
			name: string;
			organizationId: string;
			parentFolderId?: string;
		}) => {
			const { folder } = await orpcClient.folders.create({
				name,
				organizationId,
				parentFolderId,
			});

			return folder;
		},
		onSuccess: (folder) => {
			// Invalidate folders tree
			queryClient.invalidateQueries({
				queryKey: ["folders", folder.organizationId],
			});
			
			// Set folder cache
			queryClient.setQueryData(folderQueryKey(folder.id), folder);
		},
	});
};

/*
 * Update Folder
 */
export const updateFolderMutationKey = ["update-folder"] as const;
export const useUpdateFolderMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: updateFolderMutationKey,
		mutationFn: async ({
			id,
			name,
			parentFolderId,
		}: {
			id: string;
			name?: string;
			parentFolderId?: string | null;
		}) => {
			const { folder } = await orpcClient.folders.update({
				id,
				name,
				parentFolderId,
			});

			return folder;
		},
		onSuccess: (folder) => {
			// Update folder cache
			queryClient.setQueryData(folderQueryKey(folder.id), folder);
			
			// Invalidate folders tree
			queryClient.invalidateQueries({
				queryKey: ["folders", folder.organizationId],
			});
		},
	});
};

/*
 * Delete Folder
 */
export const deleteFolderMutationKey = ["delete-folder"] as const;
export const useDeleteFolderMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: deleteFolderMutationKey,
		mutationFn: async ({
			id,
			deleteContents,
		}: {
			id: string;
			deleteContents?: boolean;
		}) => {
			await orpcClient.folders.delete({ id, deleteContents: deleteContents || false });
			return { id };
		},
		onSuccess: ({ id }) => {
			// Remove folder from cache
			queryClient.removeQueries({ queryKey: folderQueryKey(id) });
			
			// Invalidate all folders lists
			queryClient.invalidateQueries({
				queryKey: ["folders"],
			});
			
			// Invalidate documents (in case contents were moved)
			queryClient.invalidateQueries({
				queryKey: ["documents"],
			});
		},
	});
};

/*
 * Helper: Build Folder Tree
 * Transform flat folder list into hierarchical tree structure
 */
export const buildFolderTree = (folders: any[]) => {
	const folderMap = new Map();
	const rootFolders: any[] = [];

	// Create a map of all folders
	folders.forEach(folder => {
		folderMap.set(folder.id, { ...folder, subFolders: [] });
	});

	// Build the tree structure
	folders.forEach(folder => {
		const folderWithChildren = folderMap.get(folder.id);
		
		if (folder.parentFolderId) {
			const parent = folderMap.get(folder.parentFolderId);
			if (parent) {
				parent.subFolders.push(folderWithChildren);
			}
		} else {
			rootFolders.push(folderWithChildren);
		}
	});

	return rootFolders;
};

/*
 * Hook to get folder tree structure
 */
export const useFolderTreeQuery = (
	organizationId: string,
	options?: {
		enabled?: boolean;
	}
) => {
	const { data: folders, ...rest } = useAllFoldersQuery(organizationId, options);
	
	const folderTree = folders ? buildFolderTree(folders) : [];
	
	return {
		data: folderTree,
		folders: folders || [],
		...rest,
	};
};