"use client";

import { Button } from "@ui/components/button";
import { Textarea } from "@ui/components/textarea";
import {
	FileText,
	Image as ImageIcon,
	Link as LinkIcon,
	Sparkles,
	Type,
	Wand2,
} from "lucide-react";
import { useState } from "react";

const QUICK_ACTIONS = [
	{
		id: "grammar",
		label: "Fix grammar",
		icon: Wand2,
		color: "text-blue-500",
	},
	{
		id: "summarize",
		label: "Summarize",
		icon: FileText,
		color: "text-purple-500",
	},
	{
		id: "tone",
		label: "Change tone",
		icon: Type,
		color: "text-green-500",
	},
];

const SOURCE_TYPES = [
	{
		id: "pdf",
		label: "PDF",
		icon: FileText,
		accept: ".pdf",
	},
	{
		id: "image",
		label: "Image",
		icon: ImageIcon,
		accept: "image/*",
	},
	{
		id: "link",
		label: "Link",
		icon: LinkIcon,
		accept: null,
	},
];

export function EditorDemo() {
	const [text, setText] = useState(
		"Try typing something here, or upload a source to get started...",
	);
	const [sources, setSources] = useState<string[]>([]);
	const [activeAction, setActiveAction] = useState<string | null>(null);

	const handleSourceUpload = (type: string) => {
		if (type === "link") {
			const url = prompt("Enter a URL:");
			if (url) {
				setSources([...sources, `Link: ${url}`]);
			}
		} else {
			// Simulate file upload
			setSources([
				...sources,
				`${type === "pdf" ? "PDF" : "Image"}: document.${type === "pdf" ? "pdf" : "jpg"}`,
			]);
		}
	};

	const handleQuickAction = (actionId: string) => {
		setActiveAction(actionId);
		setTimeout(() => setActiveAction(null), 1000);

		// Simulate action
		if (actionId === "grammar") {
			setText(text.replace(/\bi\b/g, "I"));
		} else if (actionId === "summarize") {
			setText("✨ This is a summary of your text...");
		} else if (actionId === "tone") {
			setText("✨ Here's your text with a different tone...");
		}
	};

	return (
		<div className="mx-auto mt-12 max-w-5xl">
			<div className="mb-6 text-center">
				<h3 className="mb-2 font-semibold text-2xl">Try it yourself</h3>
				<p className="text-foreground/60">
					Write, upload sources, and test AI actions—no signup needed
				</p>
			</div>

			<div className="relative">
				{/* Editor Container */}
				<div className="overflow-hidden rounded-3xl border bg-card shadow-lg">
					{/* Header with Quick Actions */}
					<div className="flex items-center justify-between border-b bg-muted/30 px-6 py-4">
						<div className="flex items-center gap-2">
							<Sparkles className="h-5 w-5 text-primary" />
							<span className="font-medium text-sm">
								Quick Actions
							</span>
						</div>
						<div className="flex gap-2">
							{QUICK_ACTIONS.map((action) => (
								<Button
									key={action.id}
									size="sm"
									variant={
										activeAction === action.id
											? "default"
											: "outline"
									}
									onClick={() => handleQuickAction(action.id)}
									className="gap-2"
								>
									<action.icon
										className={`h-4 w-4 ${action.color}`}
									/>
									<span className="hidden sm:inline">
										{action.label}
									</span>
								</Button>
							))}
						</div>
					</div>

					{/* Editor */}
					<Textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						rows={10}
						className="resize-none border-0 bg-transparent px-6 py-4 text-base focus-visible:ring-0"
						placeholder="Start typing..."
					/>

					{/* Footer with Sources */}
					<div className="border-t bg-muted/30 px-6 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<span className="text-foreground/60 text-sm">
									Add sources:
								</span>
								{SOURCE_TYPES.map((source) => (
									<Button
										key={source.id}
										size="sm"
										variant="ghost"
										onClick={() =>
											handleSourceUpload(source.id)
										}
										className="gap-2"
									>
										<source.icon className="h-4 w-4" />
										{source.label}
									</Button>
								))}
							</div>
							<div className="text-foreground/60 text-sm">
								{sources.length > 0 && (
									<span>{sources.length} sources added</span>
								)}
							</div>
						</div>

						{/* Display Sources */}
						{sources.length > 0 && (
							<div className="mt-3 flex flex-wrap gap-2">
								{sources.map((source, index) => (
									<div
										key={index}
										className="flex items-center gap-2 rounded-lg border bg-card px-3 py-1 text-sm"
									>
										<FileText className="h-3 w-3 text-primary" />
										{source}
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Call to Action */}
				<div className="mt-6 text-center">
					<p className="mb-3 text-foreground/60 text-sm">
						Like what you see? Get the full experience
					</p>
					<Button size="lg" asChild>
						<a href="/auth/signup">
							Start writing free
							<Sparkles className="ml-2 h-4 w-4" />
						</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
