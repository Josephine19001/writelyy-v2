// Shared types for sources functionality

// Source type matching the API response
export interface Source {
	id: string;
	name: string;
	organizationId: string;
	type: string; // API returns string, not the specific union
	url: string | null;
	filePath: string | null;
	originalFileName: string | null;
	metadata: any;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	creator: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	};
	_count: {
		documentSources: number;
	};
}

export type SourceType = "image" | "pdf" | "doc" | "docx" | "url";