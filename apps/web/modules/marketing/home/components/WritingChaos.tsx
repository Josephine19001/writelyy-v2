"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: [0.22, 1, 0.36, 1] as const,
		},
	},
};

const toolVariants = {
	hidden: { opacity: 0, x: -20, rotate: -5 },
	visible: (i: number) => ({
		opacity: 1,
		x: 0,
		rotate: Math.random() * 6 - 3,
		transition: {
			delay: i * 0.1,
			duration: 0.5,
			ease: [0.22, 1, 0.36, 1] as const,
		},
	}),
};

export function WritingChaos() {
	return (
		<div className="relative py-24 lg:py-32 overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

			{/* Gradient Orbs with animation */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<motion.div
					className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-600/20 dark:bg-purple-600/20 rounded-full blur-[128px]"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.2, 0.3, 0.2],
					}}
					transition={{
						duration: 8,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-600/20 dark:bg-blue-600/20 rounded-full blur-[128px]"
					animate={{
						scale: [1, 1.3, 1],
						opacity: [0.2, 0.25, 0.2],
					}}
					transition={{
						duration: 10,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
			</div>

			{/* Top border accent */}
			<motion.div
				className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
				initial={{ scaleX: 0 }}
				whileInView={{ scaleX: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1, ease: "easeOut" }}
			/>
			<motion.div
				className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
				initial={{ scaleX: 0 }}
				whileInView={{ scaleX: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
			/>

			<div className="relative max-w-6xl mx-auto px-6">
				{/* Problem Section */}
				<motion.div
					className="text-center mb-20"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					<motion.div
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8"
						variants={itemVariants}
					>
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
							<span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
						</span>
						<span className="text-sm font-medium text-red-400 dark:text-red-400">
							The Problem
						</span>
					</motion.div>

					<motion.h2
						className="text-5xl lg:text-7xl font-bold mb-8 text-gray-900 dark:text-white tracking-tight"
						variants={itemVariants}
					>
						Too many tools.
						<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 dark:from-gray-400 dark:via-gray-500 dark:to-gray-600">
							Too much chaos.
						</span>
					</motion.h2>

					<motion.p
						className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
						variants={itemVariants}
					>
						ChatGPT. Grammarly. Humanizers. Paraphrasers. Research
						tabs.
						<br />
						<span className="text-gray-500 dark:text-gray-500">
							Just to write one thing. There's a better way.
						</span>
					</motion.p>
				</motion.div>

				{/* Visual Chaos to Calm */}
				<motion.div
					className="relative"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					<div className="grid lg:grid-cols-3 gap-8 items-center">
						{/* Before - Chaos */}
						<motion.div
							className="lg:col-span-1"
							variants={itemVariants}
						>
							<div className="relative">
								<div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl blur-xl" />
								<div className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-900/50 dark:to-gray-800/50 border border-gray-300/50 dark:border-gray-700/50 backdrop-blur-sm">
									<motion.div
										className="space-y-3"
										initial="hidden"
										whileInView="visible"
										viewport={{ once: true }}
									>
										{[
											"ChatGPT",
											"Grammarly",
											"QuillBot",
											"Notion",
											"Google Docs",
											"PDFs",
											"Research tabs...",
										].map((tool, i) => (
											<motion.div
												key={tool}
												className="flex items-center gap-3 p-3 rounded-lg bg-white/80 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700/30"
												custom={i}
												variants={toolVariants}
												whileHover={{
													scale: 1.05,
													rotate: 0,
												}}
											>
												<div className="w-2 h-2 rounded-full bg-red-400/60" />
												<span className="text-sm text-gray-700 dark:text-gray-400">
													{tool}
												</span>
											</motion.div>
										))}
									</motion.div>
								</div>
							</div>
						</motion.div>

						{/* Arrow */}
						<motion.div
							className="lg:col-span-1 flex justify-center"
							variants={itemVariants}
						>
							<div className="relative">
								<div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl" />
								<motion.div
									className="relative p-6 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-sm"
									animate={{
										x: [0, 10, 0],
									}}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
									}}
								>
									<ArrowRight className="h-8 w-8 text-purple-400" />
								</motion.div>
							</div>
						</motion.div>

						{/* After - Calm */}
						<motion.div
							className="lg:col-span-1"
							variants={itemVariants}
						>
							<div className="relative">
								<motion.div
									className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl"
									animate={{
										opacity: [0.2, 0.4, 0.2],
									}}
									transition={{
										duration: 3,
										repeat: Number.POSITIVE_INFINITY,
										ease: "easeInOut",
									}}
								/>
								<motion.div
									className="relative p-8 rounded-3xl bg-gradient-to-br from-purple-100/80 to-blue-100/80 dark:from-purple-950/80 dark:to-blue-950/80 border border-purple-300/50 dark:border-purple-500/30 backdrop-blur-sm"
									whileHover={{ scale: 1.02 }}
									transition={{ duration: 0.3 }}
								>
									<div className="flex items-center gap-3 mb-6">
										<motion.div
											className="p-2 rounded-lg bg-purple-200/50 dark:bg-white/10"
											whileHover={{ rotate: 360 }}
											transition={{ duration: 0.6 }}
										>
											<Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
										</motion.div>
										<span className="font-semibold text-gray-900 dark:text-white">
											Writelyy
										</span>
									</div>
									<p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
										Everything you need—AI, grammar,
										sources, research—built into one
										powerful editor.
									</p>
									<div className="mt-6 flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
										<span>One place. Zero chaos.</span>
										<motion.div
											animate={{ x: [0, 5, 0] }}
											transition={{
												duration: 1.5,
												repeat: Number.POSITIVE_INFINITY,
												ease: "easeInOut",
											}}
										>
											<ArrowRight className="h-4 w-4" />
										</motion.div>
									</div>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
