"use client";

import { Button } from "@ui/components/button";
import { File } from "lucide-react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { useDocumentsByFolderQuery } from "@saas/lib/api";
import { DocumentContextMenu } from "../menus/DocumentContextMenu";

interface FolderDocumentsProps {
	folderId: string;
	level: number;
	onDocumentSelect?: (documentId: string) => void;
	selectedDocumentId?: string;
}

export function FolderDocuments({ 
	folderId, 
	level,
	onDocumentSelect,
	selectedDocumentId 
}: FolderDocumentsProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const { data: documents } = useDocumentsByFolderQuery(
		activeWorkspace?.id || "",
		folderId,
		{ enabled: !!activeWorkspace?.id }
	);

	if (!documents || documents.length === 0) return null;

	return (
		<div>
			{documents.map((document: any) => (
				<div key={document.id} className="group flex items-center justify-between hover:bg-accent rounded-sm">
					<Button
						variant="ghost"
						className="flex-1 justify-start h-auto p-1 px-2 text-sm"
						style={{ paddingLeft: `${0.5 + level * 0.75}rem` }}
						onClick={() => onDocumentSelect?.(document.id)}
					>
						<div className="flex items-center space-x-2">
							<File className="h-4 w-4 text-gray-600" />
							<span className="truncate">{document.title}</span>
						</div>
					</Button>
					<DocumentContextMenu documentId={document.id} />
				</div>
			))}
		</div>
	);
}