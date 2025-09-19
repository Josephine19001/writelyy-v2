"use client";

import { cn } from "@ui/lib";
import {
	Bold,
	Italic,
	Underline,
	AlignLeft,
	AlignCenter,
	AlignRight,
	List,
	ListOrdered,
	Link,
	Image,
	Table,
	Code,
	Quote,
	Undo,
	Redo,
	Save,
	Sparkles,
} from "lucide-react";
import { Button } from "@ui/components/button";
import { Separator } from "@ui/components/separator";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { WorkspaceDashboard } from "@saas/shared/components/WorkspaceDashboard";

function EditorToolbar({ 
	onToggleAI, 
	isAIPanelOpen 
}: { 
	onToggleAI?: () => void;
	isAIPanelOpen?: boolean; 
}) {
	const toolbarGroups = [
		{
			items: [
				{ 
					icon: Sparkles, 
					label: "AI Assistant", 
					variant: (isAIPanelOpen ? "default" : "outline") as const,
					onClick: onToggleAI
				},
			],
		},
		{
			items: [
				{ icon: Bold, label: "Bold" },
				{ icon: Italic, label: "Italic" },
				{ icon: Underline, label: "Underline" },
			],
		},
		{
			items: [
				{ icon: AlignLeft, label: "Align Left" },
				{ icon: AlignCenter, label: "Align Center" },
				{ icon: AlignRight, label: "Align Right" },
			],
		},
		{
			items: [
				{ icon: List, label: "Bullet List" },
				{ icon: ListOrdered, label: "Numbered List" },
				{ icon: Quote, label: "Quote" },
			],
		},
		{
			items: [
				{ icon: Link, label: "Insert Link" },
				{ icon: Image, label: "Insert Image" },
				{ icon: Table, label: "Insert Table" },
				{ icon: Code, label: "Code Block" },
			],
		},
		{
			items: [
				{ icon: Undo, label: "Undo" },
				{ icon: Redo, label: "Redo" },
				{ icon: Save, label: "Save" },
			],
		},
	];

	return (
		<div className="flex items-center gap-1 p-2 border-b bg-background">
			{toolbarGroups.map((group, groupIndex) => (
				<div key={groupIndex} className="flex items-center">
					{group.items.map((item, itemIndex) => (
						<Button
							key={itemIndex}
							variant={item.variant || "ghost"}
							size="sm"
							className="h-8 w-8 p-0"
							title={item.label}
							onClick={item.onClick}
						>
							<item.icon className="h-4 w-4" />
						</Button>
					))}
					{groupIndex < toolbarGroups.length - 1 && (
						<Separator orientation="vertical" className="h-6 mx-1" />
					)}
				</div>
			))}
		</div>
	);
}

function EditorContent() {
	return (
		<div className="flex-1 p-8 overflow-y-auto">
			<div className="max-w-4xl mx-auto">
				{/* Placeholder content that looks like a document */}
				<div className="space-y-6">
					<div className="space-y-2">
						<div className="h-8 bg-muted rounded animate-pulse w-3/4"></div>
						<div className="h-4 bg-muted/60 rounded animate-pulse w-1/2"></div>
					</div>
					
					<div className="space-y-3">
						<div className="h-4 bg-muted/40 rounded animate-pulse"></div>
						<div className="h-4 bg-muted/40 rounded animate-pulse w-5/6"></div>
						<div className="h-4 bg-muted/40 rounded animate-pulse w-4/5"></div>
					</div>

					<div className="space-y-3">
						<div className="h-6 bg-muted/60 rounded animate-pulse w-2/3"></div>
						<div className="h-4 bg-muted/40 rounded animate-pulse"></div>
						<div className="h-4 bg-muted/40 rounded animate-pulse w-3/4"></div>
						<div className="h-4 bg-muted/40 rounded animate-pulse w-5/6"></div>
					</div>

					<div className="space-y-3">
						<div className="h-4 bg-muted/40 rounded animate-pulse w-4/5"></div>
						<div className="h-4 bg-muted/40 rounded animate-pulse"></div>
						<div className="h-4 bg-muted/40 rounded animate-pulse w-2/3"></div>
					</div>
				</div>

				{/* Floating placeholder text */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div className="text-center text-muted-foreground">
						<h3 className="text-lg font-medium mb-2">TipTap Editor will be here</h3>
						<p className="text-sm">Notion-like block editor with AI integration</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export function EditorPlaceholder({ 
	onToggleAI, 
	isAIPanelOpen 
}: { 
	onToggleAI?: () => void;
	isAIPanelOpen?: boolean; 
}) {
	const { activeWorkspace } = useActiveWorkspace();
	
	// If no workspace is selected, show workspace dashboard
	if (!activeWorkspace) {
		return (
			<div className="flex flex-col h-full bg-card">
				<WorkspaceDashboard />
			</div>
		);
	}
	
	// If workspace is selected, show editor placeholder
	return (
		<div className="flex flex-col h-full bg-card">
			<EditorToolbar onToggleAI={onToggleAI} isAIPanelOpen={isAIPanelOpen} />
			<div className="relative flex-1">
				<EditorContent />
			</div>
		</div>
	);
}