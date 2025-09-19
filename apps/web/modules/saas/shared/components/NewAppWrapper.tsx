"use client";

import { ThreePanelLayout } from "@saas/shared/components/ThreePanelLayout";
import { LeftSidebar } from "@saas/shared/components/LeftSidebar";
import { RightAIPanel } from "@saas/shared/components/RightAIPanel";
import { EditorPlaceholder } from "@saas/shared/components/EditorPlaceholder";
import { useState, type PropsWithChildren } from "react";

export function NewAppWrapper({ children }: PropsWithChildren) {
	const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);

	const handleAIToggle = () => {
		setIsAIPanelOpen(!isAIPanelOpen);
	};

	return (
		<div className="h-screen bg-background">
			<ThreePanelLayout
				leftPanel={<LeftSidebar />}
				rightPanel={<RightAIPanel />}
				onAIToggle={setIsAIPanelOpen}
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