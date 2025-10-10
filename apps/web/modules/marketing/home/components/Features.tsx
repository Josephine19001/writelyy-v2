"use client";

import { cn } from "@ui/lib";
import { FileText, Folder, Layers, Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import heroImage from "../../../../public/images/hero.svg";

const features = [
	{
		id: "writing-assistant",
		title: "AI that actually helps",
		description:
			"Fix grammar, change tone, summarize, paraphrase—all built in. No switching apps, no copy-pasting. Just select text and let AI do its thing.",
		image: heroImage,
		icon: Sparkles,
		gradient: "from-purple-100 via-pink-50 to-blue-50",
	},
	{
		id: "snippets",
		title: "Stop retyping the same stuff",
		description:
			"Save email signatures, code blocks, common phrases—anything you use a lot. Insert them anywhere with a click. Your keyboard will thank you.",
		image: heroImage,
		icon: FileText,
		gradient: "from-blue-100 via-cyan-50 to-teal-50",
	},
	{
		id: "sources",
		title: "Keep your research organized",
		description:
			"Save links, quotes, and notes in one place. No more hunting through 47 browser tabs. Everything you need, right where you're writing.",
		image: heroImage,
		icon: Folder,
		gradient: "from-green-100 via-emerald-50 to-cyan-50",
	},
	{
		id: "tabs",
		title: "Multi-task without the chaos",
		description:
			"Work on multiple documents at once with tabs. Switch between your blog post, research paper, and meeting notes without losing your flow.",
		image: heroImage,
		icon: Layers,
		gradient: "from-orange-100 via-amber-50 to-yellow-50",
	},
];

function FeatureCard({
	feature,
	index,
}: {
	feature: (typeof features)[0];
	index: number;
}) {
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
				}
			},
			{ threshold: 0.1 },
		);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				observer.unobserve(ref.current);
			}
		};
	}, []);

	const isEven = index % 2 === 0;

	return (
		<div
			ref={ref}
			id={feature.id}
			className={cn(
				"scroll-mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center py-20 lg:py-32 first:pt-16 px-6 lg:px-12 rounded-3xl transition-all duration-1000",
				`bg-gradient-to-br ${feature.gradient}`,
				isVisible
					? "opacity-100 translate-y-0"
					: "opacity-0 translate-y-8",
			)}
		>
			{isEven ? (
				<>
					<div
						className={cn(
							"transition-all duration-700 delay-200",
							isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
						)}
					>
						<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
							<feature.icon className="h-7 w-7 text-primary" />
						</div>
						<h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight text-gray-900">
							{feature.title}
						</h2>
						<p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
							{feature.description}
						</p>
					</div>
					<div
						className={cn(
							"transition-all duration-700 delay-400",
							isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
						)}
					>
						<div className="relative w-full max-w-4xl hover:scale-[1.02] transition-transform duration-300">
							<div className="relative overflow-hidden rounded-2xl border-2 border-white/60 bg-white/40 backdrop-blur-md shadow-2xl">
								<div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200/50 bg-white/30">
									<div className="flex gap-2">
										<div className="w-3.5 h-3.5 rounded-full bg-red-400/80" />
										<div className="w-3.5 h-3.5 rounded-full bg-yellow-400/80" />
										<div className="w-3.5 h-3.5 rounded-full bg-green-400/80" />
									</div>
									<div className="text-sm text-gray-600 text-center flex-1 font-medium">
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
					<div
						className={cn(
							"order-2 lg:order-1 transition-all duration-700 delay-400",
							isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8",
						)}
					>
						<div className="relative w-full max-w-4xl hover:scale-[1.02] transition-transform duration-300">
							<div className="relative overflow-hidden rounded-2xl border-2 border-white/60 bg-white/40 backdrop-blur-md shadow-2xl">
								<div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200/50 bg-white/30">
									<div className="flex gap-2">
										<div className="w-3.5 h-3.5 rounded-full bg-red-400/80" />
										<div className="w-3.5 h-3.5 rounded-full bg-yellow-400/80" />
										<div className="w-3.5 h-3.5 rounded-full bg-green-400/80" />
									</div>
									<div className="text-sm text-gray-600 text-center flex-1 font-medium">
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
					<div
						className={cn(
							"order-1 lg:order-2 transition-all duration-700 delay-200",
							isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
						)}
					>
						<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg">
							<feature.icon className="h-7 w-7 text-primary" />
						</div>
						<h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight text-gray-900">
							{feature.title}
						</h2>
						<p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
							{feature.description}
						</p>
					</div>
				</>
			)}
		</div>
	);
}

export function Features() {
	return (
		<div
			id="features"
			className="scroll-mt-20 mt-20 mx-auto max-w-screen-xl flex flex-col gap-10"
		>
			{features.map((feature, index) => (
				<FeatureCard key={feature.id} feature={feature} index={index} />
			))}
		</div>
	);
}
