"use client";

import { Button } from "@ui/components/button";
import { FileImage } from "lucide-react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useSourcesQuery } from "@saas/lib/api";
import { AddSourceModal } from "./sources/dialogs/AddSourceModal";
import { SourceContextMenu } from "./sources/menus/SourceContextMenu";
import { getProcessingStatus, getSourceIcon } from "./sources/utils/sourceUtils";

interface WorkspaceSourcesListProps {
	onSourceSelect?: (sourceId: string) => void;
	selectedSourceId?: string;
}

export function WorkspaceSourcesList({
	onSourceSelect,
	selectedSourceId,
}: WorkspaceSourcesListProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const { data: sourcesData, isLoading } = useSourcesQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id }
	);


	if (isLoading) {
		return (
			<div className="space-y-2">
				<AddSourceModal />
				<div className="text-xs text-muted-foreground p-2">Loading sources...</div>
			</div>
		);
	}

	const sources = sourcesData?.sources || [];

	if (sources.length === 0) {
		return (
			<div className="space-y-2">
				<AddSourceModal />
				<div className="text-center py-4">
					<FileImage className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
					<p className="text-xs text-muted-foreground mb-2">
						No sources yet
					</p>
					<p className="text-xs text-muted-foreground">
						Add PDFs, images, or links to reference in your documents
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<AddSourceModal />
			<div className="space-y-1">
				{sources.map((source: any) => {
					const processingStatus = getProcessingStatus(source.processingStatus);
					
					return (
						<div
							key={source.id}
							className="group flex items-center justify-between hover:bg-accent rounded-sm"
						>
							<Button
								variant="ghost"
								className="flex-1 justify-start h-auto p-1 px-2 text-sm"
								onClick={() => onSourceSelect?.(source.id)}
							>
								<div className="flex items-center space-x-2 min-w-0">
									{getSourceIcon(source.type)}
									<div className="min-w-0 flex-1">
										<div className="truncate">{source.name}</div>
										{processingStatus && (
											<div className="text-xs text-muted-foreground">
												{processingStatus}
											</div>
										)}
									</div>
								</div>
							</Button>
							<SourceContextMenu sourceId={source.id} />
						</div>
					);
				})}
			</div>
		</div>
	);
}