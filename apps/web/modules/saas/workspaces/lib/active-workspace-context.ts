import type { ActiveWorkspace } from "@repo/auth";
import React from "react";

export const ActiveWorkspaceContext = React.createContext<
	| {
			activeWorkspace: ActiveWorkspace | null;
			activeWorkspaceUserRole:
				| ActiveWorkspace["members"][number]["role"]
				| null;
			isWorkspaceAdmin: boolean;
			loaded: boolean;
			setActiveWorkspace: (workspaceId: string | null) => Promise<void>;
			refetchActiveWorkspace: () => Promise<void>;
	  }
	| undefined
>(undefined);
