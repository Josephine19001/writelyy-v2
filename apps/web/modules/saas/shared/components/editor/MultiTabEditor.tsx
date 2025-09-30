"use client";
import React from "react";
import { EditorPlaceholder } from "../EditorPlaceholder";
import { Editor } from "../tiptap-templates/notion-like/editor";
import { DocumentPreview } from "./previews/DocumentPreview";
import { ImagePreview } from "./previews/ImagePreview";
import { PDFPreview } from "./previews/PDFPreview";
import { URLPreview } from "./previews/URLPreview";

import { EditorTabs } from "./tabs/EditorTabs";
import type { DocumentTab, EditorTab, SourceTab } from "./types";

interface MultiTabEditorProps {
	tabs: EditorTab[];
	activeTabId?: string;
	onTabSelect: (tabId: string) => void;
	onTabClose: (tabId: string) => void;
	onToggleAI?: () => void;
	isAIPanelOpen?: boolean;
	onDocumentChange?: (documentId: string, content: any) => void;
	savingState?: {
		isSaving: boolean;
		lastSaved: Date | null;
		hasUnsavedChanges: boolean;
	};
}

function renderTabContent(
	tab: EditorTab,
	onDocumentChange?: (documentId: string, content: any) => void,
	savingState?: MultiTabEditorProps["savingState"],
) {

	if (tab.type === "document") {
		const documentTab = tab.content as DocumentTab;

		return (
			<div
				key={`editor-container-${documentTab.documentId}`}
				className="h-full"
			>
				<div className="h-full">
					<Editor
						key={`editor-instance-${documentTab.documentId}-${tab.id}`}
						room={`doc-${documentTab.documentId}`}
						placeholder="Start writing..."
						initialContent={documentTab.document.content}
						onChange={
							onDocumentChange
								? (content) =>
										onDocumentChange(
											documentTab.documentId,
											content,
										)
								: undefined
						}
						savingState={savingState}
					/>
				</div>
			</div>
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
	onDocumentChange,
	savingState,
}: MultiTabEditorProps) {
	const activeTab = tabs.find((tab) => tab.id === activeTabId);


	// Force re-render when activeTabId changes by not memoizing
	const tabContent = (() => {
		if (!activeTab) {
			return (
				<div className="flex items-center justify-center h-full text-muted-foreground">
					<div className="text-sm">No tab selected</div>
				</div>
			);
		}
		
		return renderTabContent(activeTab, onDocumentChange, savingState);
	})();

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
			<div key={activeTabId} className="flex-1 overflow-hidden">{tabContent}</div>
		</div>
	);
}
