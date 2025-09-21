"use client";

import { EditorPlaceholder } from "../EditorPlaceholder";
import { DocumentPreview } from "./previews/DocumentPreview";
import { ImagePreview } from "./previews/ImagePreview";
import { PDFPreview } from "./previews/PDFPreview";
import { URLPreview } from "./previews/URLPreview";
import { TiptapDocumentEditor } from "./TiptapDocumentEditor";
import { EditorTabs } from "./tabs/EditorTabs";
import type { DocumentTab, EditorTab, SourceTab } from "./types";

interface MultiTabEditorProps {
	tabs: EditorTab[];
	activeTabId?: string;
	onTabSelect: (tabId: string) => void;
	onTabClose: (tabId: string) => void;
	onToggleAI?: () => void;
	isAIPanelOpen?: boolean;
}

function renderTabContent(tab: EditorTab) {
	if (tab.type === "document") {
		const documentTab = tab.content as DocumentTab;
		return (
			<TiptapDocumentEditor
				documentId={documentTab.documentId}
				initialContent={documentTab.document?.content || ""}
			/>
		);
	}

	// Source preview
	const sourceTab = tab.content as SourceTab;
	const source = sourceTab.source;

	switch (sourceTab.sourceType) {
		case "image":
			return <ImagePreview source={source} />;
		case "pdf":
			return <PDFPreview source={source} />;
		case "doc":
		case "docx":
			return <DocumentPreview source={source} />;
		case "url":
			return <URLPreview source={source} />;
		default:
			return (
				<div className="flex items-center justify-center h-full">
					<div className="text-center text-muted-foreground">
						<div className="text-lg font-medium">
							Unsupported file type
						</div>
						<div className="text-sm">
							Preview not available for this source type
						</div>
					</div>
				</div>
			);
	}
}

export function MultiTabEditor({
	tabs,
	activeTabId,
	onTabSelect,
	onTabClose,
	onToggleAI,
	isAIPanelOpen,
}: MultiTabEditorProps) {
	const activeTab = tabs.find((tab) => tab.id === activeTabId);

	// Show placeholder when no tabs are open
	if (tabs.length === 0 || !activeTab) {
		return (
			<EditorPlaceholder
				onToggleAI={onToggleAI}
				isAIPanelOpen={isAIPanelOpen}
			/>
		);
	}

	return (
		<div className="flex flex-col h-full">
			{/* Tab Bar */}
			<EditorTabs
				tabs={tabs}
				activeTabId={activeTabId}
				onTabSelect={onTabSelect}
				onTabClose={onTabClose}
			/>

			{/* Tab Content */}
			<div className="flex-1 overflow-hidden">
				{renderTabContent(activeTab)}
			</div>
		</div>
	);
}
