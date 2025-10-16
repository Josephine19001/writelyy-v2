"use client";

import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { MessageSquare } from "lucide-react";
import * as React from "react";

interface AiChatHistoryButtonProps {
	onClick: () => void;
	hasHistory?: boolean;
}

export function AiChatHistoryButton({
	onClick,
	hasHistory = false,
}: AiChatHistoryButtonProps) {
	return (
		<Button
			data-style="ghost"
			onClick={onClick}
			title="View AI Chat History"
			className="relative"
		>
			<MessageSquare className="h-4 w-4" />
			{hasHistory && (
				<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500" />
			)}
		</Button>
	);
}
