"use client";

import { Button } from "@ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@ui/components/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { DocumentUploadTab } from "../tabs/DocumentUploadTab";
import { ImageUploadTab } from "../tabs/ImageUploadTab";
import { LinkUploadTab } from "../tabs/LinkUploadTab";

export function AddSourceModal() {
	const [open, setOpen] = useState(false);

	const handleSuccess = () => {
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="primary" size="xs" className="">
					<Plus size={14} />
					Add source
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
						<ImageUploadTab onSuccess={handleSuccess} />
					</TabsContent>

					<TabsContent value="document" className="space-y-4">
						<DocumentUploadTab onSuccess={handleSuccess} />
					</TabsContent>

					<TabsContent value="link" className="space-y-4">
						<LinkUploadTab onSuccess={handleSuccess} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
