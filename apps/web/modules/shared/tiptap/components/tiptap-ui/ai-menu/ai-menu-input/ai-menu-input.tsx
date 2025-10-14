"use client";

import { AiSparklesIcon } from "@shared/tiptap/components/tiptap-icons/ai-sparkles-icon";
import { ArrowUpIcon } from "@shared/tiptap/components/tiptap-icons/arrow-up-icon";

// Icons
import { MicAiIcon } from "@shared/tiptap/components/tiptap-icons/mic-ai-icon";
import { SnippetIcon } from "@shared/tiptap/components/tiptap-icons/snippet-icon";
import { SourcesIcon } from "@shared/tiptap/components/tiptap-icons/sources-icon";
// UI Components
import { SUPPORTED_TONES } from "@shared/tiptap/components/tiptap-ui/ai-menu";
// UI Primitives
import {
	Button,
	ButtonGroup,
} from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	Card,
	CardBody,
} from "@shared/tiptap/components/tiptap-ui-primitive/card";
import { Combobox } from "@shared/tiptap/components/tiptap-ui-primitive/combobox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/dropdown-menu";
import { useComboboxValueState } from "@shared/tiptap/components/tiptap-ui-primitive/menu";
import { Spacer } from "@shared/tiptap/components/tiptap-ui-primitive/spacer";
import { TextareaAutosize } from "@shared/tiptap/components/tiptap-ui-primitive/textarea-autosize";
import {
	Toolbar,
	ToolbarGroup,
} from "@shared/tiptap/components/tiptap-ui-primitive/toolbar";
// Tiptap Core Extensions
import type { Tone } from "@shared/tiptap/types/ai-types";
import * as React from "react";

import { useBlurHandler, useKeyboardHandlers } from "./ai-menu-input-hooks";
import type { AiMenuInputTextareaProps } from "./ai-menu-input-types";

// Styles
import "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu-input/ai-menu-input.scss";

// Hooks for snippets and sources
import { useSnippetsQuery, useSourcesQuery } from "@saas/lib/api";
import { useActiveWorkspace } from "@saas/workspaces/hooks/use-active-workspace";
import type { Source } from "@saas/shared/components/workspace/sources/types";
import { File, FileImage, Image, Link } from "lucide-react";

// Helper to get source icon component (not JSX element)
const getSourceIconComponent = (type: string) => {
	switch (type) {
		case "image":
			return Image;
		case "pdf":
			return FileImage;
		case "doc":
		case "docx":
			return File;
		case "url":
			return Link;
		default:
			return File;
	}
};

interface Snippet {
	id: string;
	title: string;
	content: string;
	category?: string | null;
}

export function AiMenuInputPlaceholder({
	onPlaceholderClick,
}: {
	onPlaceholderClick: () => void;
}) {
	return (
		<div
			className="tiptap-ai-prompt-input-placeholder"
			onClick={onPlaceholderClick}
		>
			<div className="tiptap-ai-prompt-input-placeholder-content">
				<AiSparklesIcon className="tiptap-ai-prompt-input-placeholder-icon" />
				<span className="tiptap-ai-prompt-input-placeholder-text">
					Tell AI what else needs to be changed...
				</span>
			</div>
			<Button data-style="primary" disabled>
				<ArrowUpIcon className="tiptap-button-icon" />
			</Button>
		</div>
	);
}

export function ToneSelector({
	tone,
	onToneChange,
}: {
	tone: Tone | null;
	onToneChange: (tone: string) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					data-active-state={tone ? "on" : "off"}
					role="button"
					tabIndex={-1}
					aria-label="Tone adjustment options"
				>
					<MicAiIcon className="tiptap-button-icon" />
					<span className="tiptap-button-text">Tone</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start">
				<Card>
					<CardBody>
						<ButtonGroup>
							{SUPPORTED_TONES.map((supportedTone) => (
								<DropdownMenuItem
									key={supportedTone.value}
									asChild
								>
									<Button
										data-style="ghost"
										data-active-state={
											tone === supportedTone.value
												? "on"
												: "off"
										}
										onClick={() =>
											onToneChange(supportedTone.value)
										}
									>
										<span className="tiptap-button-text">
											{supportedTone.label}
										</span>
									</Button>
								</DropdownMenuItem>
							))}
						</ButtonGroup>
					</CardBody>
				</Card>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function SnippetSelector({
	selectedSnippet,
	onSnippetSelect,
}: {
	selectedSnippet: Snippet | null;
	onSnippetSelect: (snippet: Snippet) => void;
}) {
	const { activeWorkspace } = useActiveWorkspace();
	const { data: snippetsData } = useSnippetsQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id }
	);

	const snippets = snippetsData?.snippets || [];

	// Group snippets by category
	const groupedSnippets = React.useMemo(() => {
		const groups: Record<string, Snippet[]> = {};
		snippets.forEach((snippet: Snippet) => {
			const category = snippet.category || "General";
			if (!groups[category]) {
				groups[category] = [];
			}
			groups[category].push(snippet);
		});
		return groups;
	}, [snippets]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					data-active-state={selectedSnippet ? "on" : "off"}
					role="button"
					tabIndex={-1}
					aria-label="Insert snippet"
				>
					<SnippetIcon className="tiptap-button-icon" />
					<span className="tiptap-button-text">
						{selectedSnippet ? selectedSnippet.title : "Snippet"}
					</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="max-h-96 overflow-y-auto">
				<Card>
					<CardBody>
						{Object.keys(groupedSnippets).length === 0 ? (
							<div className="p-4 text-center text-sm text-muted-foreground">
								No snippets available
							</div>
						) : (
							<ButtonGroup>
								{Object.entries(groupedSnippets).map(([category, categorySnippets]) => (
									<div key={category}>
										<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">
											{category}
										</div>
										{categorySnippets.map((snippet: Snippet) => (
											<DropdownMenuItem
												key={snippet.id}
												asChild
											>
												<Button
													data-style="ghost"
													data-active-state={
														selectedSnippet?.id === snippet.id
															? "on"
															: "off"
													}
													onClick={() => onSnippetSelect(snippet)}
													className="flex flex-col items-start w-full text-left"
												>
													<span className="tiptap-button-text font-medium text-left w-full">
														{snippet.title}
													</span>
													<span className="text-xs text-muted-foreground line-clamp-1 text-left w-full">
														{snippet.content.slice(0, 50)}
														{snippet.content.length > 50 ? "..." : ""}
													</span>
												</Button>
											</DropdownMenuItem>
										))}
									</div>
								))}
							</ButtonGroup>
						)}
					</CardBody>
				</Card>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function SourceSelector({
	selectedSource,
	onSourceSelect,
}: {
	selectedSource: Source | null;
	onSourceSelect: (source: Source) => void;
}) {
	const { activeWorkspace } = useActiveWorkspace();
	const { data: sourcesData } = useSourcesQuery(
		activeWorkspace?.id || "",
		{ enabled: !!activeWorkspace?.id }
	);

	const sources = sourcesData?.sources || [];

	// Group sources by type
	const groupedSources = React.useMemo(() => {
		const groups: Record<string, Source[]> = {};
		sources.forEach((source: Source) => {
			const type = source.type || "other";
			if (!groups[type]) {
				groups[type] = [];
			}
			groups[type].push(source);
		});
		return groups;
	}, [sources]);

	const getSourcePreview = (source: Source) => {
		if (source.type === "url") {
			return source.url || "No URL";
		}
		if (source.type === "image") {
			return "Image file";
		}
		return `${source.type.toUpperCase()} file`;
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					data-active-state={selectedSource ? "on" : "off"}
					role="button"
					tabIndex={-1}
					aria-label="Add source context"
				>
					<SourcesIcon className="tiptap-button-icon" />
					<span className="tiptap-button-text">
						{selectedSource ? selectedSource.name : "Source"}
					</span>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="max-h-96 overflow-y-auto">
				<Card>
					<CardBody>
						{Object.keys(groupedSources).length === 0 ? (
							<div className="p-4 text-center text-sm text-muted-foreground">
								No sources available
							</div>
						) : (
							<ButtonGroup>
								{Object.entries(groupedSources).map(([type, typeSources]) => (
									<div key={type}>
										<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide text-left">
											{type}
										</div>
										{typeSources.map((source: Source) => {
											const SourceIconComponent = getSourceIconComponent(source.type);
											return (
												<DropdownMenuItem
													key={source.id}
													asChild
												>
													<Button
														data-style="ghost"
														data-active-state={
															selectedSource?.id === source.id
																? "on"
																: "off"
														}
														onClick={() => onSourceSelect(source)}
														className="flex flex-col items-start w-full text-left"
													>
														<div className="flex items-center gap-2 w-full">
															<SourceIconComponent className="h-4 w-4 flex-shrink-0" />
															<span className="tiptap-button-text font-medium text-left flex-1">
																{source.name}
															</span>
														</div>
														<span className="text-xs text-muted-foreground line-clamp-1 text-left w-full pl-6">
															{getSourcePreview(source)}
														</span>
													</Button>
												</DropdownMenuItem>
											);
										})}
									</div>
								))}
							</ButtonGroup>
						)}
					</CardBody>
				</Card>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function AiPromptInputToolbar({
	showPlaceholder,
	onInputSubmit,
	onToneChange,
	onSnippetSelect,
	onSourceSelect,
	isEmpty = false,
}: {
	showPlaceholder?: boolean;
	onInputSubmit: (prompt: string, snippet?: Snippet, source?: Source) => void;
	onToneChange?: (tone: string) => void;
	onSnippetSelect?: (snippet: Snippet) => void;
	onSourceSelect?: (source: Source) => void;
	isEmpty?: boolean;
}) {
	const [tone, setTone] = React.useState<Tone | null>(null);
	const [selectedSnippet, setSelectedSnippet] = React.useState<Snippet | null>(null);
	const [selectedSource, setSelectedSource] = React.useState<Source | null>(null);
	const [promptValue] = useComboboxValueState();

	const handleToneChange = React.useCallback(
		(newTone: string) => {
			setTone(newTone);
			onToneChange?.(newTone);
		},
		[onToneChange],
	);

	const handleSnippetSelect = React.useCallback(
		(snippet: Snippet) => {
			setSelectedSnippet(snippet);
			onSnippetSelect?.(snippet);
		},
		[onSnippetSelect],
	);

	const handleSourceSelect = React.useCallback(
		(source: Source) => {
			setSelectedSource(source);
			onSourceSelect?.(source);
		},
		[onSourceSelect],
	);

	const handleSubmit = React.useCallback(() => {
		onInputSubmit(promptValue, selectedSnippet || undefined, selectedSource || undefined);
		// Reset selected snippet and source after submit
		setSelectedSnippet(null);
		setSelectedSource(null);
	}, [onInputSubmit, promptValue, selectedSnippet, selectedSource]);

	return (
		<Toolbar
			variant="floating"
			data-plain="true"
			className="tiptap-ai-prompt-input-toolbar"
			style={{ display: showPlaceholder ? "none" : "flex" }}
		>
			<ToolbarGroup>
				<ToneSelector tone={tone} onToneChange={handleToneChange} />
				<SnippetSelector
					selectedSnippet={selectedSnippet}
					onSnippetSelect={handleSnippetSelect}
				/>
				<SourceSelector
					selectedSource={selectedSource}
					onSourceSelect={handleSourceSelect}
				/>
			</ToolbarGroup>

			<Spacer />

			<ToolbarGroup>
				<Button
					onClick={handleSubmit}
					disabled={isEmpty}
					data-style="primary"
					aria-label="Submit prompt"
				>
					<ArrowUpIcon className="tiptap-button-icon" />
				</Button>
			</ToolbarGroup>
		</Toolbar>
	);
}

export function AiMenuInputTextarea({
	onInputSubmit,
	onToneChange,
	onClose,
	onInputFocus,
	onInputBlur,
	onEmptyBlur,
	onPlaceholderClick,
	showPlaceholder = false,
	placeholder = "Ask AI what you want...",
	...props
}: AiMenuInputTextareaProps) {
	const [promptValue, setPromptValue] = useComboboxValueState();
	const [isFocused, setIsFocused] = React.useState(false);
	const [selectedSnippet, setSelectedSnippet] = React.useState<Snippet | null>(null);
	const [selectedSource, setSelectedSource] = React.useState<Source | null>(null);

	const handleSnippetSelect = React.useCallback((snippet: Snippet) => {
		setSelectedSnippet(snippet);
	}, []);

	const handleSourceSelect = React.useCallback((source: Source) => {
		setSelectedSource(source);
	}, []);

	const handleSubmit = React.useCallback((prompt: string, snippet?: Snippet, source?: Source) => {
		const cleanedPrompt = prompt?.trim();
		if (cleanedPrompt) {
			// Build final prompt with context
			let finalPrompt = cleanedPrompt;
			const snippetToUse = snippet || selectedSnippet;
			const sourceToUse = source || selectedSource;

			// Add snippet context if available
			if (snippetToUse) {
				finalPrompt = `${finalPrompt}\n\nContext from snippet "${snippetToUse.title}":\n${snippetToUse.content}`;
			}

			// Add source context if available
			if (sourceToUse) {
				const sourceContext = sourceToUse.metadata?.extractedText ||
					sourceToUse.url ||
					`Source: ${sourceToUse.name} (${sourceToUse.type})`;
				finalPrompt = `${finalPrompt}\n\nContext from source "${sourceToUse.name}":\n${sourceContext}`;
			}

			onInputSubmit(finalPrompt);
			setPromptValue("");
			setSelectedSnippet(null);
			setSelectedSource(null);
		}
	}, [onInputSubmit, selectedSnippet, selectedSource, setPromptValue]);

	const handleSubmitWrapper = React.useCallback(() => {
		handleSubmit(promptValue, selectedSnippet || undefined, selectedSource || undefined);
	}, [handleSubmit, promptValue, selectedSnippet, selectedSource]);

	const handleKeyDown = useKeyboardHandlers(
		promptValue,
		onClose,
		handleSubmitWrapper,
	);

	const handleBlur = useBlurHandler(
		promptValue.trim() === "",
		onInputBlur,
		onEmptyBlur,
	);

	const handleOnPlaceholderClick = React.useCallback(() => {
		if (onPlaceholderClick) {
			onPlaceholderClick();
		}
	}, [onPlaceholderClick]);

	const handleFocus = React.useCallback(() => {
		setIsFocused(true);
		if (onInputFocus) {
			onInputFocus();
		}
	}, [onInputFocus]);

	const handleTextareaBlur = React.useCallback(
		(e: React.FocusEvent<HTMLTextAreaElement>) => {
			setIsFocused(false);
			handleBlur(e);
		},
		[handleBlur],
	);

	return (
		<div
			className="tiptap-ai-prompt-input"
			data-focused={isFocused}
			data-active-state={showPlaceholder ? "off" : "on"}
			{...props}
		>
			{showPlaceholder ? (
				<AiMenuInputPlaceholder
					onPlaceholderClick={handleOnPlaceholderClick}
				/>
			) : (
				<>
					<Combobox
						autoSelect="always"
						autoFocus
						render={
							<TextareaAutosize
								onChange={(e) => setPromptValue(e.target.value)}
								value={promptValue}
								onKeyDown={handleKeyDown}
								onFocus={handleFocus}
								onBlur={handleTextareaBlur}
								className="tiptap-ai-prompt-input-content"
								placeholder={placeholder}
								autoFocus
								style={{
									display: showPlaceholder ? "none" : "flex",
								}}
							/>
						}
					/>

					<AiPromptInputToolbar
						showPlaceholder={showPlaceholder}
						onInputSubmit={handleSubmit}
						onToneChange={onToneChange}
						onSnippetSelect={handleSnippetSelect}
						onSourceSelect={handleSourceSelect}
						isEmpty={!promptValue?.trim()}
					/>
				</>
			)}
		</div>
	);
}
