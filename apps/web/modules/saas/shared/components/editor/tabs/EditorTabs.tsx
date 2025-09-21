"use client";

import { Button } from "@ui/components/button";
import { cn } from "@ui/lib";
import { File, FileImage, FileText, Image, Link, X } from "lucide-react";
import { type EditorTab } from "../types";

interface EditorTabsProps {
	tabs: EditorTab[];
	activeTabId?: string;
	onTabSelect: (tabId: string) => void;
	onTabClose: (tabId: string) => void;
}

function getTabIcon(tab: EditorTab) {
	if (tab.type === "document") {
		return <FileText className="h-4 w-4" />;
	}

	// Source tab icons
	const sourceTab = tab.content as any;
	switch (sourceTab.sourceType) {
		case "image":
			return <Image className="h-4 w-4 text-green-600" />;
		case "pdf":
			return <FileImage className="h-4 w-4 text-red-600" />;
		case "doc":
		case "docx":
			return <File className="h-4 w-4 text-blue-600" />;
		case "url":
			return <Link className="h-4 w-4 text-purple-600" />;
		default:
			return <File className="h-4 w-4 text-gray-600" />;
	}
}

export function EditorTabs({
	tabs,
	activeTabId,
	onTabSelect,
	onTabClose,
}: EditorTabsProps) {
	if (tabs.length === 0) {
		return null;
	}

	return (
		<div className="flex items-center border-b bg-background overflow-x-auto border-x ">
			{tabs.map((tab) => {
				const isActive = activeTabId === tab.id;

				return (
					<div
						key={tab.id}
						className={cn(
							"group flex items-center border-r border-border min-w-0 max-w-[200px] hover:bg-primary/10",
							isActive &&
								"border-b-2 border-b-primary bg-background",
						)}
					>
						<Button
							variant="ghost"
							className={cn(
								"flex-1 justify-start h-10 px-3 rounded-none text-sm font-normal min-w-0 bg-transparent hover:bg-transparent",
								isActive && "text-foreground",
								!isActive && "text-muted-foreground",
							)}
							onClick={() => onTabSelect(tab.id)}
						>
							<div className="flex items-center space-x-2 min-w-0">
								{getTabIcon(tab)}
								<span className="truncate text-xs">
									{tab.title}
									{tab.isDirty && "*"}
								</span>
							</div>
						</Button>

						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"bg-transparent hover:bg-transparent p-1",
								isActive
									? "opacity-100"
									: "opacity-0 group-hover:opacity-100",
							)}
							onClick={(e) => {
								e.stopPropagation();
								onTabClose(tab.id);
							}}
						>
							<X
								size={14}
								className="text-muted-foreground hover:text-destructive"
							/>
						</Button>
					</div>
				);
			})}
		</div>
	);
}
