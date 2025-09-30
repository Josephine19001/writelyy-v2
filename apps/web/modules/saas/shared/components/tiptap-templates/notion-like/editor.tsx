"use client";

import { AiProvider } from "@shared/tiptap/contexts/ai-context";
import { AppProvider } from "@shared/tiptap/contexts/app-context";
import { CollabProvider } from "@shared/tiptap/contexts/collab-context";
import { UserProvider } from "@shared/tiptap/contexts/user-context";
import * as React from "react";

// --- Styles ---
import "./editor.scss";
import "./editor-footer.scss";

// --- Components ---
import { EditorContent } from "./editor-content";
import type { NotionEditorProps } from "./types";

export function Editor({
	room,
	placeholder = "Start writing...",
	onChange,
	initialContent,
	savingState,
}: NotionEditorProps) {
	return (
		<UserProvider>
			<AppProvider>
				<CollabProvider room={room}>
					<AiProvider>
						<EditorContent
							placeholder={placeholder}
							onChange={onChange}
							initialContent={initialContent}
							savingState={savingState}
						/>
					</AiProvider>
				</CollabProvider>
			</AppProvider>
		</UserProvider>
	);
}

