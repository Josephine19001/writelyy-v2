"use client";

import { SourcesBrowser } from "./sources/SourcesBrowser";

interface WorkspaceSourcesListProps {
	onSourceSelect?: (sourceId: string) => void;
	selectedSourceId?: string;
	onInsertSource?: (source: any) => void;
	onUseAsAIContext?: (source: any) => void;
}

export function WorkspaceSourcesList({
	onSourceSelect,
	selectedSourceId,
	onInsertSource,
	onUseAsAIContext,
}: WorkspaceSourcesListProps) {
	return (
		<SourcesBrowser
			onSourceSelect={onSourceSelect}
			selectedSourceId={selectedSourceId}
			mode="management"
			onInsertSource={onInsertSource}
			onUseAsAIContext={onUseAsAIContext}
		/>
	);
}