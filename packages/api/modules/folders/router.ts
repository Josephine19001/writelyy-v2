import { createFolder } from "./procedures/create-folder";
import { deleteFolder } from "./procedures/delete-folder";
import { listFolders } from "./procedures/list-folders";
import { updateFolder } from "./procedures/update-folder";

export const foldersRouter = {
	list: listFolders,
	create: createFolder,
	update: updateFolder,
	delete: deleteFolder,
};