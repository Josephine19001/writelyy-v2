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

// --- Icons ---
import { TrashIcon } from "@shared/tiptap/components/tiptap-icons/trash-icon";
import { ChevronDownIcon } from "@shared/tiptap/components/tiptap-icons/chevron-down-icon";

export interface TableStructureDropdownProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
}

function shouldShowStructure(params: {
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

interface TableStructureItemProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const TableStructureItem: React.FC<TableStructureItemProps> = ({
  onClick,
  disabled = false,
  children,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="table-structure-item"
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

export function TableStructureDropdown({
  editor: providedEditor,
  hideWhenUnavailable = false,
  ...props
}: TableStructureDropdownProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [show, setShow] = React.useState(false);
  const { isOpen: open, setIsOpen: setOpen } = useDropdownCoordination("table-structure");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      const shouldShow = shouldShowStructure({ editor, hideWhenUnavailable });
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
          tooltip="Table Deletion / Structure"
          {...props}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <TrashIcon className="tiptap-button-icon" />
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
          <TableStructureItem
            onClick={() => {
              editor.chain().focus().deleteTable().run();
              setOpen(false);
            }}
            disabled={!editor.can().deleteTable()}
          >
            Delete table
          </TableStructureItem>

          <TableStructureItem
            onClick={() => {
              editor.chain().focus().fixTables().run();
              setOpen(false);
            }}
            disabled={!editor.can().fixTables()}
          >
            Fix tables
          </TableStructureItem>
        </div>
      </PopoverContent>
      </Popover>
    </div>
  );
}