"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";

// --- UI Primitive Components ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/popover";
import { Separator } from "@shared/tiptap/components/tiptap-ui-primitive/separator";

// --- Icons ---
import { TableIcon } from "@shared/tiptap/components/tiptap-icons/table-icon";

const tableHTML = `
  <table style="width:100%">
    <tr>
      <th>Firstname</th>
      <th>Lastname</th>
      <th>Age</th>
    </tr>
    <tr>
      <td>Jill</td>
      <td>Smith</td>
      <td>50</td>
    </tr>
    <tr>
      <td>Eve</td>
      <td>Jackson</td>
      <td>94</td>
    </tr>
    <tr>
      <td>John</td>
      <td>Doe</td>
      <td>80</td>
    </tr>
  </table>
`;

function shouldShowTableDropdown(params: {
	editor: Editor | null;
	hideWhenUnavailable: boolean;
}): boolean {
	const { editor, hideWhenUnavailable } = params;
	if (!editor) {
		return false;
	}

	// Show if we're in a table or if table actions are available
	const inTable = editor.isActive("table");
	const canInsertTable = editor
		.can()
		.insertTable({ rows: 3, cols: 3, withHeaderRow: true });

	if (hideWhenUnavailable) {
		return inTable || canInsertTable;
	}

	return Boolean(editor?.isEditable);
}

interface TableDropdownItemProps {
	onClick: () => void;
	disabled?: boolean;
	children: React.ReactNode;
}

const TableDropdownItem: React.FC<TableDropdownItemProps> = ({
	onClick,
	disabled = false,
	children,
}) => (
	<button
		onClick={onClick}
		disabled={disabled}
		className="table-dropdown-item"
		style={{
			width: "100%",
			padding: "8px 12px",
			textAlign: "left",
			background: "none",
			border: "none",
			borderRadius: "4px",
			color: disabled
				? "var(--tt-text-disabled)"
				: "var(--tt-text-color)",
			fontSize: "14px",
			cursor: disabled ? "not-allowed" : "pointer",
			opacity: disabled ? 0.5 : 1,
		}}
		onMouseEnter={(e) => {
			if (!disabled) {
				e.currentTarget.style.background =
					"var(--tt-hover-bg-color, #f9fafb)";
			}
		}}
		onMouseLeave={(e) => {
			e.currentTarget.style.background = "none";
		}}
	>
		{children}
	</button>
);

export interface TableDropdownProps extends Omit<ButtonProps, "type"> {
	/**
	 * The Tiptap editor instance.
	 */
	editor?: Editor | null;
	/**
	 * Whether to hide the dropdown when no table options are available.
	 * @default false
	 */
	hideWhenUnavailable?: boolean;
}

export function TableDropdown({
	editor: providedEditor,
	hideWhenUnavailable = false,
	...props
}: TableDropdownProps) {
	const { editor } = useTiptapEditor(providedEditor);
	const [show, setShow] = React.useState(false);

	React.useEffect(() => {
		if (!editor) return;

		const handleSelectionUpdate = () => {
			const shouldShow = shouldShowTableDropdown({
				editor,
				hideWhenUnavailable,
			});
			setShow(shouldShow);
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
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					data-style="ghost"
					role="button"
					tabIndex={-1}
					tooltip="Table options"
					{...props}
				>
					<TableIcon className="tiptap-button-icon" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				side="top"
				align="center"
				style={{
					width: "200px",
					padding: "8px",
					background: "var(--tt-card-bg-color, #ffffff)",
					border: "1px solid var(--tt-border-color, #e5e7eb)",
					borderRadius: "8px",
					boxShadow:
						"var(--tt-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "2px",
					}}
				>
					{/* Insert Options */}
					<TableDropdownItem
						onClick={() =>
							editor
								.chain()
								.focus()
								.insertTable({
									rows: 3,
									cols: 3,
									withHeaderRow: true,
								})
								.run()
						}
						disabled={
							!editor
								.can()
								.insertTable({
									rows: 3,
									cols: 3,
									withHeaderRow: true,
								})
						}
					>
						Insert table
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() =>
							editor
								.chain()
								.focus()
								.insertContent(tableHTML, {
									parseOptions: {
										preserveWhitespace: false,
									},
								})
								.run()
						}
					>
						Insert HTML table
					</TableDropdownItem>

					<Separator style={{ margin: "4px 0" }} />

					{/* Column Options */}
					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().addColumnBefore().run()
						}
						disabled={!editor.can().addColumnBefore()}
					>
						Add column before
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().addColumnAfter().run()
						}
						disabled={!editor.can().addColumnAfter()}
					>
						Add column after
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().deleteColumn().run()
						}
						disabled={!editor.can().deleteColumn()}
					>
						Delete column
					</TableDropdownItem>

					<Separator style={{ margin: "4px 0" }} />

					{/* Row Options */}
					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().addRowBefore().run()
						}
						disabled={!editor.can().addRowBefore()}
					>
						Add row before
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().addRowAfter().run()
						}
						disabled={!editor.can().addRowAfter()}
					>
						Add row after
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() => editor.chain().focus().deleteRow().run()}
						disabled={!editor.can().deleteRow()}
					>
						Delete row
					</TableDropdownItem>

					<Separator style={{ margin: "4px 0" }} />

					{/* Table Options */}
					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().deleteTable().run()
						}
						disabled={!editor.can().deleteTable()}
					>
						Delete table
					</TableDropdownItem>

					<Separator style={{ margin: "4px 0" }} />

					{/* Cell Options */}
					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().mergeCells().run()
						}
						disabled={!editor.can().mergeCells()}
					>
						Merge cells
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() => editor.chain().focus().splitCell().run()}
						disabled={!editor.can().splitCell()}
					>
						Split cell
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().mergeOrSplit().run()
						}
						disabled={!editor.can().mergeOrSplit()}
					>
						Merge or split
					</TableDropdownItem>

					<Separator style={{ margin: "4px 0" }} />

					{/* Header Options */}
					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().toggleHeaderColumn().run()
						}
						disabled={!editor.can().toggleHeaderColumn()}
					>
						Toggle header column
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().toggleHeaderRow().run()
						}
						disabled={!editor.can().toggleHeaderRow()}
					>
						Toggle header row
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().toggleHeaderCell().run()
						}
						disabled={!editor.can().toggleHeaderCell()}
					>
						Toggle header cell
					</TableDropdownItem>

					<Separator style={{ margin: "4px 0" }} />

					{/* Advanced Options */}
					<TableDropdownItem
						onClick={() =>
							editor
								.chain()
								.focus()
								.setCellAttribute("backgroundColor", "#FAF594")
								.run()
						}
						disabled={
							!editor
								.can()
								.setCellAttribute("backgroundColor", "#FAF594")
						}
					>
						Set cell background
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() => editor.chain().focus().fixTables().run()}
						disabled={!editor.can().fixTables()}
					>
						Fix tables
					</TableDropdownItem>

					<Separator style={{ margin: "4px 0" }} />

					{/* Navigation Options */}
					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().goToNextCell().run()
						}
						disabled={!editor.can().goToNextCell()}
					>
						Go to next cell
					</TableDropdownItem>

					<TableDropdownItem
						onClick={() =>
							editor.chain().focus().goToPreviousCell().run()
						}
						disabled={!editor.can().goToPreviousCell()}
					>
						Go to previous cell
					</TableDropdownItem>
				</div>
			</PopoverContent>
		</Popover>
	);
}
