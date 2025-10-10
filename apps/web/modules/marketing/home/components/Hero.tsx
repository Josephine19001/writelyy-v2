"use client";

import { Button } from "@ui/components/button";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const placeholderTexts = [
	"Write about importance of AI",
	"Explore the topic on AI replacing jobs using these sources...",
	"Reuse this snippet to expand on...",
	"Draft a blog post about climate change",
	"Summarize this article in 3 paragraphs",
];

export function Hero() {
	const [currentText, setCurrentText] = useState("");
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [selectedType, setSelectedType] = useState<
		"Essay" | "Blog Post" | "Article"
	>("Essay");
	const heroRef = useRef<HTMLDivElement>(null);

	// Typing animation effect
	useEffect(() => {
		const targetText = placeholderTexts[currentIndex];
		const timeout = setTimeout(
			() => {
				if (!isDeleting) {
					if (currentText.length < targetText.length) {
						setCurrentText(
							targetText.slice(0, currentText.length + 1),
						);
					} else {
						setTimeout(() => setIsDeleting(true), 2000);
					}
				} else {
					if (currentText.length > 0) {
						setCurrentText(currentText.slice(0, -1));
					} else {
						setIsDeleting(false);
						setCurrentIndex(
							(prev) => (prev + 1) % placeholderTexts.length,
						);
					}
				}
			},
			isDeleting ? 50 : 100,
		);

		return () => clearTimeout(timeout);
	}, [currentText, currentIndex, isDeleting]);

	// Intersection observer for entrance animation
	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<section className="relative min-h-[100vh] overflow-hidden flex items-center justify-center py-20 lg:py-32">
			{/* Futuristic gradient background - inspired by modern mesh gradients */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
				{/* Animated gradient mesh overlay */}
				<div className="absolute inset-0 opacity-80">
					<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-400/40 via-purple-500/40 to-blue-500/40 animate-gradient-shift" />
					<div className="absolute inset-0 bg-gradient-to-tl from-blue-400/30 via-pink-400/30 to-purple-400/30 animate-gradient-shift-reverse" />
				</div>

				{/* Floating gradient orbs */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/50 to-purple-600/50 rounded-full blur-3xl animate-float-slow" />
					<div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/40 to-purple-500/40 rounded-full blur-3xl animate-float-slower" />
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse-slow" />
				</div>

				{/* Grain texture overlay for depth */}
				<div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-noise" />
			</div>

			<div
				ref={heroRef}
				className="mx-auto max-w-screen-xl px-6 lg:px-12 relative z-10"
			>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
					{/* Left side - Text content with animations */}
					<div
						className={`transition-all duration-1000 ${
							isVisible
								? "opacity-100 translate-x-0"
								: "opacity-0 -translate-x-8"
						}`}
					>
						<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-sm px-4 py-2 shadow-lg">
							<Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
							<span className="text-sm font-medium text-gray-700">
								AI-Powered Writing
							</span>
						</div>

						<h1 className="mb-6 font-bold text-5xl leading-tight text-gray-900 lg:text-6xl xl:text-7xl">
							Write at the
							<span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
								{" "}
								speed of AI
							</span>
						</h1>

						<p className="max-w-xl text-lg text-gray-700 lg:text-xl mb-8 leading-relaxed">
							Transform your ideas into polished documents with
							AI-powered writing assistance. No more blank page
							syndrome.
						</p>

						<div className="flex flex-wrap gap-4">
							<Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
								Get Started Free
							</Button>
							<Button
								variant="outline"
								className="px-8 py-6 text-lg rounded-xl border-2 border-gray-300 hover:border-purple-600 hover:bg-white/80 transition-all duration-300"
							>
								Watch Demo
							</Button>
						</div>
					</div>

					{/* Right side - Editor Mockup with animations */}
					<div
						className={`transition-all duration-1000 delay-300 ${
							isVisible
								? "opacity-100 translate-x-0"
								: "opacity-0 translate-x-8"
						}`}
					>
						<div className="relative w-full max-w-2xl mx-auto group">
							{/* Floating animation wrapper */}
							<div className="animate-float">
								{/* Glow effect */}
								<div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000" />

								{/* Main editor container */}
								<div className="relative overflow-hidden rounded-2xl border-2 border-white/60 bg-white/90 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
									{/* Browser-style header */}
									<div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-white">
										<div className="flex gap-2">
											<div className="w-3.5 h-3.5 rounded-full bg-red-400/80 hover:bg-red-500 transition cursor-pointer" />
											<div className="w-3.5 h-3.5 rounded-full bg-yellow-400/80 hover:bg-yellow-500 transition cursor-pointer" />
											<div className="w-3.5 h-3.5 rounded-full bg-green-400/80 hover:bg-green-500 transition cursor-pointer" />
										</div>
										<div className="text-sm text-gray-600 text-center flex-1 font-medium">
											Untitled Document
										</div>
									</div>

									{/* Editor content */}
									<div className="p-8 min-h-[400px] bg-white">
										{/* Document Type Tabs */}
										<div className="flex items-center gap-2 mb-6">
											{(
												[
													"Essay",
													"Blog Post",
													"Article",
												] as const
											).map((type) => (
												<button
													key={type}
													type="button"
													onClick={() =>
														setSelectedType(type)
													}
													className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
														selectedType === type
															? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
															: "text-gray-600 hover:bg-gray-100"
													}`}
												>
													{type}
												</button>
											))}
										</div>

										{/* Typing area with animation */}
										<div className="space-y-3">
											<div className="min-h-[200px]">
												<p className="font-mono text-gray-700 text-base leading-relaxed">
													{currentText}
													<span className="inline-block w-0.5 h-5 bg-purple-600 animate-pulse ml-0.5" />
												</p>
											</div>

											{/* Generate button inside editor */}
											<div className="pt-4 border-t border-gray-200">
												<Button className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group">
													<Sparkles className="h-5 w-5 group-hover:animate-spin" />
													<span>
														Generate with AI
													</span>
												</Button>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Decorative floating elements */}
							<div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-400/20 rounded-full blur-xl animate-pulse" />
							<div className="absolute -bottom-4 -left-4 w-24 h-24 bg-pink-400/20 rounded-full blur-xl animate-pulse delay-500" />
						</div>
					</div>
				</div>
			</div>

			{/* Add custom animations to global styles */}
			<style jsx>{`
				@keyframes float {
					0%,
					100% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-10px);
					}
				}

				@keyframes float-slow {
					0%,
					100% {
						transform: translate(0, 0);
					}
					33% {
						transform: translate(30px, -30px);
					}
					66% {
						transform: translate(-20px, 20px);
					}
				}

				@keyframes float-slower {
					0%,
					100% {
						transform: translate(0, 0);
					}
					50% {
						transform: translate(-40px, 40px);
					}
				}

				@keyframes gradient-shift {
					0%,
					100% {
						transform: translate(0, 0) scale(1);
					}
					50% {
						transform: translate(5%, 5%) scale(1.1);
					}
				}

				@keyframes gradient-shift-reverse {
					0%,
					100% {
						transform: translate(0, 0) scale(1);
					}
					50% {
						transform: translate(-5%, -5%) scale(1.05);
					}
				}

				@keyframes pulse-slow {
					0%,
					100% {
						opacity: 0.3;
						transform: translate(-50%, -50%) scale(1);
					}
					50% {
						opacity: 0.5;
						transform: translate(-50%, -50%) scale(1.1);
					}
				}

				.animate-float {
					animation: float 3s ease-in-out infinite;
				}

				.animate-float-slow {
					animation: float-slow 20s ease-in-out infinite;
				}

				.animate-float-slower {
					animation: float-slower 25s ease-in-out infinite;
				}

				.animate-gradient-shift {
					animation: gradient-shift 15s ease-in-out infinite;
				}

				.animate-gradient-shift-reverse {
					animation: gradient-shift-reverse 20s ease-in-out infinite;
				}

				.animate-pulse-slow {
					animation: pulse-slow 8s ease-in-out infinite;
				}

				/* Grain texture pattern */
				.bg-noise {
					background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E");
				}
			`}</style>
		</section>
	);
}
