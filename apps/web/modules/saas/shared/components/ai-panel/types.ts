export interface ChatMessage {
	id: string;
	role: "user" | "ai";
	content: string;
	timestamp: Date;
	mentions?: MentionItem[];
}

export interface MentionItem {
	id: string;
	name: string;
	type: "document" | "folder" | "source" | "asset";
	subtype?: "image" | "pdf" | "link";
	url?: string;
	folderName?: string;
}

export interface GroupedMentions {
	[key: string]: MentionItem[];
}

export interface MentionAutocompleteProps {
	query: string;
	onSelect: (item: MentionItem) => void;
	onClose: () => void;
	position: { top: number; left: number };
	mentionItems?: MentionItem[];
}

export interface ChatInterfaceProps {
	editorContext?: any; // Will be typed properly when we know the exact editor context type
}