"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
import { useDropdownCoordination } from "@shared/tiptap/components/tiptap-ui/dropdown-coordination";

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
import { Repeat2Icon } from "@shared/tiptap/components/tiptap-icons/repeat-2-icon";
import { ChevronDownIcon } from "@shared/tiptap/components/tiptap-icons/chevron-down-icon";

export interface TableCellOperationsDropdownProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
}

function shouldShowCellOps(params: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = params;
  if (!editor) return false;

  if (hideWhenUnavailable) {
    const inTable = editor.isActive("table");
    return inTable;
  }

  return Boolean(editor?.isEditable);
}

interface TableCellOperationsItemProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const TableCellOperationsItem: React.FC<TableCellOperationsItemProps> = ({
  onClick,
  disabled = false,
  children,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="table-cell-operations-item"
    style={{
      width: "100%",
      padding: "8px 12px",
      textAlign: "left",
      background: "none",
      border: "none",
      borderRadius: "4px",
      color: disabled ? "var(--tt-text-disabled)" : "var(--tt-text-color)",
      fontSize: "14px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.background = "var(--tt-hover-bg-color, #f9fafb)";
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "none";
    }}
  >
    {children}
  </button>
);

export function TableCellOperationsDropdown({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableCellOperationsDropdownProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);
  const { isOpen: open, setIsOpen: setOpen } = useDropdownCoordination("table-cell-operations");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const shouldShow = shouldShowCellOps({ editor, hideWhenUnavailable });
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
    <div ref={dropdownRef}>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          role="button"
          tabIndex={-1}
          tooltip="Cell Operations"
          {...props}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Repeat2Icon className="tiptap-button-icon" />
          <ChevronDownIcon className="tiptap-button-icon" style={{ width: "12px", height: "12px" }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="center"
        style={{
          width: "200px",
          padding: "8px",
          background: "var(--tt-card-bg-color, #ffffff)",
          border: "1px solid var(--tt-border-color, #e5e7eb)",
          borderRadius: "8px",
          boxShadow: "var(--tt-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))",
          zIndex: 9999,
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <TableCellOperationsItem
            onClick={() => {
              editor.chain().focus().mergeCells().run();
              setOpen(false);
            }}
            disabled={!editor.can().mergeCells()}
          >
            Merge cells
          </TableCellOperationsItem>

          <TableCellOperationsItem
            onClick={() => {
              editor.chain().focus().splitCell().run();
              setOpen(false);
            }}
            disabled={!editor.can().splitCell()}
          >
            Split cell
          </TableCellOperationsItem>

          <TableCellOperationsItem
            onClick={() => {
              editor.chain().focus().mergeOrSplit().run();
              setOpen(false);
            }}
            disabled={!editor.can().mergeOrSplit()}
          >
            Merge or split
          </TableCellOperationsItem>

          <Separator style={{ margin: "4px 0" }} />

          <TableCellOperationsItem
            onClick={() => {
              editor.chain().focus().setCellAttribute('backgroundColor', '#FAF594').run();
              setOpen(false);
            }}
            disabled={!editor.can().setCellAttribute('backgroundColor', '#FAF594')}
          >
            Set cell attribute
          </TableCellOperationsItem>
        </div>
      </PopoverContent>
      </Popover>
    </div>
  );
}