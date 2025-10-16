// --- Icons ---
import { MoreVerticalIcon } from "@shared/tiptap/components/tiptap-icons/more-vertical-icon";
import { ChartBlockNodeFloating } from "@shared/tiptap/components/tiptap-node/chart-block-node/chart-block-node-floating";
import { DrawingBlockNodeFloating } from "@shared/tiptap/components/tiptap-node/drawing-block-node/drawing-block-node-floating";
// --- Node ---
import { ImageNodeFloating } from "@shared/tiptap/components/tiptap-node/image-node/image-node-floating";
import { AiMenu } from "@shared/tiptap/components/tiptap-ui/ai-menu/ai-menu";
import { MessageSquare } from "lucide-react";
// --- UI ---
import { ColorTextPopover } from "@shared/tiptap/components/tiptap-ui/color-text-popover";
import { ImproveDropdown } from "@shared/tiptap/components/tiptap-ui/improve-dropdown";
import {
	DropdownProvider,
	useDropdownCoordination,
} from "@shared/tiptap/components/tiptap-ui/dropdown-coordination";
import { LinkPopover } from "@shared/tiptap/components/tiptap-ui/link-popover";
import type { Mark } from "@shared/tiptap/components/tiptap-ui/mark-button";
import {
	canToggleMark,
	MarkButton,
} from "@shared/tiptap/components/tiptap-ui/mark-button";
import {
	TableCellOperationsDropdown,
	// TableCreationDropdown,
	TableHeadersDropdown,
	TableNavigationDropdown,
	TableRowColumnDropdown,
	TableStructureDropdown,
} from "@shared/tiptap/components/tiptap-ui/table-dropdown-groups";
import type { TextAlign } from "@shared/tiptap/components/tiptap-ui/text-align-button";
import {
	canSetTextAlign,
	TextAlignButton,
} from "@shared/tiptap/components/tiptap-ui/text-align-button";
import { TurnIntoDropdown } from "@shared/tiptap/components/tiptap-ui/turn-into-dropdown";
// --- Primitive UI Components ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/popover";
import {
	Toolbar,
	ToolbarGroup,
	ToolbarSeparator,
} from "@shared/tiptap/components/tiptap-ui-primitive/toolbar";
// --- UI Utils ---
import { FloatingElement } from "@shared/tiptap/components/tiptap-ui-utils/floating-element";
import { useFloatingToolbarVisibility } from "@shared/tiptap/hooks/use-floating-toolbar-visibility";
import { useIsMobile } from "@shared/tiptap/hooks/use-mobile";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import { useUiEditorState } from "@shared/tiptap/hooks/use-ui-editor-state";
// --- Utils ---
import { isSelectionValid } from "@shared/tiptap/lib/tiptap-collab-utils";
import type { Editor } from "@tiptap/react";
import * as React from "react";
import { AIChatProvider } from "../../ai-chat/ai-chat-context";
import { SnippetButton } from "./snippet-button";

export function NotionToolbarFloating() {
	const { editor } = useTiptapEditor();
	const isMobile = useIsMobile(480);
	const { lockDragHandle, aiGenerationActive, commentInputVisible } =
		useUiEditorState(editor);

	const { shouldShow } = useFloatingToolbarVisibility({
		editor,
		isSelectionValid,
		extraHideWhen: Boolean(aiGenerationActive || commentInputVisible),
	});

	if (lockDragHandle || isMobile) return null;

	return (
		<FloatingElement shouldShow={shouldShow}>
			<AIChatProvider>
				<NotionToolbarFloatingContent />
			</AIChatProvider>
		</FloatingElement>
	);
}

function NotionToolbarFloatingContent() {
	const { editor } = useTiptapEditor();

	return (
		<div className="flex flex-col gap-2">
			<AiMenu editor={editor} />
			{/* Main Floating Toolbar */}
			<DropdownProvider>
				<Toolbar variant="floating">
					<ToolbarGroup>
						<ImproveDropdown hideWhenUnavailable={true} />
						<SnippetButton />
					</ToolbarGroup>

					<ToolbarSeparator />

					<ToolbarGroup>
						<TurnIntoDropdown hideWhenUnavailable={true} />
					</ToolbarGroup>

					{/* 📌 Table Creation */}
					{/* <ToolbarGroup>
							<TableCreationDropdown hideWhenUnavailable={true} />
						</ToolbarGroup> */}

					{/* 📌 Row & Column Management */}
					<ToolbarGroup>
						<TableRowColumnDropdown hideWhenUnavailable={true} />
					</ToolbarGroup>

					{/* 📌 Table Deletion / Structure */}
					<ToolbarGroup>
						<TableStructureDropdown hideWhenUnavailable={true} />
					</ToolbarGroup>

					{/* 📌 Cell Operations */}
					<ToolbarGroup>
						<TableCellOperationsDropdown
							hideWhenUnavailable={true}
						/>
					</ToolbarGroup>

					{/* 📌 Headers */}
					<ToolbarGroup>
						<TableHeadersDropdown hideWhenUnavailable={true} />
					</ToolbarGroup>

					{/* 📌 Navigation */}
					<ToolbarGroup>
						<TableNavigationDropdown hideWhenUnavailable={true} />
					</ToolbarGroup>

					{/* <ToolbarSeparator /> */}

					<ToolbarGroup>
						<MarkButton type="bold" hideWhenUnavailable={true} />
						<MarkButton type="italic" hideWhenUnavailable={true} />
						<MarkButton type="strike" hideWhenUnavailable={true} />
						<MarkButton type="code" hideWhenUnavailable={true} />
					</ToolbarGroup>

					{/* <ToolbarSeparator /> */}

					<ToolbarGroup>
						<ImageNodeFloating />
						<DrawingBlockNodeFloating />
						<ChartBlockNodeFloating />
						{/* <SourcesDropdown />
						<SnippetsDropdown /> */}
					</ToolbarGroup>

					<ToolbarGroup>
						<LinkPopover
							autoOpenOnLinkActive={false}
							hideWhenUnavailable={true}
						/>
						<ColorTextPopover hideWhenUnavailable={true} />
					</ToolbarGroup>

					<MoreOptions hideWhenUnavailable={true} />
				</Toolbar>
			</DropdownProvider>
		</div>
	);
}

function canMoreOptions(editor: Editor | null): boolean {
	if (!editor) {
		return false;
	}

	const canTextAlignAny = ["left", "center", "right", "justify"].some(
		(align) => canSetTextAlign(editor, align as TextAlign),
	);

	const canMarkAny = ["superscript", "subscript"].some((type) =>
		canToggleMark(editor, type as Mark),
	);

	return canMarkAny || canTextAlignAny;
}

function shouldShowMoreOptions(params: {
	editor: Editor | null;
	hideWhenUnavailable: boolean;
}): boolean {
	const { editor, hideWhenUnavailable } = params;

	if (!editor) {
		return false;
	}

	if (hideWhenUnavailable && !editor.isActive("code")) {
		return canMoreOptions(editor);
	}

	return Boolean(editor?.isEditable);
}

export interface MoreOptionsProps extends Omit<ButtonProps, "type"> {
	/**
	 * The Tiptap editor instance.
	 */
	editor?: Editor | null;
	/**
	 * Whether to hide the dropdown when no options are available.
	 * @default false
	 */
	hideWhenUnavailable?: boolean;
}

export function MoreOptions({
	editor: providedEditor,
	hideWhenUnavailable = false,
	...props
}: MoreOptionsProps) {
	const { editor } = useTiptapEditor(providedEditor);
	const [show, setShow] = React.useState(false);
	const { isOpen, setIsOpen } = useDropdownCoordination("more-options");

	React.useEffect(() => {
		if (!editor) return;

		const handleSelectionUpdate = () => {
			setShow(
				shouldShowMoreOptions({
					editor,
					hideWhenUnavailable,
				}),
			);
		};

		handleSelectionUpdate();

		editor.on("selectionUpdate", handleSelectionUpdate);

		return () => {
			editor.off("selectionUpdate", handleSelectionUpdate);
		};
	}, [editor, hideWhenUnavailable]);

	if (!show || !editor || !editor.isEditable) {
		return null;
	}

	return (
		<>
			<ToolbarSeparator />
			<ToolbarGroup>
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							data-style="ghost"
							role="button"
							tabIndex={-1}
							tooltip="More options"
							{...props}
						>
							<MoreVerticalIcon className="tiptap-button-icon" />
						</Button>
					</PopoverTrigger>

					<PopoverContent
						side="top"
						align="end"
						alignOffset={4}
						sideOffset={4}
						asChild
					>
						<Toolbar variant="floating" tabIndex={0}>
							<ToolbarGroup>
								<MarkButton type="superscript" />
								<MarkButton type="subscript" />
							</ToolbarGroup>

							<ToolbarSeparator />

							<ToolbarGroup>
								<TextAlignButton align="left" />
								<TextAlignButton align="center" />
								<TextAlignButton align="right" />
								<TextAlignButton align="justify" />
							</ToolbarGroup>

							<ToolbarSeparator />
						</Toolbar>
					</PopoverContent>
				</Popover>
			</ToolbarGroup>
		</>
	);
}
