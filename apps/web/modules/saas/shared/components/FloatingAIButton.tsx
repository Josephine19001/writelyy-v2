"use client";

import { Bot } from "lucide-react";
import { IconButton } from "@ui/components/icon-button";

interface FloatingAIButtonProps {
	onClick: () => void;
	isAIOpen: boolean;
}

export function FloatingAIButton({ onClick, isAIOpen }: FloatingAIButtonProps) {
	// Don't show the floating button if AI panel is already open
	if (isAIOpen) return null;

	return (
		<div className="fixed bottom-6 right-6 z-50">
			<IconButton
				variant="default"
				size="lg"
				icon={<Bot className="h-6 w-6" />}
				onClick={onClick}
				className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 rounded-full w-14 h-14"
				title="Open AI Assistant"
			/>
		</div>
	);
}