"use client";

import { AiProvider } from "@shared/tiptap/contexts/ai-context";
import { AppProvider } from "@shared/tiptap/contexts/app-context";
import { UserProvider } from "@shared/tiptap/contexts/user-context";
import * as React from "react";

// --- Styles ---
import "./editor.scss";
import "./editor-footer.scss";
import "./editor-content-overrides.scss";

// --- Toolbar Styles ---
import "@shared/tiptap/components/tiptap-ui-primitive/toolbar/toolbar.scss";

// --- Node Styles ---
import "@shared/tiptap/components/tiptap-node/heading-node/heading-node.scss";
import "@shared/tiptap/components/tiptap-node/list-node/list-node.scss";
import "@shared/tiptap/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@shared/tiptap/components/tiptap-node/code-block-node/code-block-node.scss";
import "@shared/tiptap/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@shared/tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@shared/tiptap/components/tiptap-node/image-node/image-node.scss";

// --- Components ---
import { EditorContent } from "./editor-content";
import type { NotionEditorProps } from "./types";

export function Editor({
	placeholder = "Start writing...",
	onChange,
	initialContent,
	savingState,
	documentId,
}: NotionEditorProps) {
	return (
		<UserProvider>
			<AppProvider>
				<AiProvider>
					<EditorContent
						placeholder={placeholder}
						onChange={onChange}
						initialContent={initialContent}
						savingState={savingState}
						documentId={documentId}
					/>
				</AiProvider>
			</AppProvider>
		</UserProvider>
	);
}
