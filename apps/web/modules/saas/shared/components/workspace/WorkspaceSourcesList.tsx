"use client";

import { SourcesBrowser } from "./sources/SourcesBrowser";

interface WorkspaceSourcesListProps {
	onSourceSelect?: (sourceId: string) => void;
	selectedSourceId?: string;
}

export function WorkspaceSourcesList({
	onSourceSelect,
	selectedSourceId,
}: WorkspaceSourcesListProps) {
	return (
		<SourcesBrowser
			onSourceSelect={onSourceSelect}
			selectedSourceId={selectedSourceId}
			mode="management"
		/>
	);
}