export interface EditorTab {
	id: string;
	title: string;
	type: 'document' | 'source';
	content: DocumentTab | SourceTab;
	isDirty?: boolean;
}

export interface DocumentTab {
	type: 'document';
	documentId: string;
	document: any; // Document data from API
}

export interface SourceTab {
	type: 'source';
	sourceId: string;
	source: any; // Source data from API
	sourceType: 'image' | 'pdf' | 'doc' | 'docx' | 'url';
}

export type TabContent = DocumentTab | SourceTab;