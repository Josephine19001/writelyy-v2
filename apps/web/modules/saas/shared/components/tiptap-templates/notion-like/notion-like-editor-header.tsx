"use client";

// import { ThemeToggle } from "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-theme-toggle";
import { BlockquoteButton } from "@shared/tiptap/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "@shared/tiptap/components/tiptap-ui/code-block-button";
import { ColorTextPopover } from "@shared/tiptap/components/tiptap-ui/color-text-popover";
import { ImageUploadButton } from "@shared/tiptap/components/tiptap-ui/image-upload-button";
import { LinkPopover } from "@shared/tiptap/components/tiptap-ui/link-popover";
import { ListButton } from "@shared/tiptap/components/tiptap-ui/list-button";
import { MarkButton } from "@shared/tiptap/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@shared/tiptap/components/tiptap-ui/text-align-button";
import { TurnIntoDropdown } from "@shared/tiptap/components/tiptap-ui/turn-into-dropdown";
// --- Tiptap UI ---
import { UndoRedoButton } from "@shared/tiptap/components/tiptap-ui/undo-redo-button";
import { ButtonGroup } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Separator } from "@shared/tiptap/components/tiptap-ui-primitive/separator";
// --- UI Primitives ---

// --- Styles ---
import "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-header.scss";

// import { CollaborationUsers } from "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-collaboration-users";

export function NotionEditorHeader() {
	return (
		<header className="notion-like-editor-header">
			{/* Main toolbar with formatting options */}
			<div className="notion-like-editor-toolbar">
				{/* Undo/Redo */}
				<ButtonGroup orientation="horizontal">
					<UndoRedoButton action="undo" />
					<UndoRedoButton action="redo" />
				</ButtonGroup>

				<Separator />

				{/* Block type switching */}
				<TurnIntoDropdown hideWhenUnavailable={false} />

				<Separator />

				{/* Text formatting */}
				<ButtonGroup orientation="horizontal">
					<MarkButton type="bold" />
					<MarkButton type="italic" />
					<MarkButton type="underline" />
					<MarkButton type="strike" />
					<MarkButton type="code" />
				</ButtonGroup>

				<Separator />

				{/* Advanced formatting */}
				<ButtonGroup orientation="horizontal">
					<LinkPopover />
					<ColorTextPopover />
				</ButtonGroup>

				<Separator />

				{/* Text alignment */}
				<ButtonGroup orientation="horizontal">
					<TextAlignButton align="left" />
					<TextAlignButton align="center" />
					<TextAlignButton align="right" />
					<TextAlignButton align="justify" />
				</ButtonGroup>

				<Separator />

				{/* Lists and blocks */}
				<ButtonGroup orientation="horizontal">
					<ListButton type="bulletList" />
					<ListButton type="orderedList" />
					<ListButton type="taskList" />
				</ButtonGroup>

				<Separator />

				{/* Block elements */}
				<ButtonGroup orientation="horizontal">
					<BlockquoteButton />
					<CodeBlockButton />
					<ImageUploadButton />
				</ButtonGroup>
			</div>

			{/* Right side actions */}
			{/* <div className="notion-like-editor-header-actions">
				<ThemeToggle />
				<Separator />
				<CollaborationUsers />
			</div> */}
		</header>
	);
}
