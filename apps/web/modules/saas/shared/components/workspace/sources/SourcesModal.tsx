"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@ui/components/dialog";
import { useState } from "react";
import { SourcesBrowser } from "./SourcesBrowser";

interface SourcesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSourceInsert?: (sourceId: string) => void;
	title?: string;
}

export function SourcesModal({
	open,
	onOpenChange,
	onSourceInsert,
	title = "Insert from Sources",
}: SourcesModalProps) {
	const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

	const handleSourceSelect = (source: any) => {
		setSelectedSourceId(source.id);
	};

	const handleInsert = () => {
		if (selectedSourceId && onSourceInsert) {
			onSourceInsert(selectedSourceId);
			onOpenChange(false);
			setSelectedSourceId(null);
		}
	};

	const handleCancel = () => {
		onOpenChange(false);
		setSelectedSourceId(null);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				
				<div className="flex-1 overflow-auto">
					<SourcesBrowser
						onSourceSelect={handleSourceSelect}
						selectedSourceId={selectedSourceId || undefined}
						mode="insertion"
					/>
				</div>

				<div className="flex items-center justify-end space-x-3 pt-4 border-t">
					<Button variant="outline" onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						onClick={handleInsert}
						disabled={!selectedSourceId}
					>
						Insert Source
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}