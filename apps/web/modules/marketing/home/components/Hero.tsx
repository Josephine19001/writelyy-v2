"use client";

import { Button } from "@ui/components/button";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { config } from "@repo/config";
import { BetaCTA } from "@marketing/shared/components/BetaCTA";
import { WaitlistDialog } from "./WaitlistDialog";

const typingTexts = [
	"AI helps you write better, faster",
	"Transform your ideas into polished content",
	"Write with confidence and clarity",
	"From blank page to brilliant prose",
	"Your AI writing partner, always ready",
];

export function Hero() {
	const heroRef = useRef<HTMLDivElement>(null);
	const [currentTextIndex, setCurrentTextIndex] = useState(0);
	const [displayedText, setDisplayedText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	// Typing effect
	useEffect(() => {
		const targetText = typingTexts[currentTextIndex];
		const typingSpeed = isDeleting ? 30 : 60;

		const timeout = setTimeout(() => {
			if (!isDeleting) {
				// Typing forward
				if (displayedText.length < targetText.length) {
					setDisplayedText(
						targetText.slice(0, displayedText.length + 1),
					);
				} else {
					// Pause at the end before deleting
					setTimeout(() => setIsDeleting(true), 2000);
				}
			} else {
				// Deleting
				if (displayedText.length > 0) {
					setDisplayedText(displayedText.slice(0, -1));
				} else {
					// Move to next text
					setIsDeleting(false);
					setCurrentTextIndex(
						(prev) => (prev + 1) % typingTexts.length,
					);
				}
			}
		}, typingSpeed);

		return () => clearTimeout(timeout);
	}, [displayedText, isDeleting, currentTextIndex]);

	return (
		<section className="relative min-h-[100vh] overflow-hidden flex items-center justify-center py-20 lg:py-32">
			{/* Enhanced gradient background with animated orbs */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950/50 dark:to-pink-950/30">
				{/* Animated gradient orbs */}
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
					className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-600/20 dark:bg-pink-600/20 rounded-full blur-[128px]"
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
				<div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-noise" />
			</div>

			<div
				ref={heroRef}
				className="mx-auto max-w-screen-xl px-6 lg:px-12 relative z-10"
			>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
					{/* Left side - Simplified focused messaging */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.8,
							ease: [0.22, 1, 0.36, 1] as const,
						}}
					>
						{/* Simple badge */}
						<motion.div
							className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 backdrop-blur-sm px-5 py-2.5 border border-purple-200/50 dark:border-purple-500/30"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
						>
							<Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
							<span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
								AI-Powered Writing Assistant
							</span>
						</motion.div>

						{/* Clean, focused headline */}
						<h1 className="font-bold text-4xl lg:text-6xl xl:text-7xl leading-[1.1] text-gray-900 dark:text-gray-100 mb-6">
							Write better,{" "}
							<span className="relative inline-block">
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400">
									faster
								</span>
								<motion.span
									className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 rounded-full"
									initial={{ scaleX: 0 }}
									animate={{ scaleX: 1 }}
									transition={{ delay: 0.8, duration: 0.6 }}
								/>
							</span>
						</h1>

						{/* Simple, direct subtitle */}
						<motion.p
							className="max-w-xl text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4, duration: 0.6 }}
						>
							All your writing tools in one place. No more
							juggling tabs.
						</motion.p>

						{/* Simple CTAs */}
						<motion.div
							className="flex flex-wrap gap-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6, duration: 0.6 }}
						>
							<WaitlistDialog>
								<Button className="group bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-10 py-7 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
									<span className="flex items-center gap-2">
										Start Writing Better
										<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
									</span>
								</Button>
							</WaitlistDialog>
							<Button
								asChild
								variant="outline"
								className="px-10 py-7 text-lg font-medium rounded-xl border-2 border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-900 dark:text-gray-100 transition-all duration-300"
							>
								<a href="/#features">See How It Works</a>
							</Button>
						</motion.div>
					</motion.div>

					{/* Right side - Interactive demo preview */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							duration: 0.8,
							delay: 0.3,
							ease: [0.22, 1, 0.36, 1] as const,
						}}
					>
						<div className="relative w-full max-w-2xl mx-auto group">
							{/* Enhanced glow effect */}
							<motion.div
								className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50"
								animate={{
									opacity: [0.3, 0.5, 0.3],
								}}
								transition={{
									duration: 3,
									repeat: Number.POSITIVE_INFINITY,
									ease: "easeInOut",
								}}
							/>

							{/* Main demo container */}
							<motion.div
								className="relative overflow-hidden rounded-2xl border border-white/60 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl"
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.3 }}
							>
								{/* Browser header */}
								<div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
									<div className="flex gap-2">
										<div className="w-3 h-3 rounded-full bg-red-500/80" />
										<div className="w-3 h-3 rounded-full bg-yellow-500/80" />
										<div className="w-3 h-3 rounded-full bg-green-500/80" />
									</div>
									<div className="flex items-center gap-2 flex-1 justify-center">
										<FileText className="h-4 w-4 text-gray-500" />
										<span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
											My Amazing Essay.docx
										</span>
									</div>
									{/* Beta badge - conditionally shown */}
									{config.isInBeta && (
										<motion.div
											className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold"
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											transition={{
												delay: 0.8,
												type: "spring",
												stiffness: 200,
											}}
										>
											BETA
										</motion.div>
									)}
								</div>

								{/* Simplified demo content */}
								<div className="p-8">
									{/* Clean AI writing simulation */}
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5 }}
										className="space-y-6"
									>
										{/* Writing area with gradient highlight */}
										<motion.div
											className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-500/30"
											animate={{
												boxShadow: [
													"0 0 0 0 rgba(168, 85, 247, 0)",
													"0 0 20px 0 rgba(168, 85, 247, 0.15)",
													"0 0 0 0 rgba(168, 85, 247, 0)",
												],
											}}
											transition={{
												duration: 3,
												repeat: Number.POSITIVE_INFINITY,
											}}
										>
											<p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed min-h-[28px]">
												{displayedText}
												<motion.span
													className="inline-block w-0.5 h-5 bg-purple-500 ml-1"
													animate={{
														opacity: [1, 0, 1],
													}}
													transition={{
														duration: 0.8,
														repeat: Number.POSITIVE_INFINITY,
													}}
												/>
											</p>
										</motion.div>

										{/* Simple action buttons - waitlist if beta, auth otherwise */}
										<div className="flex flex-wrap gap-2">
											{[
												"Continue",
												"Improve",
												"Shorten",
											].map((action, i) => (
												<motion.div
													key={action}
													initial={{
														opacity: 0,
														scale: 0.9,
													}}
													animate={{
														opacity: 1,
														scale: 1,
													}}
													transition={{
														delay: 0.7 + i * 0.1,
													}}
												>
													<BetaCTA>
														<motion.button
															className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
															whileHover={{
																scale: 1.05,
															}}
															whileTap={{
																scale: 0.95,
															}}
															type="button"
														>
															{action}
														</motion.button>
													</BetaCTA>
												</motion.div>
											))}
										</div>
									</motion.div>
								</div>
							</motion.div>

							{/* Floating elements */}
							<motion.div
								className="absolute -top-4 -right-4 w-20 h-20 bg-purple-400/30 rounded-full blur-xl"
								animate={{
									scale: [1, 1.2, 1],
									opacity: [0.3, 0.5, 0.3],
								}}
								transition={{
									duration: 3,
									repeat: Number.POSITIVE_INFINITY,
								}}
							/>
							<motion.div
								className="absolute -bottom-4 -left-4 w-24 h-24 bg-pink-400/30 rounded-full blur-xl"
								animate={{
									scale: [1, 1.3, 1],
									opacity: [0.3, 0.5, 0.3],
								}}
								transition={{
									duration: 4,
									repeat: Number.POSITIVE_INFINITY,
									delay: 0.5,
								}}
							/>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Scroll indicator */}
			{/* <motion.div
				className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.5, duration: 0.6 }}
			>
				<motion.div
					className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400"
					animate={{ y: [0, 10, 0] }}
					transition={{
						duration: 2,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				>
					<span className="text-xs font-medium">Scroll to explore</span>
					<div className="w-6 h-10 rounded-full border-2 border-gray-400 dark:border-gray-600 flex items-start justify-center p-2">
						<motion.div
							className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600"
							animate={{ y: [0, 12, 0] }}
							transition={{
								duration: 1.5,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>
					</div>
				</motion.div>
			</motion.div> */}

			{/* Background noise texture */}
			<style jsx>{`
				.bg-noise {
					background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E");
				}
			`}</style>
		</section>
	);
}
