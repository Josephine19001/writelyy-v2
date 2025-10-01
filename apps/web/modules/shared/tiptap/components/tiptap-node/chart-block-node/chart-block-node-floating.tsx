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

// --- Icons ---
import { PencilIcon } from "@shared/tiptap/components/tiptap-icons/pencil-icon";
import { ChartAreaIcon } from "@shared/tiptap/components/tiptap-icons/chart-area-icon";
import { ChartPieIcon } from "@shared/tiptap/components/tiptap-icons/chart-pie-icon";
import { ChartColumnIcon } from "@shared/tiptap/components/tiptap-icons/chart-column-icon";

// --- Lib ---
import { isNodeTypeSelected } from "@shared/tiptap/lib/tiptap-utils";

export function ChartBlockNodeFloating({
	editor: providedEditor,
}: {
	editor?: Editor | null;
}) {
	const { editor } = useTiptapEditor(providedEditor);
	
	// Check if chart block is selected using multiple methods
	const visible = React.useMemo(() => {
		if (!editor) return false;
		
		// Method 1: Check node selection
		const nodeSelected = isNodeTypeSelected(editor, ["chartBlock"]);
		if (nodeSelected) return true;
		
		// Method 2: Check if cursor is inside a chart block
		const { selection } = editor.state;
		const { $from } = selection;
		
		// Check if we're inside a chartBlock node
		for (let depth = $from.depth; depth > 0; depth--) {
			const node = $from.node(depth);
			if (node.type.name === "chartBlock") {
				return true;
			}
		}
		
		// Method 3: Check the node at current position
		const nodeAtCursor = editor.state.doc.nodeAt(selection.from);
		if (nodeAtCursor && nodeAtCursor.type.name === "chartBlock") {
			return true;
		}
		
		return false;
	}, [editor?.state.selection]);

	if (!editor || !visible) {
		return null;
	}

	const findChartBlockNode = () => {
		const { selection } = editor.state;
		const { $from } = selection;
		
		// Check if we have a node selection first
		if (selection instanceof NodeSelection) {
			const node = selection.node;
			if (node.type.name === "chartBlock") {
				return node;
			}
		}
		
		// Check parent nodes
		for (let depth = $from.depth; depth >= 0; depth--) {
			const node = $from.node(depth);
			if (node.type.name === "chartBlock") {
				return node;
			}
		}
		
		// Check node at cursor position
		const nodeAtCursor = editor.state.doc.nodeAt(selection.from);
		if (nodeAtCursor && nodeAtCursor.type.name === "chartBlock") {
			return nodeAtCursor;
		}
		
		return null;
	};

	const handleEditChart = () => {
		// Update the node attributes to trigger edit mode
		editor.commands.updateAttributes("chartBlock", {
			isEditing: true
		});
	};

	const handleChangeChartType = (type: "bar" | "line" | "pie") => {
		editor.commands.updateAttributes("chartBlock", {
			chartType: type
		});
	};

	const getCurrentChartType = () => {
		const node = findChartBlockNode();
		return node?.attrs.chartType || "bar";
	};

	const currentChartType = getCurrentChartType();

	return (
		<>
			<Button
				type="button"
				data-style="ghost"
				onClick={handleEditChart}
				tooltip="Edit Chart Data"
			>
				<PencilIcon className="tiptap-button-icon" />
			</Button>
			<Button
				type="button"
				data-style="ghost"
				onClick={() => handleChangeChartType("bar")}
				tooltip="Bar Chart"
				data-pressed={currentChartType === "bar"}
			>
				<ChartColumnIcon className="tiptap-button-icon" />
			</Button>
			<Button
				type="button"
				data-style="ghost"
				onClick={() => handleChangeChartType("line")}
				tooltip="Line Chart"
				data-pressed={currentChartType === "line"}
			>
				<ChartAreaIcon className="tiptap-button-icon" />
			</Button>
			<Button
				type="button"
				data-style="ghost"
				onClick={() => handleChangeChartType("pie")}
				tooltip="Pie Chart"
				data-pressed={currentChartType === "pie"}
			>
				<ChartPieIcon className="tiptap-button-icon" />
			</Button>
			<Separator />
			<DeleteNodeButton />
		</>
	);
}