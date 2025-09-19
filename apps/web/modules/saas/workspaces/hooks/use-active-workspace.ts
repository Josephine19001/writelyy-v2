import { useContext } from "react";
import { ActiveWorkspaceContext } from "../lib/active-workspace-context";

export const useActiveWorkspace = () => {
	const activeWorkspaceContext = useContext(ActiveWorkspaceContext);

	type ActiveWorkspaceContextType = NonNullable<
		typeof activeWorkspaceContext
	>;

	if (activeWorkspaceContext === undefined) {
		return {
			activeWorkspace: null,
			setActiveWorkspace: () => Promise.resolve(),
			refetchActiveWorkspace: () => Promise.resolve(),
			activeWorkspaceUserRole: null,
			isWorkspaceAdmin: false,
			loaded: true,
		} satisfies ActiveWorkspaceContextType;
	}

	return activeWorkspaceContext;
};
