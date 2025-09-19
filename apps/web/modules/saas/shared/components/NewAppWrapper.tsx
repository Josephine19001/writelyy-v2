"use client";

import { ThreePanelLayout } from "@saas/shared/components/ThreePanelLayout";
import { LeftSidebar } from "@saas/shared/components/LeftSidebar";
import { RightAIPanel } from "@saas/shared/components/RightAIPanel";
import { EditorPlaceholder } from "@saas/shared/components/EditorPlaceholder";
import { useState, useEffect, type PropsWithChildren } from "react";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";

export function NewAppWrapper({ children }: PropsWithChildren) {
	const { activeWorkspace } = useActiveWorkspace();
	const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);

	// Collapse AI panel when no workspace is selected
	useEffect(() => {
		if (!activeWorkspace) {
			setIsAIPanelOpen(false);
		} else {
			setIsAIPanelOpen(true);
		}
	}, [activeWorkspace]);

	const handleAIToggle = () => {
		setIsAIPanelOpen(!isAIPanelOpen);
	};

	return (
		<div className="h-screen bg-background">
			<ThreePanelLayout
				leftPanel={<LeftSidebar />}
				rightPanel={<RightAIPanel />}
				onAIToggle={setIsAIPanelOpen}
				initialRightPanelCollapsed={!activeWorkspace}
			>
				{children || (
					<EditorPlaceholder 
						onToggleAI={handleAIToggle}
						isAIPanelOpen={isAIPanelOpen}
					/>
				)}
			</ThreePanelLayout>
		</div>
	);
}