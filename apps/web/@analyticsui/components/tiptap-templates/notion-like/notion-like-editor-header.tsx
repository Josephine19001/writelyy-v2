"use client"

import { ThemeToggle } from "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-theme-toggle"

// --- Tiptap UI ---
import { UndoRedoButton } from "@analytics/components/tiptap-ui/undo-redo-button"

// --- UI Primitives ---
import { Spacer } from "@analytics/components/tiptap-ui-primitive/spacer"
import { Separator } from "@analytics/components/tiptap-ui-primitive/separator"
import { ButtonGroup } from "@analytics/components/tiptap-ui-primitive/button"

// --- Styles ---
import "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-header.scss"

import { CollaborationUsers } from "@analyticsui/components/tiptap-templates/notion-like/notion-like-editor-collaboration-users"

export function NotionEditorHeader() {
  return (
    <header className="notion-like-editor-header">
      <Spacer />
      <div className="notion-like-editor-header-actions">
        <ButtonGroup orientation="horizontal">
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ButtonGroup>

        <Separator />

        <ThemeToggle />

        <Separator />

        <CollaborationUsers />
      </div>
    </header>
  )
}
