"use client";

import type { Editor } from "@tiptap/react";

export interface TableContextMenuProps {
	editor?: Editor;
}

// This component is no longer needed since table controls 
// are now handled by the TableDropdown in the floating toolbar
export const TableContextMenu: React.FC<TableContextMenuProps> = () => {
	return null;
};