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
	selectedSnippets,
	onSnippetSelect,
}: {
	selectedSnippets: Snippet[];
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

	const isSelected = (snippet: Snippet) => {
		return selectedSnippets.some(s => s.id === snippet.id);
	};

	const buttonLabel = React.useMemo(() => {
		if (selectedSnippets.length === 0) return "Snippet";
		if (selectedSnippets.length === 1) return selectedSnippets[0].title;
		return `${selectedSnippets.length} snippets`;
	}, [selectedSnippets]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					data-active-state={selectedSnippets.length > 0 ? "on" : "off"}
					role="button"
					tabIndex={-1}
					aria-label="Insert snippet"
				>
					<SnippetIcon className="tiptap-button-icon" />
					<span className="tiptap-button-text">
						{buttonLabel}
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
										{categorySnippets.map((snippet: Snippet) => {
											const selected = isSelected(snippet);
											return (
												<DropdownMenuItem
													key={snippet.id}
													asChild
													onSelect={(e) => e.preventDefault()}
												>
													<Button
														data-style="ghost"
														data-active-state={selected ? "on" : "off"}
														onClick={() => onSnippetSelect(snippet)}
														className="flex items-start gap-2 w-full text-left"
													>
														<div className="flex items-center justify-center w-4 h-4 border rounded flex-shrink-0 mt-1">
															{selected && (
																<div className="w-2 h-2 bg-primary rounded-sm" />
															)}
														</div>
														<div className="flex flex-col flex-1">
															<span className="tiptap-button-text font-medium text-left w-full">
																{snippet.title}
															</span>
															<span className="text-xs text-muted-foreground line-clamp-1 text-left w-full">
																{snippet.content.slice(0, 50)}
																{snippet.content.length > 50 ? "..." : ""}
															</span>
														</div>
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

export function SourceSelector({
	selectedSources,
	onSourceSelect,
}: {
	selectedSources: Source[];
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

	const isSelected = (source: Source) => {
		return selectedSources.some(s => s.id === source.id);
	};

	const buttonLabel = React.useMemo(() => {
		if (selectedSources.length === 0) return "Source";
		if (selectedSources.length === 1) return selectedSources[0].name;
		return `${selectedSources.length} sources`;
	}, [selectedSources]);

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
					data-active-state={selectedSources.length > 0 ? "on" : "off"}
					role="button"
					tabIndex={-1}
					aria-label="Add source context"
				>
					<SourcesIcon className="tiptap-button-icon" />
					<span className="tiptap-button-text">
						{buttonLabel}
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
											const selected = isSelected(source);
											return (
												<DropdownMenuItem
													key={source.id}
													asChild
													onSelect={(e) => e.preventDefault()}
												>
													<Button
														data-style="ghost"
														data-active-state={selected ? "on" : "off"}
														onClick={() => onSourceSelect(source)}
														className="flex items-center gap-2 w-full text-left"
													>
														<div className="flex items-center justify-center w-4 h-4 border rounded flex-shrink-0">
															{selected && (
																<div className="w-2 h-2 bg-primary rounded-sm" />
															)}
														</div>
														<SourceIconComponent className="h-4 w-4 flex-shrink-0" />
														<span className="tiptap-button-text font-medium text-left flex-1 truncate">
															{source.name}
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
	onInputSubmit: (prompt: string, snippets?: Snippet[], sources?: Source[]) => void;
	onToneChange?: (tone: string) => void;
	onSnippetSelect?: (snippet: Snippet) => void;
	onSourceSelect?: (source: Source) => void;
	isEmpty?: boolean;
}) {
	const [tone, setTone] = React.useState<Tone | null>(null);
	const [selectedSnippets, setSelectedSnippets] = React.useState<Snippet[]>([]);
	const [selectedSources, setSelectedSources] = React.useState<Source[]>([]);
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
			setSelectedSnippets(prev => {
				const isSelected = prev.some(s => s.id === snippet.id);
				if (isSelected) {
					return prev.filter(s => s.id !== snippet.id);
				}
				return [...prev, snippet];
			});
			onSnippetSelect?.(snippet);
		},
		[onSnippetSelect],
	);

	const handleSourceSelect = React.useCallback(
		(source: Source) => {
			setSelectedSources(prev => {
				const isSelected = prev.some(s => s.id === source.id);
				if (isSelected) {
					return prev.filter(s => s.id !== source.id);
				}
				return [...prev, source];
			});
			onSourceSelect?.(source);
		},
		[onSourceSelect],
	);

	const handleSubmit = React.useCallback(() => {
		onInputSubmit(
			promptValue,
			selectedSnippets.length > 0 ? selectedSnippets : undefined,
			selectedSources.length > 0 ? selectedSources : undefined
		);
		// Reset selected snippets and sources after submit
		setSelectedSnippets([]);
		setSelectedSources([]);
	}, [onInputSubmit, promptValue, selectedSnippets, selectedSources]);

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
					selectedSnippets={selectedSnippets}
					onSnippetSelect={handleSnippetSelect}
				/>
				<SourceSelector
					selectedSources={selectedSources}
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
	const [selectedSnippets, setSelectedSnippets] = React.useState<Snippet[]>([]);
	const [selectedSources, setSelectedSources] = React.useState<Source[]>([]);

	const handleSnippetSelect = React.useCallback((snippet: Snippet) => {
		setSelectedSnippets(prev => {
			const isSelected = prev.some(s => s.id === snippet.id);
			if (isSelected) {
				return prev.filter(s => s.id !== snippet.id);
			}
			return [...prev, snippet];
		});
	}, []);

	const handleSourceSelect = React.useCallback((source: Source) => {
		setSelectedSources(prev => {
			const isSelected = prev.some(s => s.id === source.id);
			if (isSelected) {
				return prev.filter(s => s.id !== source.id);
			}
			return [...prev, source];
		});
	}, []);

	const handleSubmit = React.useCallback((prompt: string, snippets?: Snippet[], sources?: Source[]) => {
		const cleanedPrompt = prompt?.trim();
		if (cleanedPrompt) {
			// Build final prompt with context
			let finalPrompt = cleanedPrompt;
			const snippetsToUse = snippets || selectedSnippets;
			const sourcesToUse = sources || selectedSources;

			// Add snippet context if available (comma-separated)
			if (snippetsToUse && snippetsToUse.length > 0) {
				const snippetTitles = snippetsToUse.map(s => s.title).join(", ");
				const snippetContents = snippetsToUse.map((s, idx) =>
					`${idx + 1}. "${s.title}":\n${s.content}`
				).join("\n\n");
				finalPrompt = `${finalPrompt}\n\nContext from ${snippetsToUse.length} snippet(s) [${snippetTitles}]:\n\n${snippetContents}`;
			}

			// Add source context if available (comma-separated)
			if (sourcesToUse && sourcesToUse.length > 0) {
				const sourceTitles = sourcesToUse.map(s => s.name).join(", ");
				const sourceContents = sourcesToUse.map((s, idx) => {
					const sourceContext = s.metadata?.extractedText ||
						s.url ||
						`Source: ${s.name} (${s.type})`;
					return `${idx + 1}. "${s.name}":\n${sourceContext}`;
				}).join("\n\n");
				finalPrompt = `${finalPrompt}\n\nContext from ${sourcesToUse.length} source(s) [${sourceTitles}]:\n\n${sourceContents}`;
			}

			onInputSubmit(finalPrompt);
			setPromptValue("");
			setSelectedSnippets([]);
			setSelectedSources([]);
		}
	}, [onInputSubmit, selectedSnippets, selectedSources, setPromptValue]);

	const handleSubmitWrapper = React.useCallback(() => {
		handleSubmit(
			promptValue,
			selectedSnippets.length > 0 ? selectedSnippets : undefined,
			selectedSources.length > 0 ? selectedSources : undefined
		);
	}, [handleSubmit, promptValue, selectedSnippets, selectedSources]);

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
