"use client";

import { motion } from "framer-motion";
import { FileText, Folder, Layers, Sparkles } from "lucide-react";
import Image from "next/image";
import feature1Dark from "../../../../public/images/feature-1-dark.png";
import feature1Light from "../../../../public/images/feature-1-light.png";
import feature2Dark from "../../../../public/images/feature-2-dark.png";
import feature2Light from "../../../../public/images/feature-2-light.png";
import feature3Dark from "../../../../public/images/feature-3-dark.png";
import feature3Light from "../../../../public/images/feature-3-light.png";
import feature4Dark from "../../../../public/images/feature-4-dark.png";
import feature4Light from "../../../../public/images/feature-4-light.png";
import heroDark from "../../../../public/images/hero-dark.svg";
import heroImage from "../../../../public/images/hero.svg";

const features = [
	{
		id: "writing-assistant",
		title: "AI that actually helps",
		description:
			"Fix grammar, change tone, summarize, paraphrase—all built in. No switching apps, no copy-pasting. Just select text and let AI do its thing.",
		image: heroImage,
		lightImage: feature1Light,
		darkImage: feature1Dark,
		icon: Sparkles,
		gradient: "from-purple-100 via-pink-100 to-blue-100 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950",
	},
	{
		id: "snippets",
		title: "Stop retyping the same stuff",
		description:
			"Save email signatures, code blocks, common phrases—anything you use a lot. Insert them anywhere with a click. Your keyboard will thank you.",
		image: heroImage,
		lightImage: feature2Light,
		darkImage: feature2Dark,
		icon: FileText,
		gradient: "from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950",
	},
	{
		id: "sources",
		title: "Keep your research organized",
		description:
			"Save links, quotes, and notes in one place. No more hunting through 47 browser tabs. Everything you need, right where you're writing.",
		image: heroImage,
		lightImage: feature3Light,
		darkImage: feature3Dark,
		icon: Folder,
		gradient: "from-green-100 via-emerald-100 to-cyan-100 dark:from-green-950 dark:via-emerald-950 dark:to-cyan-950",
	},
	{
		id: "tabs",
		title: "Multi-task without the chaos",
		description:
			"Work on multiple documents at once with tabs. Switch between your blog post, research paper, and meeting notes without losing your flow.",
		image: heroImage,
		lightImage: feature4Light,
		darkImage: feature4Dark,
		icon: Layers,
		gradient: "from-orange-100 via-amber-100 to-yellow-100 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950",
	},
];

function FeatureCard({
	feature,
	index,
}: {
	feature: (typeof features)[0];
	index: number;
}) {
	const isEven = index % 2 === 0;

	return (
		<motion.div
			id={feature.id}
			className={`scroll-mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center py-20 lg:py-32 first:pt-16 px-6 lg:px-12 rounded-3xl bg-gradient-to-br ${feature.gradient}`}
			initial={{ opacity: 0, y: 60 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-100px" }}
			transition={{
				duration: 0.7,
				ease: [0.22, 1, 0.36, 1],
			}}
		>
			{isEven ? (
				<>
					<motion.div
						initial={{ opacity: 0, x: -40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{
							duration: 0.6,
							delay: 0.2,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						<motion.div
							className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-lg border border-gray-300/40 dark:border-white/20"
							whileHover={{ scale: 1.1, rotate: 5 }}
							transition={{ duration: 0.3 }}
						>
							<feature.icon className="h-7 w-7 text-gray-800 dark:text-white" />
						</motion.div>
						<h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
							{feature.title}
						</h2>
						<p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
							{feature.description}
						</p>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{
							duration: 0.6,
							delay: 0.4,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						<motion.div
							className="relative w-full max-w-4xl"
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.3 }}
						>
							<div className="relative overflow-hidden rounded-2xl border-2 border-gray-300/50 dark:border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur-md shadow-2xl">
								{/* Browser Chrome */}
								<div className="flex items-center gap-2 px-6 py-4 border-b border-gray-300/50 dark:border-white/10 bg-gray-100/50 dark:bg-black/30">
									<div className="flex gap-2">
										<motion.div
											className="w-3.5 h-3.5 rounded-full bg-red-500/80"
											whileHover={{ scale: 1.2 }}
										/>
										<motion.div
											className="w-3.5 h-3.5 rounded-full bg-yellow-500/80"
											whileHover={{ scale: 1.2 }}
										/>
										<motion.div
											className="w-3.5 h-3.5 rounded-full bg-green-500/80"
											whileHover={{ scale: 1.2 }}
										/>
									</div>
									<div className="text-sm text-gray-700 dark:text-gray-300 text-center flex-1 font-medium">
										Writelyy
									</div>
								</div>

								{/* Content Area */}
								<div className="relative w-full aspect-[1875/1060]">
									{/* Hero SVG as background - theme aware */}
									<Image
										src={heroImage}
										alt=""
										className="w-full h-full object-cover dark:hidden"
									/>
									<Image
										src={heroDark}
										alt=""
										className="w-full h-full object-cover hidden dark:block"
									/>

									{/* Screenshot overlaid on SVG content area */}
									{feature.lightImage && feature.darkImage && (
										<>
											<div className="absolute dark:hidden" style={{
												left: '11.52%',
												top: '5.94%',
												width: '76.8%',
												height: '84.91%'
											}}>
												<Image
													src={feature.lightImage}
													alt={feature.title}
													className="w-full h-full object-cover rounded-sm"
												/>
											</div>
											<div className="absolute hidden dark:block" style={{
												left: '11.52%',
												top: '5.94%',
												width: '76.8%',
												height: '84.91%'
											}}>
												<Image
													src={feature.darkImage}
													alt={feature.title}
													className="w-full h-full object-cover rounded-sm"
												/>
											</div>
										</>
									)}
								</div>
							</div>
						</motion.div>
					</motion.div>
				</>
			) : (
				<>
					<motion.div
						className="order-2 lg:order-1"
						initial={{ opacity: 0, x: -40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{
							duration: 0.6,
							delay: 0.4,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						<motion.div
							className="relative w-full max-w-4xl"
							whileHover={{ scale: 1.02 }}
							transition={{ duration: 0.3 }}
						>
							<div className="relative overflow-hidden rounded-2xl border-2 border-gray-300/50 dark:border-white/20 bg-white/60 dark:bg-black/40 backdrop-blur-md shadow-2xl">
								{/* Browser Chrome */}
								<div className="flex items-center gap-2 px-6 py-4 border-b border-gray-300/50 dark:border-white/10 bg-gray-100/50 dark:bg-black/30">
									<div className="flex gap-2">
										<motion.div
											className="w-3.5 h-3.5 rounded-full bg-red-500/80"
											whileHover={{ scale: 1.2 }}
										/>
										<motion.div
											className="w-3.5 h-3.5 rounded-full bg-yellow-500/80"
											whileHover={{ scale: 1.2 }}
										/>
										<motion.div
											className="w-3.5 h-3.5 rounded-full bg-green-500/80"
											whileHover={{ scale: 1.2 }}
										/>
									</div>
									<div className="text-sm text-gray-700 dark:text-gray-300 text-center flex-1 font-medium">
										Writelyy
									</div>
								</div>

								{/* Content Area */}
								<div className="relative w-full aspect-[1875/1060]">
									{/* Hero SVG as background - theme aware */}
									<Image
										src={heroImage}
										alt=""
										className="w-full h-full object-cover dark:hidden"
									/>
									<Image
										src={heroDark}
										alt=""
										className="w-full h-full object-cover hidden dark:block"
									/>

									{/* Screenshot overlaid on SVG content area */}
									{feature.lightImage && feature.darkImage && (
										<>
											<div className="absolute dark:hidden" style={{
												left: '11.52%',
												top: '5.94%',
												width: '76.8%',
												height: '84.91%'
											}}>
												<Image
													src={feature.lightImage}
													alt={feature.title}
													className="w-full h-full object-cover rounded-sm"
												/>
											</div>
											<div className="absolute hidden dark:block" style={{
												left: '11.52%',
												top: '5.94%',
												width: '76.8%',
												height: '84.91%'
											}}>
												<Image
													src={feature.darkImage}
													alt={feature.title}
													className="w-full h-full object-cover rounded-sm"
												/>
											</div>
										</>
									)}
								</div>
							</div>
						</motion.div>
					</motion.div>
					<motion.div
						className="order-1 lg:order-2"
						initial={{ opacity: 0, x: 40 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{
							duration: 0.6,
							delay: 0.2,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						<motion.div
							className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm shadow-lg border border-gray-300/40 dark:border-white/20"
							whileHover={{ scale: 1.1, rotate: 5 }}
							transition={{ duration: 0.3 }}
						>
							<feature.icon className="h-7 w-7 text-gray-800 dark:text-white" />
						</motion.div>
						<h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
							{feature.title}
						</h2>
						<p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
							{feature.description}
						</p>
					</motion.div>
				</>
			)}
		</motion.div>
	);
}

export function Features() {
	return (
		<div
			id="features"
			className="scroll-mt-20 py-20 lg:py-32 mx-auto max-w-screen-xl px-6"
		>
			{/* Section Header */}
			<motion.div
				className="text-center mb-20"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{
					duration: 0.6,
					ease: [0.22, 1, 0.36, 1],
				}}
			>
				<motion.div
					className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6"
					initial={{ scale: 0.9, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
				>
					<span className="text-sm font-medium text-purple-400">Features</span>
				</motion.div>
				<h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
					Everything you need.{" "}
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
						Nothing you don't.
					</span>
				</h2>
				<p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
					Built for real writers who need real tools—not bloatware
				</p>
			</motion.div>

			{/* Features Grid */}
			<div className="flex flex-col gap-10">
				{features.map((feature, index) => (
					<FeatureCard key={feature.id} feature={feature} index={index} />
				))}
			</div>
		</div>
	);
}
