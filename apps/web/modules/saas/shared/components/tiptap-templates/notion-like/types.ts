import type { TiptapCollabProvider } from "@tiptap-pro/provider";
import type { Doc as YDoc } from "yjs";

export interface NotionEditorProps {
	room: string;
	placeholder?: string;
	onChange?: (content: any) => void;
	initialContent?: any;
	savingState?: {
		isSaving: boolean;
		lastSaved: Date | null;
		hasUnsavedChanges: boolean;
	};
}

export interface EditorProviderProps {
	provider: TiptapCollabProvider | null;
	ydoc: YDoc;
	placeholder?: string;
	aiToken: string | null;
	onChange?: (content: any) => void;
	initialContent?: any;
	savingState?: {
		isSaving: boolean;
		lastSaved: Date | null;
		hasUnsavedChanges: boolean;
	};
}