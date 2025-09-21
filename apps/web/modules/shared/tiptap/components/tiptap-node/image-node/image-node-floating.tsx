// --- Tiptap UI ---
import { DeleteNodeButton } from "@shared/tiptap/components/tiptap-ui/delete-node-button";
import { ImageAlignButton } from "@shared/tiptap/components/tiptap-ui/image-align-button";
import { ImageDownloadButton } from "@shared/tiptap/components/tiptap-ui/image-download-button";
// --- UI Primitive ---
import { Separator } from "@shared/tiptap/components/tiptap-ui-primitive/separator";
// --- Hooks ---
import { useTiptapEditor } from "@shared/tiptap/hooks/use-tiptap-editor";
// --- Lib ---
import { isNodeTypeSelected } from "@shared/tiptap/lib/tiptap-utils";
import type { Editor } from "@tiptap/react";

export function ImageNodeFloating({
	editor: providedEditor,
}: {
	editor?: Editor | null;
}) {
	const { editor } = useTiptapEditor(providedEditor);
	const visible = isNodeTypeSelected(editor, ["image"]);

	if (!editor || !visible) {
		return null;
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
	);
}
