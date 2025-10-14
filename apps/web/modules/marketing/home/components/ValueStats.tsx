"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";

const stats = [
	{
		id: "time",
		label: "Time Saved",
		icon: Clock,
		value: "15+ hours",
		period: "per month",
		description: "No more switching between tools and tabs",
		details: [
			"Average 2 hours/week context switching",
			"30 min/day searching for sources and notes",
			"1 hour/week copying between tools",
		],
		gradient: "from-blue-500 to-cyan-500",
		bgGradient: "from-blue-100 via-cyan-100 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-950",
	},
	{
		id: "money",
		label: "Money Saved",
		icon: DollarSign,
		value: "$300+",
		period: "per year",
		description: "Replace multiple subscriptions with one",
		details: [
			"Grammarly Premium: $144/year",
			"ChatGPT Plus: $240/year",
			"QuillBot Premium: $100/year",
		],
		gradient: "from-green-500 to-emerald-500",
		bgGradient: "from-green-100 via-emerald-100 to-green-100 dark:from-green-950 dark:via-emerald-950 dark:to-green-950",
	},
	{
		id: "productivity",
		label: "Productivity Gain",
		icon: TrendingUp,
		value: "3x faster",
		period: "writing speed",
		description: "Everything integrated, nothing slowing you down",
		details: [
			"Instant AI assistance without leaving editor",
			"Research and sources at your fingertips",
			"No copy-paste workflow overhead",
		],
		gradient: "from-purple-500 to-pink-500",
		bgGradient: "from-purple-100 via-pink-100 to-purple-100 dark:from-purple-950 dark:via-pink-950 dark:to-purple-950",
	},
];

export function ValueStats() {
	const [activeTab, setActiveTab] = useState("time");

	const activeStat = stats.find((stat) => stat.id === activeTab) || stats[0];

	return (
		<div className="relative py-20 lg:py-32 px-6 overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-black dark:via-gray-950 dark:to-black" />

			{/* Gradient Orbs with animation */}
			<motion.div
				className="absolute inset-0 overflow-hidden pointer-events-none"
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
			>
				<motion.div
					className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[128px]"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.1, 0.15, 0.1],
					}}
					transition={{
						duration: 8,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
			</motion.div>

			<div className="relative max-w-6xl mx-auto">
				{/* Header */}
				<motion.div
					className="text-center mb-16"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{
						duration: 0.6,
						ease: [0.22, 1, 0.36, 1],
					}}
				>
					<h2 className="text-4xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight">
						The real value of{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
							simplicity
						</span>
					</h2>
					<p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
						See what you gain when everything works together
					</p>
				</motion.div>

				{/* Tabs */}
				<motion.div
					className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{
						duration: 0.6,
						delay: 0.2,
						ease: [0.22, 1, 0.36, 1],
					}}
				>
					{stats.map((stat, index) => (
						<motion.button
							key={stat.id}
							onClick={() => setActiveTab(stat.id)}
							className={`relative group px-6 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 min-w-[200px] ${
								activeTab === stat.id
									? "bg-gray-200/80 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 shadow-lg"
									: "bg-gray-100/50 dark:bg-white/5 border border-gray-300/40 dark:border-white/10 hover:bg-gray-200/60 dark:hover:bg-white/[0.07] hover:border-gray-400/50 dark:hover:border-white/15"
							}`}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{
								delay: 0.3 + index * 0.1,
								duration: 0.5,
							}}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.98 }}
						>
							<motion.div
								className={`p-2 rounded-lg transition-colors ${
									activeTab === stat.id
										? `bg-gradient-to-br ${stat.gradient}`
										: "bg-gray-200/50 dark:bg-white/5"
								}`}
								animate={
									activeTab === stat.id ? { rotate: [0, 5, 0] } : { rotate: 0 }
								}
								transition={{ duration: 0.3 }}
							>
								<stat.icon
									className={`h-5 w-5 transition-colors ${
										activeTab === stat.id ? "text-white" : "text-gray-600 dark:text-gray-400"
									}`}
								/>
							</motion.div>
							<span
								className={`font-medium transition-colors ${
									activeTab === stat.id ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
								}`}
							>
								{stat.label}
							</span>

							{activeTab === stat.id && (
								<motion.div
									className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl -z-10"
									layoutId="activeTab"
									transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
								/>
							)}
						</motion.button>
					))}
				</motion.div>

				{/* Content */}
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{
							duration: 0.4,
							ease: [0.22, 1, 0.36, 1],
						}}
					>
						<div className="relative">
							<motion.div
								className={`absolute inset-0 bg-gradient-to-br opacity-20 rounded-3xl blur-3xl ${activeStat.gradient}`}
								animate={{
									opacity: [0.2, 0.3, 0.2],
								}}
								transition={{
									duration: 3,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>
							<motion.div
								className={`relative p-12 rounded-3xl border backdrop-blur-sm bg-gradient-to-br ${activeStat.bgGradient} border-gray-300/50 dark:border-white/10`}
								initial={{ scale: 0.95 }}
								animate={{ scale: 1 }}
								transition={{
									duration: 0.4,
									ease: [0.22, 1, 0.36, 1],
								}}
							>
								<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8">
									<motion.div
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.1 }}
									>
										<div className="flex items-baseline gap-3 mb-3">
											<motion.h3
												className="text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white"
												initial={{ scale: 0.8, opacity: 0 }}
												animate={{ scale: 1, opacity: 1 }}
												transition={{
													delay: 0.2,
													type: "spring",
													bounce: 0.5,
												}}
											>
												{activeStat.value}
											</motion.h3>
											<span className="text-2xl text-gray-600 dark:text-gray-400">
												{activeStat.period}
											</span>
										</div>
										<p className="text-xl text-gray-700 dark:text-gray-300">
											{activeStat.description}
										</p>
									</motion.div>

									<motion.div
										className={`p-4 rounded-2xl bg-gradient-to-br ${activeStat.gradient}`}
										initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
										animate={{ opacity: 1, scale: 1, rotate: 0 }}
										transition={{
											delay: 0.3,
											type: "spring",
											bounce: 0.5,
										}}
										whileHover={{ scale: 1.1, rotate: 5 }}
									>
										<activeStat.icon className="h-12 w-12 text-white" />
									</motion.div>
								</div>

								<motion.div
									className="grid md:grid-cols-3 gap-4"
									initial="hidden"
									animate="visible"
									variants={{
										hidden: { opacity: 0 },
										visible: {
											opacity: 1,
											transition: {
												staggerChildren: 0.1,
												delayChildren: 0.2,
											},
										},
									}}
								>
									{activeStat.details.map((detail, index) => (
										<motion.div
											key={index}
											className="p-4 rounded-xl bg-white/50 dark:bg-black/30 border border-gray-300/50 dark:border-white/10"
											variants={{
												hidden: { opacity: 0, y: 20 },
												visible: {
													opacity: 1,
													y: 0,
													transition: {
														duration: 0.5,
														ease: [0.22, 1, 0.36, 1],
													},
												},
											}}
											whileHover={{
												scale: 1.05,
												borderColor: "rgba(255, 255, 255, 0.2)",
											}}
										>
											<div className="flex items-start gap-3">
												<motion.div
													className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-600 dark:bg-white/60"
													animate={{
														scale: [1, 1.5, 1],
													}}
													transition={{
														duration: 2,
														repeat: Number.POSITIVE_INFINITY,
														delay: index * 0.2,
													}}
												/>
												<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
													{detail}
												</p>
											</div>
										</motion.div>
									))}
								</motion.div>
							</motion.div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}
