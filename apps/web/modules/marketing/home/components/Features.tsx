"use client";

import { cn } from "@ui/lib";
import Image from "next/image";
import Link from "next/link";
import heroImage from "../../../../public/images/hero.svg";

const features = [
	{
		title: "Workspace sources",
		description:
			"References your images, PDFs, docs, and links for contextual AI responses",
		image: heroImage,
	},
	{
		title: "Smart completions",
		description: "AI predicts and suggests your next edits as you type",
		image: heroImage,
	},
	{
		title: "Context awareness",
		description:
			"Understands and references other documents in your workspace",
		image: heroImage,
	},
	{
		title: "Real-time collaboration",
		description:
			"Multiple cursors, live editing, and seamless team workflow",
		image: heroImage,
	},
];

export function Features() {
	return (
		<div className="mt-20 mx-auto max-w-screen-xl flex flex-col gap-10">
			{features.map((feature, index) => (
				<div
					key={feature.title}
					className={cn(
						"grid grid-cols-1 lg:grid-cols-2 gap-24 items-center py-32 first:pt-16 px-8 bg-card/80 shadow-sm backdrop-blur-md",
					)}
				>
					{index % 2 === 0 ? (
						<>
							<div>
								<h2 className="text-4xl font-medium mb-6 leading-tight">
									{feature.title}
								</h2>
								<p className="text-xl text-muted-foreground leading-relaxed">
									{feature.description}{" "}
									<Link
										href="/features"
										className="text-primary hover:underline"
									>
										Learn more
									</Link>
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
							<div>
								<h2 className="text-4xl font-medium mb-6 leading-tight">
									{feature.title}
								</h2>
								<p className="text-xl text-muted-foreground leading-relaxed">
									{feature.description}{" "}
									<Link
										href="/features"
										className="text-primary hover:underline"
									>
										Learn more
									</Link>
								</p>
							</div>
						</>
					)}
				</div>
			))}
		</div>
	);
}
