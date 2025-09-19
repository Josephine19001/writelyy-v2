"use client";

import { UserMenu } from "@saas/shared/components/UserMenu";
import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@ui/components/tooltip";
import { cn } from "@ui/lib";
import {
	ChevronDown,
	ChevronRight,
	ExternalLink,
	File,
	FileImage,
	FileText,
	Folder,
	FolderPlus,
	Image,
	Link,
	Plus,
	Search,
	Upload,
} from "lucide-react";
import { useState } from "react";
import { OrganzationSelect } from "../../workspaces/components/WorkspaceSelect";

interface Document {
	id: string;
	name: string;
	type: "document" | "folder";
	children?: Document[];
}

interface Source {
	id: string;
	name: string;
	type: "image" | "pdf" | "link";
	url?: string;
}

// Mock data - replace with real data
const mockDocuments: Document[] = [
	{
		id: "1",
		name: "Getting Started",
		type: "document",
	},
	{
		id: "2",
		name: "Project Documentation",
		type: "folder",
		children: [
			{ id: "2-1", name: "API Reference", type: "document" },
			{ id: "2-2", name: "User Guide", type: "document" },
		],
	},
	{
		id: "3",
		name: "Meeting Notes",
		type: "document",
	},
];

const mockSources: Source[] = [
	{ id: "s1", name: "architecture.png", type: "image" },
	{ id: "s2", name: "requirements.pdf", type: "pdf" },
	{
		id: "s3",
		name: "Design System",
		type: "link",
		url: "https://example.com",
	},
];

function TopIconBar() {
	return (
		<div className="flex items-center justify-between p-3 border-b bg-background">
			<div className="flex items-center space-x-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
							>
								<Search className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Search workspace</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
							>
								<FileText className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>New document</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
							>
								<FolderPlus className="h-4 w-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>New folder</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>

			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div className="h-8 w-8">
							<UserMenu />
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<p>User menu</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}

function WorkspaceDropdown() {
	return (
		<div className="p-3 border-b">
			<OrganzationSelect />
		</div>
	);
}

function DocumentTree({ documents }: { documents: Document[] }) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);

	const toggleFolder = (folderId: string) => {
		const newExpanded = new Set(expandedFolders);
		if (newExpanded.has(folderId)) {
			newExpanded.delete(folderId);
		} else {
			newExpanded.add(folderId);
		}
		setExpandedFolders(newExpanded);
	};

	const renderDocument = (doc: Document, level = 0) => {
		const isExpanded = expandedFolders.has(doc.id);
		const hasChildren =
			doc.type === "folder" && doc.children && doc.children.length > 0;

		return (
			<div key={doc.id}>
				<Button
					variant="ghost"
					className={cn(
						"w-full justify-start h-auto p-1 px-2",
						"hover:bg-accent text-sm",
					)}
					style={{ paddingLeft: `${0.5 + level * 0.75}rem` }}
					onClick={() =>
						doc.type === "folder" && toggleFolder(doc.id)
					}
				>
					<div className="flex items-center space-x-2">
						{doc.type === "folder" ? (
							<>
								{hasChildren &&
									(isExpanded ? (
										<ChevronDown className="h-3 w-3" />
									) : (
										<ChevronRight className="h-3 w-3" />
									))}
								<Folder className="h-4 w-4 text-blue-600" />
							</>
						) : (
							<File className="h-4 w-4 text-gray-600" />
						)}
						<span className="truncate">{doc.name}</span>
					</div>
				</Button>

				{isExpanded && hasChildren && (
					<div>
						{doc.children?.map((child) =>
							renderDocument(child, level + 1),
						)}
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-1">
			{documents.map((doc) => renderDocument(doc))}
		</div>
	);
}

function CollapsibleSection({
	title,
	children,
	defaultOpen = false,
}: {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="border-t">
			<Button
				variant="ghost"
				className="w-full justify-between h-auto p-3 font-medium text-sm"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span>{title}</span>
				{isOpen ? (
					<ChevronDown className="h-4 w-4" />
				) : (
					<ChevronRight className="h-4 w-4" />
				)}
			</Button>
			{isOpen && <div className="px-3 pb-3">{children}</div>}
		</div>
	);
}

function AddSourceModal() {
	const [open, setOpen] = useState(false);
	const [linkUrl, setLinkUrl] = useState("");
	const [linkTitle, setLinkTitle] = useState("");

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files[0]) {
			// Handle image upload logic here
			console.log("Image uploaded:", files[0]);
			setOpen(false);
		}
	};

	const handleDocumentUpload = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const files = event.target.files;
		if (files && files[0]) {
			// Handle document upload logic here
			console.log("Document uploaded:", files[0]);
			setOpen(false);
		}
	};

	const handleLinkSubmit = () => {
		if (linkUrl && linkTitle) {
			// Handle link addition logic here
			console.log("Link added:", { url: linkUrl, title: linkTitle });
			setLinkUrl("");
			setLinkTitle("");
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="w-full">
					<Plus className="h-4 w-4 mr-2" />
					Add Source
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Source</DialogTitle>
				</DialogHeader>
				<Tabs defaultValue="image" className="w-full">
					<TabsList className="grid w-full grid-cols-3 mb-4">
						<TabsTrigger value="image">Image</TabsTrigger>
						<TabsTrigger value="document">PDF/Doc</TabsTrigger>
						<TabsTrigger value="link">Link</TabsTrigger>
					</TabsList>

					<TabsContent value="image" className="space-y-4">
						<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
							<Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<Label
								htmlFor="image-upload"
								className="cursor-pointer"
							>
								<span className="text-sm font-medium">
									Click to upload image
								</span>
								<br />
								<span className="text-xs text-muted-foreground">
									PNG, JPG, GIF up to 10MB
								</span>
							</Label>
							<Input
								id="image-upload"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleImageUpload}
							/>
						</div>
					</TabsContent>

					<TabsContent value="document" className="space-y-4">
						<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
							<FileImage className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
							<Label
								htmlFor="document-upload"
								className="cursor-pointer"
							>
								<span className="text-sm font-medium">
									Click to upload document
								</span>
								<br />
								<span className="text-xs text-muted-foreground">
									PDF, DOC, DOCX up to 50MB
								</span>
							</Label>
							<Input
								id="document-upload"
								type="file"
								accept=".pdf,.doc,.docx"
								className="hidden"
								onChange={handleDocumentUpload}
							/>
						</div>
					</TabsContent>

					<TabsContent value="link" className="space-y-4">
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="link-title">Title</Label>
								<Input
									id="link-title"
									placeholder="Enter link title"
									value={linkTitle}
									onChange={(e) =>
										setLinkTitle(e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="link-url">URL</Label>
								<Input
									id="link-url"
									placeholder="https://example.com"
									value={linkUrl}
									onChange={(e) => setLinkUrl(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleLinkSubmit}
								className="w-full"
							>
								<ExternalLink className="h-4 w-4 mr-2" />
								Add Link
							</Button>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

function SourcesList({ sources }: { sources: Source[] }) {
	const getSourceIcon = (type: Source["type"]) => {
		switch (type) {
			case "image":
				return <Image className="h-4 w-4 text-green-600" />;
			case "pdf":
				return <FileImage className="h-4 w-4 text-red-600" />;
			case "link":
				return <Link className="h-4 w-4 text-blue-600" />;
			default:
				return <File className="h-4 w-4 text-gray-600" />;
		}
	};

	return (
		<div className="space-y-2">
			<AddSourceModal />
			<div className="space-y-1">
				{sources.map((source) => (
					<Button
						key={source.id}
						variant="ghost"
						className="w-full justify-start h-auto p-1 px-2 hover:bg-accent text-sm"
					>
						<div className="flex items-center space-x-2">
							{getSourceIcon(source.type)}
							<span className="truncate">{source.name}</span>
						</div>
					</Button>
				))}
			</div>
		</div>
	);
}

interface Asset {
	id: string;
	name: string;
	type: "image";
	url: string;
	thumbnail?: string;
}

// Mock assets data
const mockAssets: Asset[] = [
	{
		id: "1",
		name: "hero-image.jpg",
		type: "image",
		url: "/placeholder1.jpg",
	},
	{ id: "2", name: "diagram.png", type: "image", url: "/placeholder2.png" },
	{
		id: "3",
		name: "screenshot.png",
		type: "image",
		url: "/placeholder3.png",
	},
];

function UploadAssetsModal() {
	const [open, setOpen] = useState(false);

	const handleAssetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files[0]) {
			// Handle asset upload logic here
			console.log("Asset uploaded:", files[0]);
			setOpen(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="w-full">
					<Upload className="h-4 w-4 mr-2" />
					Upload Assets
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Upload Assets</DialogTitle>
				</DialogHeader>
				<div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
					<Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
					<Label htmlFor="asset-upload" className="cursor-pointer">
						<span className="text-sm font-medium">
							Click to upload images
						</span>
						<br />
						<span className="text-xs text-muted-foreground">
							PNG, JPG, GIF, WebP up to 10MB each
						</span>
					</Label>
					<Input
						id="asset-upload"
						type="file"
						accept="image/*"
						multiple
						className="hidden"
						onChange={handleAssetUpload}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function AssetsList({ assets }: { assets: Asset[] }) {
	return (
		<div className="space-y-2">
			<UploadAssetsModal />
			<div className="grid grid-cols-2 gap-2">
				{assets.map((asset) => (
					<Button
						key={asset.id}
						variant="ghost"
						className="h-auto p-2 flex flex-col items-center gap-1 hover:bg-accent"
					>
						<div className="w-full h-12 bg-muted rounded flex items-center justify-center">
							<Image className="h-6 w-6 text-muted-foreground" />
						</div>
						<span className="text-xs truncate w-full text-center">
							{asset.name}
						</span>
					</Button>
				))}
			</div>
		</div>
	);
}

export function LeftSidebar() {
	return (
		<div className="flex flex-col h-full">
			<TopIconBar />
			<WorkspaceDropdown />

			{/* Documents Section - Scrollable */}
			<div className="flex-1 overflow-y-auto min-h-0">
				<div className="p-3">
					<div className="text-sm font-medium text-muted-foreground mb-2">
						Documents
					</div>
					<DocumentTree documents={mockDocuments} />
				</div>
			</div>

			{/* Bottom Collapsible Sections */}
			<div className="border-t bg-background">
				<CollapsibleSection title="Sources" defaultOpen={false}>
					<SourcesList sources={mockSources} />
				</CollapsibleSection>

				<CollapsibleSection title="Assets" defaultOpen={false}>
					<AssetsList assets={mockAssets} />
				</CollapsibleSection>
			</div>
		</div>
	);
}
