"use client";

import { useEditorContextOptional } from "@shared/tiptap/contexts/editor-context";
import { Bot } from "lucide-react";

import { ChatInterface } from "./ai-panel/ChatInterface";


export function RightAIPanel() {
	const editorContext = useEditorContextOptional();

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 border-b">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Bot className="w-5 h-5 text-primary" />
						<h2 className="font-medium text-sm">Ask Writelyy</h2>
					</div>
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-hidden">
				<ChatInterface editorContext={editorContext} />
			</div>
		</div>
	);
}
