"use client";

import { Button } from "@ui/components/button";
import { cn } from "@ui/lib";
import { File, Loader2 } from "lucide-react";
import { useEditorContext } from "../../NewAppWrapper";
import { DocumentContextMenu } from "../menus/DocumentContextMenu";
import { InlineRenameItem } from "./InlineRenameItem";

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
	onRename?: (
		type: "folder" | "document",
		itemId: string,
		currentName: string,
		level: number,
	) => void;
	onClearRename?: () => void;
	savingItems?: Record<string, string>;
	onRenameSuccess?: (itemId: string, newName: string) => void;
}

export function FolderDocuments({
	folderId,
	level,
	documents,
	onDocumentSelect,
	selectedDocumentId,
	ancestorLines = [],
	inlineRename,
	onRename,
	onClearRename,
	savingItems = {},
	onRenameSuccess,
}: FolderDocumentsProps) {
	const { setSelectedFolderId } = useEditorContext();

	if (!documents || documents.length === 0) return null;

	return (
		<div>
			{documents.map((document: any, index: number) => {
				const isSelected = selectedDocumentId === document.id;
				const isLastDocument = index === documents.length - 1;

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
								onCancel={() => onClearRename?.()}
								onSuccess={(newName) => {
									onClearRename?.();
									onRenameSuccess?.(document.id, newName);
								}}
							/>
						) : (
							<div
								className={cn(
									"group flex items-center justify-between hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent rounded-xl transition-all duration-300 relative hover:shadow-sm hover:shadow-primary/10 hover:translate-x-0.5",
									isSelected &&
										"bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 shadow-sm shadow-primary/20",
								)}
							>
								{/* Tree lines for documents */}
								{level > 0 && (
									<div className="absolute left-0 top-0 bottom-0 pointer-events-none">
										{ancestorLines.map(
											(hasLine, lineIndex) => (
												<div
													key={lineIndex}
													className="absolute top-0 bottom-0 w-px bg-border/20"
													style={{
														left: `${8 + lineIndex * 16.5}px`,
													}}
												>
													{hasLine && (
														<div className="w-full h-full bg-border/20" />
													)}
												</div>
											),
										)}
										{/* Current level connector */}
										<div
											className="absolute top-0 w-2 h-1/2 border-l border-b border-border/20"
											style={{
												left: `${8 + (level - 1) * 16.5}px`,
												borderBottomLeftRadius: "2px",
											}}
										/>
										{!isLastDocument && (
											<div
												className="absolute top-1/2 bottom-0 w-px bg-border/20"
												style={{
													left: `${8 + (level - 1) * 16.5}px`,
												}}
											/>
										)}
									</div>
								)}

								<Button
									variant="ghost"
									className="flex-1 justify-start h-auto p-2 text-[11px] hover:bg-transparent"
									style={{
										paddingLeft: `${0.5 + level * 1.5}rem`,
									}}
									onClick={() => {
										onDocumentSelect?.(document);
										setSelectedFolderId(null);
									}}
								>
									<div className="flex items-center gap-1.5">
										<File className="h-3 w-3 text-muted-foreground flex-shrink-0" />
										<span className="truncate text-foreground">
											{savingItems[document.id] ||
												document.title}
										</span>
										{savingItems[document.id] && (
											<Loader2 className="h-3 w-3 text-muted-foreground animate-spin flex-shrink-0" />
										)}
									</div>
								</Button>
								<div className="opacity-0 group-hover:opacity-100 transition-opacity">
									<DocumentContextMenu
										documentId={document.id}
										onRename={() => {
											onRename?.(
												"document",
												document.id,
												document.title,
												level,
											);
										}}
									/>
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
