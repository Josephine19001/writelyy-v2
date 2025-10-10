"use client";

import { cn } from "@ui/lib";
import { FileText, Folder, Sparkles, Layers } from "lucide-react";
import Image from "next/image";
import heroImage from "../../../../public/images/hero.svg";

const features = [
	{
		id: "writing-assistant",
		title: "AI that actually helps",
		description:
			"Fix grammar, change tone, summarize, paraphrase—all built in. No switching apps, no copy-pasting. Just select text and let AI do its thing.",
		image: heroImage,
		icon: Sparkles,
	},
	{
		id: "snippets",
		title: "Stop retyping the same stuff",
		description:
			"Save email signatures, code blocks, common phrases—anything you use a lot. Insert them anywhere with a click. Your keyboard will thank you.",
		image: heroImage,
		icon: FileText,
	},
	{
		id: "sources",
		title: "Keep your research organized",
		description:
			"Save links, quotes, and notes in one place. No more hunting through 47 browser tabs. Everything you need, right where you're writing.",
		image: heroImage,
		icon: Folder,
	},
	{
		id: "tabs",
		title: "Multi-task without the chaos",
		description:
			"Work on multiple documents at once with tabs. Switch between your blog post, research paper, and meeting notes without losing your flow.",
		image: heroImage,
		icon: Layers,
	},
];

export function Features() {
	return (
		<div
			id="features"
			className="scroll-mt-20 mt-20 mx-auto max-w-screen-xl flex flex-col gap-10"
		>
			{features.map((feature, index) => (
				<div
					key={feature.title}
					id={feature.id}
					className={cn(
						"scroll-mt-20 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center py-32 first:pt-16 px-8 bg-card/80 shadow-sm backdrop-blur-md rounded-2xl",
					)}
				>
					{index % 2 === 0 ? (
						<>
							<div>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
									<feature.icon className="h-6 w-6 text-primary" />
								</div>
								<h2 className="text-4xl font-medium mb-6 leading-tight">
									{feature.title}
								</h2>
								<p className="text-xl text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</div>
							<div>
								<div className="relative w-full max-w-4xl">
									<div className="relative overflow-hidden rounded-xl border border-border/20 bg-card/80 backdrop-blur-sm shadow-lg">
										<div className="flex items-center gap-2 px-6 py-4 border-b border-border/10">
											<div className="flex gap-2">
												<div className="w-3.5 h-3.5 rounded-full bg-red-500/60" />
												<div className="w-3.5 h-3.5 rounded-full bg-yellow-500/60" />
												<div className="w-3.5 h-3.5 rounded-full bg-green-500/60" />
											</div>
											<div className="text-sm text-muted-foreground/60 text-center flex-1">
												Writelyy
											</div>
										</div>

										<Image
											src={feature.image}
											alt={feature.title}
											className="w-full h-full object-cover"
										/>
									</div>
								</div>
							</div>
						</>
					) : (
						<>
							<div className="order-2 lg:order-1">
								<div className="relative w-full max-w-4xl">
									<div className="relative overflow-hidden rounded-xl border border-border/20 bg-card/80 backdrop-blur-sm shadow-lg">
										<div className="flex items-center gap-2 px-6 py-4 border-b border-border/10">
											<div className="flex gap-2">
												<div className="w-3.5 h-3.5 rounded-full bg-red-500/60" />
												<div className="w-3.5 h-3.5 rounded-full bg-yellow-500/60" />
												<div className="w-3.5 h-3.5 rounded-full bg-green-500/60" />
											</div>
											<div className="text-sm text-muted-foreground/60 text-center flex-1">
												Writelyy
											</div>
										</div>

										<Image
											src={feature.image}
											alt={feature.title}
											className="w-full h-full object-cover"
										/>
									</div>
								</div>
							</div>
							<div className="order-1 lg:order-2">
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
									<feature.icon className="h-6 w-6 text-primary" />
								</div>
								<h2 className="text-4xl font-medium mb-6 leading-tight">
									{feature.title}
								</h2>
								<p className="text-xl text-muted-foreground leading-relaxed">
									{feature.description}
								</p>
							</div>
						</>
					)}
				</div>
			))}
		</div>
	);
}
