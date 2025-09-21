import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@analytics/hooks/use-tiptap-editor"

// --- Lib ---
import { isNodeTypeSelected } from "@analytics/lib/tiptap-utils"

// --- Tiptap UI ---
import { DeleteNodeButton } from "@analytics/components/tiptap-ui/delete-node-button"
import { ImageDownloadButton } from "@analytics/components/tiptap-ui/image-download-button"
import { ImageAlignButton } from "@analytics/components/tiptap-ui/image-align-button"

// --- UI Primitive ---
import { Separator } from "@analytics/components/tiptap-ui-primitive/separator"

export function ImageNodeFloating({
  editor: providedEditor,
}: {
  editor?: Editor | null
}) {
  const { editor } = useTiptapEditor(providedEditor)
  const visible = isNodeTypeSelected(editor, ["image"])

  if (!editor || !visible) {
    return null
  }

  return (
    <>
      <ImageAlignButton align="left" />
      <ImageAlignButton align="center" />
      <ImageAlignButton align="right" />
      <Separator />
      <ImageDownloadButton />
      <Separator />
      <DeleteNodeButton />
    </>
  )
}
