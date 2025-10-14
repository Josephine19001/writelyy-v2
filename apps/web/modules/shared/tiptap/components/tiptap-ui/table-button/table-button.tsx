"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";

// --- UI Primitive Components ---
import type { ButtonProps } from "@shared/tiptap/components/tiptap-ui-primitive/button";
import { Button } from "@shared/tiptap/components/tiptap-ui-primitive/button";

// --- Icons ---
import { TableIcon } from "@shared/tiptap/components/tiptap-icons/table-icon";
import { PlusIcon } from "@shared/tiptap/components/tiptap-icons/plus-icon";
import { TrashIcon } from "@shared/tiptap/components/tiptap-icons/trash-icon";
import { ArrowUpIcon } from "@shared/tiptap/components/tiptap-icons/arrow-up-icon";
import { ArrowLeftIcon } from "@shared/tiptap/components/tiptap-icons/arrow-left-icon";
import { ArrowDownToLineIcon } from "@shared/tiptap/components/tiptap-icons/arrow-down-to-line-icon";
import { AlignTopIcon } from "@shared/tiptap/components/tiptap-icons/align-top-icon";
import { AlignLeftIcon } from "@shared/tiptap/components/tiptap-icons/align-left-icon";
import { CheckIcon } from "@shared/tiptap/components/tiptap-icons/check-icon";
import { Repeat2Icon } from "@shared/tiptap/components/tiptap-icons/repeat-2-icon";
import { PaintBucketIcon } from "@shared/tiptap/components/tiptap-icons/paint-bucket-icon";
import { ChevronRightIcon } from "@shared/tiptap/components/tiptap-icons/chevron-right-icon";
import { ChevronDownIcon } from "@shared/tiptap/components/tiptap-icons/chevron-down-icon";
import { RotateCcwIcon } from "@shared/tiptap/components/tiptap-icons/rotate-ccw-icon";
import { MinusIcon } from "@shared/tiptap/components/tiptap-icons/minus-icon";

export interface TableButtonProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
}

// Helper function to check if editor is in a table
const isInTable = (editor: Editor | null) => editor?.isActive("table") || false;

// 1. Table Insert Button
export function TableInsertButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return undefined;

    const handleUpdate = () => {
      const canInsert = editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true });
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canInsert && !inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Insert 3×3 table"
      onClick={() => 
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      }
      {...props}
    >
      <TableIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 2. Add Row After Button
export function TableAddRowAfterButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canAddRow = editor.can().addRowAfter();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canAddRow && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Add row below"
      onClick={() => editor.chain().focus().addRowAfter().run()}
      {...props}
    >
      <ArrowDownToLineIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 3. Add Row Before Button
export function TableAddRowBeforeButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canAddRow = editor.can().addRowBefore();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canAddRow && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Add row above"
      onClick={() => editor.chain().focus().addRowBefore().run()}
      {...props}
    >
      <PlusIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 4. Add Column After Button
export function TableAddColumnAfterButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canAddColumn = editor.can().addColumnAfter();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canAddColumn && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Add column right"
      onClick={() => editor.chain().focus().addColumnAfter().run()}
      {...props}
    >
      <ArrowUpIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 5. Add Column Before Button
export function TableAddColumnBeforeButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canAddColumn = editor.can().addColumnBefore();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canAddColumn && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Add column left"
      onClick={() => editor.chain().focus().addColumnBefore().run()}
      {...props}
    >
      <ArrowLeftIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 6. Delete Row Button
export function TableDeleteRowButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canDeleteRow = editor.can().deleteRow();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canDeleteRow && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Delete current row"
      onClick={() => editor.chain().focus().deleteRow().run()}
      {...props}
    >
      <MinusIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 7. Delete Column Button
export function TableDeleteColumnButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canDeleteColumn = editor.can().deleteColumn();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canDeleteColumn && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Delete current column"
      onClick={() => editor.chain().focus().deleteColumn().run()}
      {...props}
    >
      <MinusIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 8. Toggle Header Row Button
export function TableToggleHeaderRowButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canToggleHeader = editor.can().toggleHeaderRow();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canToggleHeader && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Toggle header row"
      onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      {...props}
    >
      <CheckIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 9. Toggle Header Column Button
export function TableToggleHeaderColumnButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canToggleHeader = editor.can().toggleHeaderColumn();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canToggleHeader && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Toggle header column"
      onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
      {...props}
    >
      <CheckIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 10. Merge Cells Button
export function TableMergeCellsButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canMerge = editor.can().mergeCells();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canMerge && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Merge selected cells"
      onClick={() => editor.chain().focus().mergeCells().run()}
      {...props}
    >
      <Repeat2Icon className="tiptap-button-icon" />
    </Button>
  );
}

// 11. Split Cell Button
export function TableSplitCellButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canSplit = editor.can().splitCell();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canSplit && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Split current cell"
      onClick={() => editor.chain().focus().splitCell().run()}
      {...props}
    >
      <AlignTopIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 12. Toggle Header Cell Button
export function TableToggleHeaderCellButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canToggleHeader = editor.can().toggleHeaderCell();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canToggleHeader && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Toggle header cell"
      onClick={() => editor.chain().focus().toggleHeaderCell().run()}
      {...props}
    >
      <CheckIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 13. Merge or Split Button
export function TableMergeOrSplitButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canMergeOrSplit = editor.can().mergeOrSplit();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canMergeOrSplit && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Merge or split cells"
      onClick={() => editor.chain().focus().mergeOrSplit().run()}
      {...props}
    >
      <AlignLeftIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 14. Set Cell Background Color Button
export function TableSetCellBackgroundButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canSetAttribute = editor.can().setCellAttribute('backgroundColor', '#FAF594');
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canSetAttribute && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Set cell background color"
      onClick={() => editor.chain().focus().setCellAttribute('backgroundColor', '#FAF594').run()}
      {...props}
    >
      <PaintBucketIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 15. Fix Tables Button
export function TableFixTablesButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canFixTables = editor.can().fixTables();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canFixTables && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Fix table structure"
      onClick={() => editor.chain().focus().fixTables().run()}
      {...props}
    >
      <RotateCcwIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 16. Go to Next Cell Button
export function TableGoToNextCellButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canGoToNext = editor.can().goToNextCell();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canGoToNext && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Go to next cell"
      onClick={() => editor.chain().focus().goToNextCell().run()}
      {...props}
    >
      <ChevronRightIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 17. Go to Previous Cell Button
export function TableGoToPreviousCellButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canGoToPrevious = editor.can().goToPreviousCell();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canGoToPrevious && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Go to previous cell"
      onClick={() => editor.chain().focus().goToPreviousCell().run()}
      {...props}
    >
      <ChevronDownIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 18. Insert HTML Table Button
export function TableInsertHTMLButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

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

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(!inTable && !!editor.isEditable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Insert HTML table with sample data"
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
      {...props}
    >
      <TableIcon className="tiptap-button-icon" />
    </Button>
  );
}

// 19. Delete Entire Table Button
export function TableDeleteButton({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableButtonProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const canDeleteTable = editor.can().deleteTable();
      const inTable = isInTable(editor);
      
      if (hideWhenUnavailable) {
        setShow(canDeleteTable && inTable);
      } else {
        setShow(!!editor.isEditable);
      }
    };

    handleUpdate();
    editor.on("selectionUpdate", handleUpdate);
    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  if (!show || !editor || !editor.isEditable) return null;

  return (
    <Button
      type="button"
      data-style="ghost"
      role="button"
      tabIndex={-1}
      tooltip="Delete entire table"
      onClick={() => editor.chain().focus().deleteTable().run()}
      {...props}
    >
      <TrashIcon className="tiptap-button-icon" />
    </Button>
  );
}