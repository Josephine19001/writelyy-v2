"use client";

import { Button } from "@ui/components/button";
import { cn } from "@ui/lib";
import { File } from "lucide-react";
import { DocumentContextMenu } from "../menus/DocumentContextMenu";
import { InlineRenameItem } from "./InlineRenameItem";
import { useEditorContext } from "../../NewAppWrapper";

interface FolderDocumentsProps {
	folderId: string;
	level: number;
	documents: any[];
	onDocumentSelect?: (document: any) => void;
	selectedDocumentId?: string;
	ancestorLines?: boolean[];
	inlineRename?: {
		type: "folder" | "document";
		itemId: string;
		currentName: string;
		level: number;
	} | null;
	onRename?: (type: "folder" | "document", itemId: string, currentName: string, level: number) => void;
}

export function FolderDocuments({ 
	folderId, 
	level,
	documents,
	onDocumentSelect,
	selectedDocumentId,
	ancestorLines = [],
	inlineRename,
	onRename
}: FolderDocumentsProps) {
	const { setSelectedFolderId } = useEditorContext();

	if (!documents || documents.length === 0) return null;

	return (
		<div>
			{documents.map((document: any, index: number) => {
				const isSelected = selectedDocumentId === document.id;
				const isLastDocument = index === documents.length - 1;
				
				// Check if this document is being renamed
				const isRenaming = inlineRename?.type === "document" && inlineRename.itemId === document.id;
				
				return (
					<div key={document.id}>
						{isRenaming ? (
							<InlineRenameItem
								type="document"
								itemId={document.id}
								currentName={document.title}
								level={level}
								onCancel={() => {}} // Will be handled by parent
								onSuccess={() => {}} // Will be handled by parent
							/>
						) : (
							<div className="group flex items-center justify-between hover:bg-primary/10 rounded-sm relative">
						{/* Tree lines for documents */}
						{level > 0 && (
							<div className="absolute left-0 top-0 bottom-0 pointer-events-none">
								{ancestorLines.map((hasLine, lineIndex) => (
									<div
										key={lineIndex}
										className="absolute top-0 bottom-0 w-px bg-border/30"
										style={{ left: `${8 + lineIndex * 16.5}px` }}
									>
										{hasLine && <div className="w-full h-full bg-border/30" />}
									</div>
								))}
								{/* Current level connector */}
								<div 
									className="absolute top-0 w-2 h-1/2 border-l border-b border-border/30"
									style={{ 
										left: `${8 + (level - 1) * 16.5}px`,
										borderBottomLeftRadius: '2px'
									}}
								/>
								{!isLastDocument && (
									<div 
										className="absolute top-1/2 bottom-0 w-px bg-border/30"
										style={{ left: `${8 + (level - 1) * 16.5}px` }}
									/>
								)}
							</div>
						)}
						
						<Button
							variant="ghost"
							className={cn(
								"flex-1 justify-start h-auto p-1 px-2 text-xs hover:bg-transparent",
								isSelected && "bg-primary/20"
							)}
							style={{ paddingLeft: `${0.5 + level * 1.25}rem` }}
							onClick={() => {
								onDocumentSelect?.(document);
								setSelectedFolderId(null);
							}}
						>
							<div className="flex items-center space-x-1">
								<File className="h-4 w-4 text-gray-500" />
								<span className="truncate">{document.title}</span>
							</div>
						</Button>
						<DocumentContextMenu 
							documentId={document.id} 
							onRename={() => {
								onRename?.("document", document.id, document.title, level);
							}}
						/>
					</div>
					)}
				</div>
				);
			})}
		</div>
	);
}