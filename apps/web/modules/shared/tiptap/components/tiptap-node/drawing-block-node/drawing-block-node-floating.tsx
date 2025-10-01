import React from "react";
import type { Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";

// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";

// --- UI Primitive ---
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Separator } from "@shared/tiptap/components/tiptap-ui-primitive/separator";

// --- UI ---
import { DeleteNodeButton } from "@shared/tiptap/components/tiptap-ui/delete-node-button";

// --- Lib ---
import { isNodeTypeSelected } from "@shared/tiptap/lib/tiptap-utils";

export function DrawingBlockNodeFloating({
	editor: providedEditor,
}: {
	editor?: Editor | null;
}) {
	const { editor } = useTiptapEditor(providedEditor);
	
	// Check if drawing block is selected using multiple methods
	const visible = React.useMemo(() => {
		if (!editor) return false;
		
		// Method 1: Check node selection
		const nodeSelected = isNodeTypeSelected(editor, ["drawingBlock"]);
		if (nodeSelected) return true;
		
		// Method 2: Check if cursor is inside a drawing block
		const { selection } = editor.state;
		const { $from } = selection;
		
		// Check if we're inside a drawingBlock node
		for (let depth = $from.depth; depth > 0; depth--) {
			const node = $from.node(depth);
			if (node.type.name === "drawingBlock") {
				return true;
			}
		}
		
		// Method 3: Check the node at current position
		const nodeAtCursor = editor.state.doc.nodeAt(selection.from);
		if (nodeAtCursor && nodeAtCursor.type.name === "drawingBlock") {
			return true;
		}
		
		return false;
	}, [editor?.state.selection]);

	if (!editor || !visible) {
		return null;
	}

	const findDrawingBlockNode = () => {
		const { selection } = editor.state;
		const { $from } = selection;
		
		// Check if we have a node selection first
		if (selection instanceof NodeSelection) {
			const node = selection.node;
			if (node.type.name === "drawingBlock") {
				return node;
			}
		}
		
		// Check parent nodes
		for (let depth = $from.depth; depth >= 0; depth--) {
			const node = $from.node(depth);
			if (node.type.name === "drawingBlock") {
				return node;
			}
		}
		
		// Check node at cursor position
		const nodeAtCursor = editor.state.doc.nodeAt(selection.from);
		if (nodeAtCursor && nodeAtCursor.type.name === "drawingBlock") {
			return nodeAtCursor;
		}
		
		return null;
	};

	const handleToggleDrawingMode = () => {
		const node = findDrawingBlockNode();
		if (node) {
			const currentMode = node.attrs.isDrawingMode || false;
			editor.commands.updateAttributes("drawingBlock", {
				isDrawingMode: !currentMode
			});
		}
	};

	const handleClearDrawing = () => {
		editor.commands.updateAttributes("drawingBlock", {
			drawingData: null
		});
	};

	const getCurrentDrawingMode = () => {
		const node = findDrawingBlockNode();
		return node?.attrs.isDrawingMode || false;
	};

	const isDrawingMode = getCurrentDrawingMode();

	return (
		<>
			<Button
				type="button"
				data-style="ghost"
				onClick={handleToggleDrawingMode}
				tooltip={isDrawingMode ? "Switch to View Mode" : "Switch to Drawing Mode"}
			>
				{isDrawingMode ? "🖱️ View" : "✏️ Drawing"}
			</Button>
			<Button
				type="button"
				data-style="ghost"
				onClick={handleClearDrawing}
				tooltip="Clear Drawing"
			>
				🗑️ Clear
			</Button>
			<Separator />
			<DeleteNodeButton />
		</>
	);
}