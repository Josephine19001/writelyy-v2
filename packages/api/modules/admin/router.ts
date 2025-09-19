import { findWorkspace } from "./procedures/find-workspace";
import { listUsers } from "./procedures/list-users";
import { listWorkspaces } from "./procedures/list-workspaces";

export const adminRouter = {
	users: {
		list: listUsers,
	},
	workspaces: {
		list: listWorkspaces,
		find: findWorkspace,
	},
};
