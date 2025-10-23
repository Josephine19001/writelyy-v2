import type { WebsocketProvider } from "y-websocket";
import type { Doc as YDoc } from "yjs";

export interface NotionEditorProps {
	placeholder?: string;
	onChange?: (content: any) => void;
	initialContent?: any;
	savingState?: {
		isSaving: boolean;
		lastSaved: Date | null;
		hasUnsavedChanges: boolean;
	};
	documentId?: string;
	documentTitle?: string;
}

export interface EditorProviderProps {
	provider: WebsocketProvider | null;
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
	documentId?: string;
}