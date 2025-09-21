"use client";

import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import { WorkspaceDashboard } from "@saas/shared/components/WorkspaceDashboard";

function EditorContent() {
	return (
		<div className="flex-1 flex items-center justify-center">
			<div className="text-center text-muted-foreground">
				<h3 className="text-lg font-medium">Open a document to start working on</h3>
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
			<EditorContent />
		</div>
	);
}