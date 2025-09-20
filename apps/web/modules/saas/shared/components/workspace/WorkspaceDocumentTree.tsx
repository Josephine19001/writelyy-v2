"use client";

import { Button } from "@ui/components/button";
import { cn } from "@ui/lib";
import {
	ChevronDown,
	ChevronRight,
	File,
	Folder,
	FolderPlus,
	FileText,
} from "lucide-react";
import { useState } from "react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import {
	useFolderTreeQuery,
	useDocumentsByFolderQuery,
} from "@saas/lib/api";
import { CreateItemDialog } from "./dialogs/CreateItemDialog";
import { DocumentContextMenu } from "./menus/DocumentContextMenu";
import { FolderContextMenu } from "./menus/FolderContextMenu";
import { FolderDocuments } from "./items/FolderDocuments";

interface WorkspaceDocumentTreeProps {
	onDocumentSelect?: (documentId: string) => void;
	selectedDocumentId?: string;
}


export function WorkspaceDocumentTree({
	onDocumentSelect,
	selectedDocumentId,
}: WorkspaceDocumentTreeProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

	// Get folder tree and root documents
	const { data: folderTree, isLoading: foldersLoading } = useFolderTreeQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id }
	);

	const { data: rootDocuments, isLoading: documentsLoading } = useDocumentsByFolderQuery(
		activeWorkspace?.id || "",
		undefined, // null for root level
		{ enabled: !!activeWorkspace?.id }
	);

	const toggleFolder = (folderId: string) => {
		const newExpanded = new Set(expandedFolders);
		if (newExpanded.has(folderId)) {
			newExpanded.delete(folderId);
		} else {
			newExpanded.add(folderId);
		}
		setExpandedFolders(newExpanded);
	};

	const renderFolder = (folder: any, level = 0) => {
		const isExpanded = expandedFolders.has(folder.id);
		const hasChildren = folder.subFolders && folder.subFolders.length > 0;

		return (
			<div key={folder.id}>
				<div className="group flex items-center justify-between hover:bg-accent rounded-sm">
					<Button
						variant="ghost"
						className="flex-1 justify-start h-auto p-1 px-2 text-sm"
						style={{ paddingLeft: `${0.5 + level * 0.75}rem` }}
						onClick={() => toggleFolder(folder.id)}
					>
						<div className="flex items-center space-x-2">
							{hasChildren &&
								(isExpanded ? (
									<ChevronDown className="h-3 w-3" />
								) : (
									<ChevronRight className="h-3 w-3" />
								))}
							<Folder className="h-4 w-4 text-blue-600" />
							<span className="truncate">{folder.name}</span>
						</div>
					</Button>
					<FolderContextMenu folderId={folder.id} />
				</div>

				{isExpanded && (
					<div>
						{/* Render subfolders */}
						{folder.subFolders?.map((subFolder: any) =>
							renderFolder(subFolder, level + 1)
						)}
						{/* Render documents in this folder */}
						<FolderDocuments 
							folderId={folder.id} 
							level={level + 1}
							onDocumentSelect={onDocumentSelect}
							selectedDocumentId={selectedDocumentId}
						/>
					</div>
				)}
			</div>
		);
	};

	const renderDocument = (document: any, level = 0) => {
		const isSelected = selectedDocumentId === document.id;

		return (
			<div key={document.id} className="group flex items-center justify-between hover:bg-accent rounded-sm">
				<Button
					variant="ghost"
					className={cn(
						"flex-1 justify-start h-auto p-1 px-2 text-sm",
						isSelected && "bg-accent"
					)}
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
		);
	};

	// Loading state
	if (foldersLoading || documentsLoading) {
		return (
			<div className="p-3">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		);
	}

	// Empty state
	if ((!folderTree || folderTree.length === 0) && (!rootDocuments || rootDocuments.length === 0)) {
		return (
			<div className="p-3">
				<div className="text-center py-8">
					<Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<h3 className="text-sm font-medium mb-2">No documents yet</h3>
					<p className="text-xs text-muted-foreground mb-4">
						Create your first document or folder to get started
					</p>
					<div className="space-y-2">
						<CreateItemDialog type="document">
							<Button size="sm" className="w-full">
								<FileText className="h-4 w-4 mr-2" />
								Create Document
							</Button>
						</CreateItemDialog>
						<CreateItemDialog type="folder">
							<Button variant="outline" size="sm" className="w-full">
								<FolderPlus className="h-4 w-4 mr-2" />
								Create Folder
							</Button>
						</CreateItemDialog>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{/* Render root level folders */}
			{folderTree?.map((folder: any) => renderFolder(folder))}
			
			{/* Render root level documents */}
			{rootDocuments?.map((document: any) => renderDocument(document))}
		</div>
	);
}

