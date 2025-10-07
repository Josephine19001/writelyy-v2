"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@shared/tiptap/components/tiptap-ui-primitive/dropdown-menu";
import { IconButton } from "@ui/components/icon-button";
import { File, Globe, Plus, Upload } from "lucide-react";
import * as React from "react";

export interface SourcesDropdownProps {
	onUploadFile?: () => void;
	onSelectDocument?: () => void;
	onAddWebSource?: () => void;
	onAddReference?: () => void;
	disabled?: boolean;
}

export function SourcesDropdown({
	onUploadFile,
	onSelectDocument,
	onAddWebSource,
	onAddReference,
	disabled = false,
}: SourcesDropdownProps) {
	const [isOpen, setIsOpen] = React.useState(false);

	const handleUploadFile = () => {
		setIsOpen(false);
		if (onUploadFile) {
			onUploadFile();
		}
	};

	const handleSelectDocument = () => {
		setIsOpen(false);
		if (onSelectDocument) {
			onSelectDocument();
		}
	};

	const handleAddWebSource = () => {
		setIsOpen(false);
		if (onAddWebSource) {
			onAddWebSource();
		}
	};

	const handleAddReference = () => {
		setIsOpen(false);
		if (onAddReference) {
			onAddReference();
		}
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<IconButton
					variant="ghost"
					size="sm"
					icon={<Plus />}
					disabled={disabled}
					title="Add context from files, folders, or sources"
				/>
			</DropdownMenuTrigger>

			<DropdownMenuContent className="w-56" align="start">
				<DropdownMenuItem
					onClick={handleUploadFile}
					className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm"
				>
					<Upload className="h-4 w-4 flex-shrink-0" />
					<span>Upload file</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={handleSelectDocument}
					className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm"
				>
					<File className="h-4 w-4 flex-shrink-0" />
					<span>Select from documents</span>
				</DropdownMenuItem>

				{/* <DropdownMenuSeparator /> */}

				<DropdownMenuItem
					onClick={handleAddWebSource}
					className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm"
				>
					<Globe className="h-4 w-4 flex-shrink-0" />
					<span>Add web source</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={handleAddReference}
					className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm"
				>
					<File className="h-4 w-4 flex-shrink-0" />
					<span>Reference section</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
