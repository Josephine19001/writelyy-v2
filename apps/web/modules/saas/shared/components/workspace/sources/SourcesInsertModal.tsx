"use client";

import { useState, useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { Button } from "@ui/components/button";
import { SourcesBrowser } from "./SourcesBrowser";
import type { Source } from "./types";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useSourcesQuery } from "@saas/lib/api";

interface SourcesInsertModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSourceSelect: (source: Source) => void;
}

export function SourcesInsertModal({
	open,
	onOpenChange,
	onSourceSelect,
}: SourcesInsertModalProps) {
	const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
	const { activeWorkspace } = useActiveWorkspace();
	const { data: sourcesData } = useSourcesQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id }
	);

	const sources = sourcesData?.sources || [];

	const handleSourceSelect = useCallback((source: Source) => {
		setSelectedSourceId(source.id);
	}, []);

	const handleInsertSource = useCallback(() => {
		if (!selectedSourceId) return;
		
		const selectedSource = sources.find((source: any) => source.id === selectedSourceId);
		if (selectedSource) {
			onSourceSelect(selectedSource);
			onOpenChange(false);
		}
	}, [selectedSourceId, sources, onSourceSelect, onOpenChange]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<DialogTitle>Insert from Sources</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-hidden">
					<SourcesBrowser
						mode="insertion" // Only show insertable sources (images, links)
						onSourceSelect={handleSourceSelect}
						selectedSourceId={selectedSourceId || undefined}
					/>
				</div>

				<div className="flex-shrink-0 pt-4 border-t">
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={handleInsertSource}
							disabled={!selectedSourceId}
						>
							Insert
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}