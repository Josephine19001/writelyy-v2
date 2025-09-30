"use client";

import { TabProvider } from "./providers/TabProvider";
import { WorkspaceEditor } from "./WorkspaceEditor";

export function WorkspaceEditorWithTabs() {
	return (
		<TabProvider>
			<WorkspaceEditor />
		</TabProvider>
	);
}