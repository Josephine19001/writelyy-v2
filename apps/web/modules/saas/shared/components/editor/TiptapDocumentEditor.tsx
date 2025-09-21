"use client";

import { useDocumentQuery, useUpdateDocumentMutation } from "@saas/lib/api";
// Node Extensions
import Blockquote from "@tiptap/extension-blockquote";
// Mark Extensions
import Bold from "@tiptap/extension-bold";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import Code from "@tiptap/extension-code";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import Highlight from "@tiptap/extension-highlight";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Image from "@tiptap/extension-image";
import Italic from "@tiptap/extension-italic";
import Link from "@tiptap/extension-link";
import { ListKit } from "@tiptap/extension-list";
import Paragraph from "@tiptap/extension-paragraph";
import Strike from "@tiptap/extension-strike";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import Text from "@tiptap/extension-text";
import { TextStyleKit } from "@tiptap/extension-text-style";

// Functionality Extensions
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import UniqueID from "@tiptap/extension-unique-id";
import { Dropcursor, UndoRedo } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import { Button } from "@ui/components/button";
import { Separator } from "@ui/components/separator";
import { createLowlight } from "lowlight";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold as BoldIcon,
	ChevronDown,
	Highlighter,
	Image as ImageIcon,
	Italic as ItalicIcon,
	List,
	ListOrdered,
	Minus,
	Palette,
	Plus,
	Quote,
	Redo,
	Save,
	Settings,
	Strikethrough as StrikethroughIcon,
	Table as TableIcon,
	Trash2,
	Underline as UnderlineIcon,
	Undo,
	ArrowLeft,
	ArrowRight,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
// Note: BubbleMenu component will be created manually
import { useCallback, useEffect, useRef, useState } from "react";

const lowlight = createLowlight();

interface TiptapDocumentEditorProps {
	documentId: string;
	initialContent?: string;
	onContentChange?: (content: string) => void;
}

// Font size is handled by TextStyleKit now

const FONT_FAMILIES = [
	{ name: "Default", value: "inherit" },
	{ name: "Arial", value: "Arial, sans-serif" },
	{ name: "Georgia", value: "Georgia, serif" },
	{ name: "Times New Roman", value: '"Times New Roman", serif' },
	{ name: "Helvetica", value: "Helvetica, sans-serif" },
	{ name: "Verdana", value: "Verdana, sans-serif" },
	{ name: "Courier New", value: '"Courier New", monospace' },
	{ name: "Open Sans", value: '"Open Sans", sans-serif' },
	{ name: "Roboto", value: "Roboto, sans-serif" },
];

const FONT_SIZES = [
	{ name: "12px", value: "12px" },
	{ name: "14px", value: "14px" },
	{ name: "16px", value: "16px" },
	{ name: "18px", value: "18px" },
	{ name: "20px", value: "20px" },
	{ name: "24px", value: "24px" },
	{ name: "28px", value: "28px" },
	{ name: "32px", value: "32px" },
	{ name: "36px", value: "36px" },
	{ name: "48px", value: "48px" },
];

const COLORS = [
	"#000000",
	"#434343",
	"#666666",
	"#999999",
	"#b7b7b7",
	"#cccccc",
	"#d9d9d9",
	"#efefef",
	"#f3f3f3",
	"#ffffff",
	"#980000",
	"#ff0000",
	"#ff9900",
	"#ffff00",
	"#00ff00",
	"#00ffff",
	"#4a86e8",
	"#0000ff",
	"#9900ff",
	"#ff00ff",
	"#e6b8af",
	"#f4cccc",
	"#fce5cd",
	"#fff2cc",
	"#d9ead3",
	"#d0e0e3",
	"#c9daf8",
	"#cfe2f3",
	"#d9d2e9",
	"#ead1dc",
	"#dd7e6b",
	"#ea9999",
	"#f9cb9c",
	"#ffe599",
	"#b6d7a8",
	"#a2c4c9",
	"#a4c2f4",
	"#9fc5e8",
	"#b4a7d6",
	"#d5a6bd",
	"#cc4125",
	"#e06666",
	"#f6b26b",
	"#ffd966",
	"#93c47d",
	"#76a5af",
	"#6d9eeb",
	"#6fa8dc",
	"#8e7cc3",
	"#c27ba0",
	"#a61e4d",
	"#cc0000",
	"#e69138",
	"#f1c232",
	"#6aa84f",
	"#45818e",
	"#3c78d8",
	"#3d85c6",
	"#674ea7",
	"#a64d79",
	"#85200c",
	"#990000",
	"#b45f06",
	"#bf9000",
	"#38761d",
	"#134f5c",
	"#1155cc",
	"#0b5394",
	"#351c75",
	"#741b47",
	"#5b0f00",
	"#660000",
	"#783f04",
	"#7f6000",
	"#274e13",
	"#0c343d",
	"#1c4587",
	"#073763",
	"#20124d",
	"#4c1130",
];

const TABLE_STYLES = [
	{ name: "Default", value: "default", class: "" },
	{ name: "Striped", value: "striped", class: "table-striped" },
	{ name: "Bordered", value: "bordered", class: "table-bordered" },
	{ name: "Modern", value: "modern", class: "table-modern" },
];

// Enhanced Toolbar with Font Options
const EnhancedToolbar = ({
	editor,
	onSave,
	hasUnsavedChanges,
}: {
	editor: any;
	onSave: () => void;
	hasUnsavedChanges: boolean;
}) => {
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [showFontPicker, setShowFontPicker] = useState(false);
	const [showSizePicker, setShowSizePicker] = useState(false);
	const [showTableControls, setShowTableControls] = useState(false);
	const [showTableStylePicker, setShowTableStylePicker] = useState(false);
	const toolbarRef = useRef<HTMLDivElement>(null);

	const isInTable = editor?.isActive("table");
	
	// Get current table style
	const getCurrentTableStyle = () => {
		if (!editor || !isInTable) return '';
		const tableElement = editor.view.dom.querySelector('table');
		if (!tableElement) return '';
		
		// Check which style class is applied
		if (tableElement.classList.contains('table-striped')) return 'table-striped';
		if (tableElement.classList.contains('table-bordered')) return 'table-bordered';
		if (tableElement.classList.contains('table-modern')) return 'table-modern';
		return '';
	};
	
	const currentTableStyle = getCurrentTableStyle();
	
	// Force re-render when editor state changes to update active states
	const [, forceUpdate] = useState({});
	useEffect(() => {
		if (!editor) return;
		
		const updateActiveStates = () => {
			forceUpdate({});
		};
		
		editor.on('selectionUpdate', updateActiveStates);
		editor.on('transaction', updateActiveStates);
		
		return () => {
			editor.off('selectionUpdate', updateActiveStates);
			editor.off('transaction', updateActiveStates);
		};
	}, [editor]);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				toolbarRef.current &&
				!toolbarRef.current.contains(event.target as Node)
			) {
				setShowColorPicker(false);
				setShowFontPicker(false);
				setShowSizePicker(false);
				setShowTableControls(false);
				setShowTableStylePicker(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Close other dropdowns when opening a new one
	const handleDropdownToggle = (
		dropdown: "font" | "size" | "color" | "table" | "tableStyle",
	) => {
		// Close all dropdowns first
		setShowFontPicker(false);
		setShowSizePicker(false);
		setShowColorPicker(false);
		setShowTableControls(false);
		setShowTableStylePicker(false);

		// Open the requested dropdown
		if (dropdown === "font") {
			setShowFontPicker(!showFontPicker);
		} else if (dropdown === "size") {
			setShowSizePicker(!showSizePicker);
		} else if (dropdown === "color") {
			setShowColorPicker(!showColorPicker);
		} else if (dropdown === "table") {
			setShowTableControls(!showTableControls);
		} else if (dropdown === "tableStyle") {
			setShowTableStylePicker(!showTableStylePicker);
		}
	};

	if (!editor) return null;

	return (
		<div
			ref={toolbarRef}
			className="flex items-center gap-1 p-3 bg-background rounded-lg mx-3 mt-3 mb-2 shadow-sm border relative"
			style={{ overflowX: "visible" }}
		>
			{/* Save Button */}
			<Button
				variant={hasUnsavedChanges ? "primary" : "ghost"}
				size="sm"
				onClick={onSave}
				className="h-8 w-8 p-0"
				title={
					hasUnsavedChanges ? "Save changes" : "No changes to save"
				}
			>
				<Save className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Undo/Redo */}
			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().undo()}
				className="h-8 w-8 p-0"
			>
				<Undo className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().redo()}
				className="h-8 w-8 p-0"
			>
				<Redo className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Font Family */}
			<div className="relative">
				<Button
					variant={editor?.getAttributes('textStyle')?.fontFamily ? "secondary" : "ghost"}
					size="sm"
					onClick={() => handleDropdownToggle("font")}
					className="h-8 px-2 gap-1 text-xs hover:bg-primary hover:text-primary-foreground"
				>
					{FONT_FAMILIES.find(
						(f) =>
							f.value ===
							editor?.getAttributes("textStyle")?.fontFamily,
					)?.name || "Default"}
					<ChevronDown className="h-3 w-3" />
				</Button>

				{showFontPicker && (
					<div className="absolute top-10 left-0 z-[200] bg-background border rounded-lg shadow-lg min-w-40">
						{FONT_FAMILIES.map((font) => (
							<button
								key={font.value}
								type="button"
								className={`w-full text-left px-3 py-2 text-xs hover:bg-accent first:rounded-t-lg last:rounded-b-lg ${
									editor.getAttributes("textStyle")
										.fontFamily === font.value ||
									(
										!editor.getAttributes("textStyle")
											.fontFamily &&
											font.value === "inherit"
									)
										? "bg-primary text-primary-foreground"
										: ""
								}`}
								onClick={() => {
									if (font.value !== "inherit") {
										editor
											.chain()
											.focus()
											.setFontFamily(font.value)
											.run();
									} else {
										editor
											.chain()
											.focus()
											.unsetFontFamily()
											.run();
									}
									setShowFontPicker(false);
								}}
							>
								{font.name}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Font Size */}
			<div className="relative">
				<Button
					variant={editor?.getAttributes('textStyle')?.fontSize ? "secondary" : "ghost"}
					size="sm"
					onClick={() => handleDropdownToggle("size")}
					className="h-8 px-2 gap-1 text-xs hover:bg-primary hover:text-primary-foreground"
				>
					{FONT_SIZES.find(
						(s) =>
							s.value ===
							editor.getAttributes("textStyle").fontSize,
					)?.name || "Size"}
					<ChevronDown className="h-3 w-3" />
				</Button>

				{showSizePicker && (
					<div className="absolute top-10 left-0 z-[200] bg-background border rounded-lg shadow-lg min-w-20">
						{FONT_SIZES.map((size) => (
							<button
								key={size.value}
								type="button"
								className={`w-full text-left px-3 py-2 text-xs hover:bg-accent first:rounded-t-lg last:rounded-b-lg ${
									editor.getAttributes("textStyle")
										.fontSize === size.value
										? "bg-primary text-primary-foreground"
										: ""
								}`}
								onClick={() => {
									editor
										.chain()
										.focus()
										.setFontSize(size.value)
										.run();
									setShowSizePicker(false);
								}}
							>
								{size.name}
							</button>
						))}
					</div>
				)}
			</div>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Text Formatting */}
			<Button
				variant={editor.isActive("bold") ? "secondary" : "ghost"}
				size="sm"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className="h-8 w-8 p-0"
			>
				<BoldIcon className="h-4 w-4" />
			</Button>

			<Button
				variant={editor.isActive("italic") ? "secondary" : "ghost"}
				size="sm"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className="h-8 w-8 p-0"
			>
				<ItalicIcon className="h-4 w-4" />
			</Button>

			<Button
				variant={editor.isActive("underline") ? "secondary" : "ghost"}
				size="sm"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className="h-8 w-8 p-0"
			>
				<UnderlineIcon className="h-4 w-4" />
			</Button>

			<Button
				variant={editor.isActive("strike") ? "secondary" : "ghost"}
				size="sm"
				onClick={() => editor.chain().focus().toggleStrike().run()}
				className="h-8 w-8 p-0"
			>
				<StrikethroughIcon className="h-4 w-4" />
			</Button>

			<Button
				variant={editor.isActive("highlight") ? "secondary" : "ghost"}
				size="sm"
				onClick={() => editor.chain().focus().toggleHighlight().run()}
				className="h-8 w-8 p-0"
			>
				<Highlighter className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Text Color */}
			<div className="relative">
				<Button
					variant={editor?.getAttributes('textStyle')?.color ? "secondary" : "ghost"}
					size="sm"
					onClick={() => handleDropdownToggle("color")}
					className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
				>
					<Palette className="h-4 w-4" />
				</Button>

				{showColorPicker && (
					<div className="absolute top-10 left-0 p-3 bg-background border rounded-lg shadow-lg z-[200] min-w-52">
						<div className="grid grid-cols-10 gap-1">
							{COLORS.map((color) => (
								<button
									key={color}
									type="button"
									className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform hover:border-primary"
									style={{ backgroundColor: color }}
									onClick={() => {
										editor
											.chain()
											.focus()
											.setColor(color)
											.run();
										setShowColorPicker(false);
									}}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Alignment */}
			<Button
				variant={
					editor.isActive({ textAlign: "left" })
						? "secondary"
						: "ghost"
				}
				size="sm"
				onClick={() =>
					editor.chain().focus().setTextAlign("left").run()
				}
				className="h-8 w-8 p-0"
			>
				<AlignLeft className="h-4 w-4" />
			</Button>

			<Button
				variant={
					editor.isActive({ textAlign: "center" })
						? "secondary"
						: "ghost"
				}
				size="sm"
				onClick={() =>
					editor.chain().focus().setTextAlign("center").run()
				}
				className="h-8 w-8 p-0"
			>
				<AlignCenter className="h-4 w-4" />
			</Button>

			<Button
				variant={
					editor.isActive({ textAlign: "right" })
						? "secondary"
						: "ghost"
				}
				size="sm"
				onClick={() =>
					editor.chain().focus().setTextAlign("right").run()
				}
				className="h-8 w-8 p-0"
			>
				<AlignRight className="h-4 w-4" />
			</Button>

			<Button
				variant={
					editor.isActive({ textAlign: "justify" })
						? "secondary"
						: "ghost"
				}
				size="sm"
				onClick={() =>
					editor.chain().focus().setTextAlign("justify").run()
				}
				className="h-8 w-8 p-0"
			>
				<AlignJustify className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Lists */}
			<Button
				variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
				size="sm"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className="h-8 w-8 p-0"
			>
				<List className="h-4 w-4" />
			</Button>

			<Button
				variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
				size="sm"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className="h-8 w-8 p-0"
			>
				<ListOrdered className="h-4 w-4" />
			</Button>

			<Separator orientation="vertical" className="h-6 mx-1" />

			{/* Elements */}
			<Button
				variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
				size="sm"
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				className="h-8 w-8 p-0"
			>
				<Quote className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => editor.chain().focus().setHorizontalRule().run()}
				className="h-8 w-8 p-0"
			>
				<Minus className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={() => {
					const url = window.prompt("Image URL:");
					if (url) {
						editor.chain().focus().setImage({ src: url }).run();
					}
				}}
				className="h-8 w-8 p-0"
			>
				<ImageIcon className="h-4 w-4" />
			</Button>

			{/* Table Controls */}
			<div className="relative">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => handleDropdownToggle("table")}
					className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
				>
					<TableIcon className="h-4 w-4" />
				</Button>

				{showTableControls && (
					<div className="absolute top-10 left-0 z-[200] bg-background border rounded-xl shadow-xl backdrop-blur-sm min-w-52 p-3 animate-in slide-in-from-top-2 duration-200">
						{!isInTable ? (
							<div className="space-y-1">
								<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b mb-2">
									Table Options
								</div>
								<button
									type="button"
									className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-primary/10 hover:text-primary rounded-lg w-full transition-all duration-150 group"
									onClick={() => {
										editor
											.chain()
											.focus()
											.insertTable({
												rows: 3,
												cols: 3,
												withHeaderRow: true,
											})
											.run();
										setShowTableControls(false);
									}}
								>
									<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
										<Plus className="h-3 w-3" />
									</div>
									<div className="flex flex-col items-start">
										<span className="font-medium">
											Insert Table
										</span>
										<span className="text-xs text-muted-foreground">
											Create a 3×3 table
										</span>
									</div>
								</button>
							</div>
						) : (
							<div className="space-y-3">
								<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b mb-3">
									Table Actions
								</div>

								{/* Column Controls */}
								<div className="space-y-2">
									<div className="text-xs font-medium text-muted-foreground px-1">
										Columns
									</div>
									<div className="grid grid-cols-2 gap-2">
										<button
											type="button"
											className="flex items-center gap-2 px-2 py-2 text-xs hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-150 group"
											onClick={() => {
												editor
													.chain()
													.focus()
													.addColumnBefore()
													.run();
												setShowTableControls(false);
											}}
										>
											<div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
												<ArrowLeft className="h-3 w-3" />
												<Plus className="h-2 w-2 -ml-1" />
											</div>
											<span className="font-medium">
												Add Left
											</span>
										</button>
										<button
											type="button"
											className="flex items-center gap-2 px-2 py-2 text-xs hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-150 group"
											onClick={() => {
												editor
													.chain()
													.focus()
													.addColumnAfter()
													.run();
												setShowTableControls(false);
											}}
										>
											<div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
												<Plus className="h-2 w-2 -mr-1" />
												<ArrowRight className="h-3 w-3" />
											</div>
											<span className="font-medium">
												Add Right
											</span>
										</button>
										<button
											type="button"
											className="flex items-center gap-2 px-2 py-2 text-xs hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-150 group"
											onClick={() => {
												editor
													.chain()
													.focus()
													.deleteColumn()
													.run();
												setShowTableControls(false);
											}}
										>
											<div className="flex h-5 w-5 items-center justify-center rounded bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
												<Trash2 className="h-3 w-3" />
											</div>
											<span className="font-medium">
												Delete
											</span>
										</button>
									</div>
								</div>

								{/* Row Controls */}
								<div className="space-y-2">
									<div className="text-xs font-medium text-muted-foreground px-1">
										Rows
									</div>
									<div className="grid grid-cols-2 gap-2">
										<button
											type="button"
											className="flex items-center gap-2 px-2 py-2 text-xs hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-150 group"
											onClick={() => {
												editor
													.chain()
													.focus()
													.addRowBefore()
													.run();
												setShowTableControls(false);
											}}
										>
											<div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
												<ArrowUp className="h-3 w-3" />
												<Plus className="h-2 w-2 -ml-1" />
											</div>
											<span className="font-medium">
												Add Above
											</span>
										</button>
										<button
											type="button"
											className="flex items-center gap-2 px-2 py-2 text-xs hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-150 group"
											onClick={() => {
												editor
													.chain()
													.focus()
													.addRowAfter()
													.run();
												setShowTableControls(false);
											}}
										>
											<div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
												<Plus className="h-2 w-2 -mr-1" />
												<ArrowDown className="h-3 w-3" />
											</div>
											<span className="font-medium">
												Add Below
											</span>
										</button>
										<button
											type="button"
											className="flex items-center gap-2 px-2 py-2 text-xs hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all duration-150 group"
											onClick={() => {
												editor
													.chain()
													.focus()
													.deleteRow()
													.run();
												setShowTableControls(false);
											}}
										>
											<div className="flex h-5 w-5 items-center justify-center rounded bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
												<Trash2 className="h-3 w-3" />
											</div>
											<span className="font-medium">
												Delete
											</span>
										</button>
									</div>
								</div>
								<div className="border-t pt-2 space-y-1">
									<button
										type="button"
										className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-primary/10 hover:text-primary rounded-lg w-full transition-all duration-150 group"
										onClick={() =>
											handleDropdownToggle("tableStyle")
										}
									>
										<div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
											<Settings className="h-3 w-3" />
										</div>
										<span className="font-medium">
											Table Styles
										</span>
									</button>
									<button
										type="button"
										className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-destructive/10 hover:text-destructive rounded-lg w-full transition-all duration-150 group"
										onClick={() => {
											editor
												.chain()
												.focus()
												.deleteTable()
												.run();
											setShowTableControls(false);
										}}
									>
										<div className="flex h-5 w-5 items-center justify-center rounded bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
											<Trash2 className="h-3 w-3" />
										</div>
										<span className="font-medium">
											Delete Table
										</span>
									</button>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Table Style Picker */}
				{showTableStylePicker && (
					<div className="absolute top-10 left-0 z-[200] bg-background border rounded-xl shadow-xl backdrop-blur-sm min-w-48 p-3 animate-in slide-in-from-top-2 duration-200">
						<div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b mb-3">
							Table Styles
						</div>
						<div className="space-y-1">
							{TABLE_STYLES.map((style) => (
								<button
									key={style.value}
									type="button"
									className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg w-full transition-all duration-150 group ${
										currentTableStyle === style.class 
											? 'bg-primary text-primary-foreground' 
											: 'hover:bg-primary/10 hover:text-primary'
									}`}
									onClick={() => {
										// Apply table style class to the current table
										if (editor.isActive("table")) {
											// Find the table element first
											const tableElement = editor.view.dom.querySelector('table');
											if (tableElement) {
												// Remove existing table style classes
												tableElement.classList.remove('table-striped', 'table-bordered', 'table-modern');
												
												// Add new style class if not default
												if (style.class) {
													tableElement.classList.add(style.class);
												}
												
												// Update the editor's internal representation
												editor
													.chain()
													.focus()
													.updateAttributes('table', {
														class: style.class,
													})
													.run();
											}
										}
										setShowTableStylePicker(false);
									}}
								>
									<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
										<div className="h-3 w-3 rounded-sm border-2 border-current" />
									</div>
									<div className="flex flex-col items-start">
										<span className="font-medium">
											{style.name}
										</span>
										<span className="text-xs text-muted-foreground text-left">
											{style.value === "default" &&
												"Basic table layout"}
											{style.value === "striped" &&
												"Alternating row colors"}
											{style.value === "bordered" &&
												"Enhanced borders"}
											{style.value === "modern" &&
												"Rounded with shadows"}
										</span>
									</div>
								</button>
							))}
						</div>
					</div>
				)}
			</div>
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
		enabled: !!documentId,
	});
	const updateDocumentMutation = useUpdateDocumentMutation();
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [currentContent, setCurrentContent] = useState("");

	// Manual save function
	const handleSave = useCallback(() => {
		if (hasUnsavedChanges && currentContent) {
			updateDocumentMutation.mutate({
				id: documentId,
				content: currentContent,
			});
			setHasUnsavedChanges(false);
		}
	}, [documentId, currentContent, hasUnsavedChanges, updateDocumentMutation]);

	const editor = useEditor({
		extensions: [
			// Node Extensions
			Document,
			Paragraph,
			Text,
			Heading.configure({
				levels: [1, 2, 3, 4, 5, 6],
			}),
			ListKit,
			Blockquote,
			CodeBlockLowlight.configure({
				lowlight,
			}),
			HorizontalRule,
			HardBreak,
			Image.configure({
				inline: true,
				allowBase64: true,
			}),
			TableKit.configure({
				table: {
					resizable: true,
					HTMLAttributes: {
						class: "",
					},
				},
			}),

			// Mark Extensions
			Bold,
			Italic,
			Underline,
			Strike,
			Code,
			Highlight,
			Link.configure({
				openOnClick: false,
			}),
			Subscript,
			Superscript,
			TextStyleKit,

			// Functionality Extensions
			UndoRedo.configure({
				depth: 100,
			}),
			Dropcursor,
			Typography,
			UniqueID.configure({
				types: ["heading", "paragraph"],
			}),
			BubbleMenu,
		],
		content:
			(typeof document?.content === "string"
				? document.content
				: initialContent) || "<p>Start writing your document...</p>",
		onUpdate: ({ editor }) => {
			const content = editor.getHTML();
			setCurrentContent(content);
			setHasUnsavedChanges(true);
			onContentChange?.(content);
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
			const newContent =
				(typeof document?.content === "string"
					? document.content
					: initialContent) ||
				"<p>Start writing your document...</p>";
			if (newContent && newContent !== editor.getHTML()) {
				editor.commands.setContent(newContent);
			}
		}
	}, [editor, document?.content, initialContent]);

	// Initialize current content when document loads
	useEffect(() => {
		if (document?.content && typeof document.content === "string") {
			setCurrentContent(document.content);
			setHasUnsavedChanges(false);
		}
	}, [document?.content]);

	if (isLoading || !editor) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
				{isLoading && (
					<span className="ml-2 text-sm text-muted-foreground">
						Loading document...
					</span>
				)}
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-card">
			<style jsx global>{`
				.table-striped tbody tr:nth-child(odd) {
					background-color: rgba(0, 0, 0, 0.05);
				}
				.dark .table-striped tbody tr:nth-child(odd) {
					background-color: rgba(255, 255, 255, 0.05);
				}
				.table-bordered {
					border: 1px solid #dee2e6;
				}
				.table-bordered th,
				.table-bordered td {
					border: 1px solid #dee2e6;
				}
				.table-modern {
					border-collapse: separate;
					border-spacing: 0;
					border-radius: 8px;
					overflow: hidden;
					box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
				}
				.table-modern th {
					background-color: #f8f9fa;
					font-weight: 600;
				}
				.dark .table-modern th {
					background-color: #374151;
				}
				.table-modern th,
				.table-modern td {
					padding: 12px;
					border-bottom: 1px solid #e5e7eb;
				}
				.dark .table-modern th,
				.dark .table-modern td {
					border-bottom-color: #4b5563;
				}
				
				/* Enhanced table styles for better resizing */
				table {
					border-collapse: collapse;
					margin: 0;
					overflow: hidden;
					table-layout: fixed;
					width: 100%;
				}
				table td,
				table th {
					border: 2px solid #ced4da;
					box-sizing: border-box;
					min-width: 1em;
					padding: 8px 12px;
					position: relative;
					vertical-align: top;
				}
				.dark table td,
				.dark table th {
					border-color: #4b5563;
				}
				table th {
					background-color: #f1f3f4;
					font-weight: bold;
					text-align: left;
				}
				.dark table th {
					background-color: #374151;
				}
				.selectedCell:after {
					background: rgba(200, 200, 255, 0.4);
					content: "";
					left: 0;
					right: 0;
					top: 0;
					bottom: 0;
					pointer-events: none;
					position: absolute;
					z-index: 2;
				}
				.column-resize-handle {
					background-color: #3b82f6;
					bottom: -2px;
					position: absolute;
					right: -2px;
					top: 0;
					width: 4px;
					cursor: col-resize;
				}
			`}</style>
			<EnhancedToolbar
				editor={editor}
				onSave={handleSave}
				hasUnsavedChanges={hasUnsavedChanges}
			/>
			<div className="relative flex-1">
				<EditorContent editor={editor} className="h-full" />
			</div>
		</div>
	);
}
