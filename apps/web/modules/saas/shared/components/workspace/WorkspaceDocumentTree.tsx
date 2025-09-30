"use client";

import { useDocumentsQuery } from "@saas/documents/lib/api";
import { useFolderTreeQuery } from "@saas/folders/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { Button } from "@ui/components/button";
import { cn } from "@ui/lib";
import {
	ChevronDown,
	ChevronRight,
	File,
	FileText,
	Folder,
	FolderPlus,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useEditorContext } from "../NewAppWrapper";
import { useTabContext } from "../providers/TabProvider";
import { CreateItemDialog } from "./dialogs/CreateItemDialog";
import { FolderDocuments } from "./items/FolderDocuments";
import { InlineCreateItem } from "./items/InlineCreateItem";
import { InlineRenameItem } from "./items/InlineRenameItem";
import { DocumentContextMenu } from "./menus/DocumentContextMenu";
import { FolderContextMenu } from "./menus/FolderContextMenu";

interface WorkspaceDocumentTreeProps {
	onDocumentSelect?: (document: any) => void;
	selectedDocumentId?: string;
}

export function WorkspaceDocumentTree({
	onDocumentSelect,
	selectedDocumentId,
}: WorkspaceDocumentTreeProps) {
	const { activeWorkspace } = useActiveWorkspace();
	const { setSelectedFolderId, registerInlineCreateHandler } =
		useEditorContext();
	const { tabs } = useTabContext();
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);
	const [inlineCreate, setInlineCreate] = useState<{
		type: "folder" | "document";
		parentFolderId?: string;
		level: number;
	} | null>(null);
	const [inlineRename, setInlineRename] = useState<{
		type: "folder" | "document";
		itemId: string;
		currentName: string;
		level: number;
	} | null>(null);

	// Get folder tree and all documents in one optimized call
	const { data: folderTree, isLoading: foldersLoading } = useFolderTreeQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id },
	);

	const { data: documentsData, isLoading: documentsLoading } =
		useDocumentsQuery(activeWorkspace?.id || "", {
			limit: 100, // Maximum allowed by backend validation
			enabled: !!activeWorkspace?.id,
		});

	// Memoize documents list to prevent re-renders when only content changes
	const allDocuments = React.useMemo(() => {
		if (!documentsData?.documents) return [];
		
		// Only include fields that affect the tree structure/display
		// This prevents re-renders when document content changes
		return documentsData.documents.map((doc: any) => ({
			id: doc.id,
			title: doc.title,
			folderId: doc.folderId,
			createdAt: doc.createdAt,
			updatedAt: doc.updatedAt,
			// Exclude content to prevent re-renders on content changes
		}));
	}, [documentsData?.documents]);

	const documentsByFolder = React.useMemo(() => {
		return allDocuments.reduce(
			(acc: Record<string, any[]>, doc: any) => {
				const folderId = doc.folderId || "root";
				if (!acc[folderId]) acc[folderId] = [];
				acc[folderId].push(doc);
				return acc;
			},
			{},
		);
	}, [allDocuments]);

	const rootDocuments = documentsByFolder["root"] || [];

	// Helper function to get all ancestor folder IDs for a given folder
	const getFolderAncestors = (folderId: string, folders: any[]): string[] => {
		const ancestors: string[] = [];
		
		const findParent = (targetId: string, folderList: any[]): any => {
			for (const folder of folderList) {
				if (folder.id === targetId) {
					return folder;
				}
				if (folder.subFolders) {
					const found = findParent(targetId, folder.subFolders);
					if (found) return found;
				}
			}
			return null;
		};

		const addAncestors = (currentFolderId: string) => {
			const folder = findParent(currentFolderId, folderTree || []);
			if (folder?.parentId) {
				ancestors.push(folder.parentId);
				addAncestors(folder.parentId);
			}
		};

		addAncestors(folderId);
		return ancestors;
	};

	// Auto-expand folders that contain open tabs
	useEffect(() => {
		if (!tabs || tabs.length === 0 || !folderTree || !allDocuments.length) return;

		const openDocumentIds = tabs
			.filter(tab => tab.type === 'document')
			.map(tab => (tab.content as any).documentId);

		if (openDocumentIds.length === 0) return;

		const foldersToExpand = new Set<string>();

		// Find which folders contain open documents
		openDocumentIds.forEach(docId => {
			const document = allDocuments.find(doc => doc.id === docId);
			if (document?.folderId) {
				// Add the direct folder
				foldersToExpand.add(document.folderId);
				// Add all ancestor folders
				const ancestors = getFolderAncestors(document.folderId, folderTree);
				ancestors.forEach(ancestorId => foldersToExpand.add(ancestorId));
			}
		});

		// Update expanded folders if there are new folders to expand
		if (foldersToExpand.size > 0) {
			setExpandedFolders(prev => {
				const newExpanded = new Set([...prev, ...foldersToExpand]);
				return newExpanded;
			});
		}
	}, [tabs, folderTree, allDocuments]);

	const toggleFolder = (folderId: string) => {
		const newExpanded = new Set(expandedFolders);
		if (newExpanded.has(folderId)) {
			newExpanded.delete(folderId);
		} else {
			newExpanded.add(folderId);
		}
		setExpandedFolders(newExpanded);
	};

	// Handler for inline creation from TopIconBar
	const handleInlineCreate = useCallback(
		(type: "folder" | "document", parentFolderId?: string) => {
			setInlineCreate({
				type,
				parentFolderId,
				level: parentFolderId ? 1 : 0, // Root level is 0, items in folders are level 1
			});

			// If creating in a folder, expand that folder
			if (parentFolderId) {
				setExpandedFolders(
					(prev) => new Set([...prev, parentFolderId]),
				);
			}
		},
		[],
	);

	// Register the inline create handler
	useEffect(() => {
		registerInlineCreateHandler(handleInlineCreate);
	}, [registerInlineCreateHandler, handleInlineCreate]);

	const renderFolder = (
		folder: any,
		level = 0,
		isLast = false,
		ancestorLines: boolean[] = [],
	) => {
		const isExpanded = expandedFolders.has(folder.id);
		const hasSubFolders = folder.subFolders && folder.subFolders.length > 0;
		const documentsInFolder = documentsByFolder[folder.id] || [];

		// Always show chevron for folders - they can potentially have content
		// The FolderDocuments component will handle whether to actually show documents
		const showChevron = true;

		// Check if this folder is being renamed
		const isRenaming =
			inlineRename?.type === "folder" &&
			inlineRename.itemId === folder.id;

		return (
			<div key={folder.id}>
				{isRenaming ? (
					<InlineRenameItem
						type="folder"
						itemId={folder.id}
						currentName={folder.name}
						level={level}
						onCancel={() => setInlineRename(null)}
						onSuccess={() => setInlineRename(null)}
					/>
				) : (
					<div className="group flex items-center justify-between hover:bg-primary/10 rounded-sm relative">
						{/* Tree lines */}
						{level > 0 && (
							<div className="absolute left-0 top-0 bottom-0 pointer-events-none">
								{ancestorLines.map((hasLine, index) => (
									<div
										key={index}
										className="absolute top-0 bottom-0 w-px bg-border/30"
										style={{
											left: `${8 + index * 16.5}px`,
										}}
									>
										{hasLine && (
											<div className="w-full h-full bg-border/30" />
										)}
									</div>
								))}
								{/* Current level connector */}
								<div
									className="absolute top-0 w-2 h-1/2 border-l border-b border-border/30"
									style={{
										left: `${8 + (level - 1) * 16.5}px`,
										borderBottomLeftRadius: "2px",
									}}
								/>
								{!isLast && (
									<div
										className="absolute top-1/2 bottom-0 w-px bg-border/30"
										style={{
											left: `${8 + (level - 1) * 16.5}px`,
										}}
									/>
								)}
							</div>
						)}

						<Button
							variant="ghost"
							className="flex-1 justify-start h-auto p-1 px-2 text-xs hover:bg-transparent"
							style={{ paddingLeft: `${0.5 + level * 1.25}rem` }}
							onClick={() => {
								toggleFolder(folder.id);
								setSelectedFolderId(folder.id);
							}}
						>
							<div className="flex items-center space-x-1">
								{showChevron &&
									(isExpanded ? (
										<ChevronDown className="h-3 w-3 text-muted-foreground" />
									) : (
										<ChevronRight className="h-3 w-3 text-muted-foreground" />
									))}
								<Folder className="h-4 w-4 text-blue-500" />
								<span className="truncate">{folder.name}</span>
							</div>
						</Button>
						<FolderContextMenu
							folderId={folder.id}
							level={level}
							onCreateItem={(type, parentFolderId, itemLevel) => {
								setInlineCreate({
									type,
									parentFolderId,
									level: itemLevel,
								});
								// Ensure the folder is expanded to show the new item
								setExpandedFolders(
									(prev) => new Set([...prev, folder.id]),
								);
							}}
							onRename={() => {
								setInlineRename({
									type: "folder",
									itemId: folder.id,
									currentName: folder.name,
									level: level,
								});
							}}
						/>
					</div>
				)}

				{isExpanded && (
					<div>
						{/* Render subfolders */}
						{folder.subFolders?.map(
							(subFolder: any, index: number) => {
								const documentsInThisFolder =
									documentsByFolder[folder.id] || [];
								const isLastSubFolder =
									index === folder.subFolders.length - 1 &&
									documentsInThisFolder.length === 0;
								const newAncestorLines = [
									...ancestorLines,
									!isLast,
								];
								// Debug: console.log(`Rendering subfolder "${subFolder.name}" of parent "${folder.name}"`);
								return renderFolder(
									subFolder,
									level + 1,
									isLastSubFolder,
									newAncestorLines,
								);
							},
						)}
						{/* Render documents in this folder */}
						<FolderDocuments
							folderId={folder.id}
							level={level + 1}
							documents={documentsByFolder[folder.id] || []}
							onDocumentSelect={onDocumentSelect}
							selectedDocumentId={selectedDocumentId}
							ancestorLines={[...ancestorLines, !isLast]}
							inlineRename={inlineRename}
							onRename={(
								type,
								itemId,
								currentName,
								itemLevel,
							) => {
								setInlineRename({
									type,
									itemId,
									currentName,
									level: itemLevel,
								});
							}}
						/>
						{/* Inline creation within this folder */}
						{inlineCreate &&
							inlineCreate.parentFolderId === folder.id && (
								<InlineCreateItem
									type={inlineCreate.type}
									parentFolderId={inlineCreate.parentFolderId}
									level={inlineCreate.level}
									onCancel={() => setInlineCreate(null)}
									onSuccess={() => setInlineCreate(null)}
								/>
							)}
					</div>
				)}
			</div>
		);
	};

	const renderDocument = (
		document: any,
		level = 0,
		isLast = false,
		ancestorLines: boolean[] = [],
	) => {
		const isSelected = selectedDocumentId === document.id;

		// Check if this document is being renamed
		const isRenaming =
			inlineRename?.type === "document" &&
			inlineRename.itemId === document.id;

		return (
			<div key={document.id}>
				{isRenaming ? (
					<InlineRenameItem
						type="document"
						itemId={document.id}
						currentName={document.title}
						level={level}
						onCancel={() => setInlineRename(null)}
						onSuccess={() => setInlineRename(null)}
					/>
				) : (
					<div className="group flex items-center justify-between hover:bg-primary/10 rounded-sm relative">
						{/* Tree lines for documents */}
						{level > 0 && (
							<div className="absolute left-0 top-0 bottom-0 pointer-events-none">
								{ancestorLines.map((hasLine, index) => (
									<div
										key={index}
										className="absolute top-0 bottom-0 w-px bg-border/30"
										style={{
											left: `${8 + index * 16.5}px`,
										}}
									>
										{hasLine && (
											<div className="w-full h-full bg-border/30" />
										)}
									</div>
								))}
								{/* Current level connector */}
								<div
									className="absolute top-0 w-2 h-1/2 border-l border-b border-border/30"
									style={{
										left: `${8 + (level - 1) * 16.5}px`,
										borderBottomLeftRadius: "2px",
									}}
								/>
								{!isLast && (
									<div
										className="absolute top-1/2 bottom-0 w-px bg-border/30"
										style={{
											left: `${8 + (level - 1) * 16.5}px`,
										}}
									/>
								)}
							</div>
						)}

						<Button
							variant="ghost"
							className={cn(
								"flex-1 justify-start h-auto p-1 px-2 text-xs hover:bg-transparent",
								isSelected && "bg-primary/20",
							)}
							style={{ paddingLeft: `${0.5 + level * 1.25}rem` }}
							onClick={() => {
								onDocumentSelect?.(document);
								setSelectedFolderId(null);
							}}
						>
							<div className="flex items-center space-x-1">
								<File className="h-4 w-4 text-gray-500" />
								<span className="truncate">
									{document.title}
								</span>
							</div>
						</Button>
						<DocumentContextMenu
							documentId={document.id}
							onRename={() => {
								setInlineRename({
									type: "document",
									itemId: document.id,
									currentName: document.title,
									level: level,
								});
							}}
						/>
					</div>
				)}
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
	if (
		(!folderTree || folderTree.length === 0) &&
		(!rootDocuments || rootDocuments.length === 0)
	) {
		return (
			<div className="p-3">
				<div className="text-center py-8">
					<Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<h3 className="text-sm font-medium mb-2">
						No documents yet
					</h3>
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
							<Button
								variant="outline"
								size="sm"
								className="w-full"
							>
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
			{folderTree?.map((folder: any, index: number) => {
				const isLastFolder =
					index === folderTree.length - 1 &&
					(!rootDocuments || rootDocuments.length === 0);
				return renderFolder(folder, 0, isLastFolder, []);
			})}

			{/* Render root level documents */}
			{rootDocuments?.map((document: any, index: number) => {
				const isLastDocument = index === rootDocuments.length - 1;
				return renderDocument(document, 0, isLastDocument, []);
			})}

			{/* Inline creation */}
			{inlineCreate && !inlineCreate.parentFolderId && (
				<InlineCreateItem
					type={inlineCreate.type}
					level={inlineCreate.level}
					onCancel={() => setInlineCreate(null)}
					onSuccess={() => setInlineCreate(null)}
				/>
			)}
		</div>
	);
}
