"use client";

import Blockquote from "@tiptap/extension-blockquote";
import Bold from "@tiptap/extension-bold";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Italic from "@tiptap/extension-italic";
import { BulletList, ListItem } from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Text from "@tiptap/extension-text";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useCallback, useRef } from "react";
import { useDocumentQuery, useUpdateDocumentMutation } from "@saas/lib/api";
import { Button } from "@ui/components/button";
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon, 
  Strikethrough as StrikethroughIcon, 
  List as ListIcon, 
  Quote as QuoteIcon,
  Type
} from "lucide-react";

interface TiptapDocumentEditorProps {
	documentId: string;
	initialContent?: string;
	onContentChange?: (content: string) => void;
}

const EditorToolbar = ({ editor }: { editor: any }) => {
	if (!editor) return null;

	return (
		<div className="flex items-center gap-1 p-2 bg-card">
			<Button
				variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
				size="sm"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className="h-8 w-8 p-0"
			>
				<BoldIcon className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
				size="sm"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className="h-8 w-8 p-0"
			>
				<ItalicIcon className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
				size="sm"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className="h-8 w-8 p-0"
			>
				<UnderlineIcon className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
				size="sm"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				className="h-8 w-8 p-0"
			>
				<StrikethroughIcon className="h-4 w-4" />
			</Button>
			<div className="w-px h-6 bg-border mx-1" />
			<Button
				variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
				size="sm"
				onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
				className="h-8 px-2"
			>
				<Type className="h-4 w-4 mr-1" />
				H1
			</Button>
			<Button
				variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
				size="sm"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className="h-8 px-2"
			>
				H2
			</Button>
			<Button
				variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
				size="sm"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className="h-8 w-8 p-0"
			>
				<ListIcon className="h-4 w-4" />
			</Button>
			<Button
				variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
				size="sm"
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className="h-8 w-8 p-0"
			>
				<QuoteIcon className="h-4 w-4" />
			</Button>
		</div>
	);
};

export function TiptapDocumentEditor({
	documentId,
	initialContent = "",
	onContentChange,
}: TiptapDocumentEditorProps) {
	// Fetch document data
	const { data: document, isLoading } = useDocumentQuery(documentId, {
		enabled: !!documentId
	});
	const updateDocumentMutation = useUpdateDocumentMutation();
	const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Debounced save function
	const debouncedSave = useCallback((content: string) => {
		if (saveTimeoutRef.current) {
			clearTimeout(saveTimeoutRef.current);
		}
		
		saveTimeoutRef.current = setTimeout(() => {
			updateDocumentMutation.mutate({
				id: documentId,
				content: content,
			});
		}, 1000); // Save after 1 second of no changes
	}, [documentId, updateDocumentMutation]);

	const editor = useEditor({
		extensions: [
			Document,
			Paragraph,
			Text,
			Bold,
			Italic,
			Underline,
			Strike,
			Heading.configure({
				levels: [1, 2, 3, 4, 5, 6],
			}),
			BulletList,
			ListItem,
			Blockquote,
			HorizontalRule,
			HardBreak,
		],
		content: (typeof document?.content === 'string' ? document.content : initialContent) || "<p>Start writing your document...</p>",
		onUpdate: ({ editor }) => {
			const content = editor.getHTML();
			onContentChange?.(content);
			debouncedSave(content);
		},
		editorProps: {
			attributes: {
				class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl dark:prose-invert focus:outline-none h-full w-full p-8 border-none outline-none max-w-none overflow-auto",
			},
		},
		immediatelyRender: false, // Fix SSR hydration issue
	});

	// Update content when document is loaded or initialContent changes
	useEffect(() => {
		if (editor) {
			const newContent = (typeof document?.content === 'string' ? document.content : initialContent) || "<p>Start writing your document...</p>";
			if (newContent && newContent !== editor.getHTML()) {
				editor.commands.setContent(newContent);
			}
		}
	}, [editor, document?.content, initialContent]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}
		};
	}, []);

	if (isLoading || !editor) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
				{isLoading && <span className="ml-2 text-sm text-muted-foreground">Loading document...</span>}
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-card">
			<EditorToolbar editor={editor} />
			<EditorContent editor={editor} className="flex-1" />
		</div>
	);
}
