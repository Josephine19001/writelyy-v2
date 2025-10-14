"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const capabilities = [
	"write essays",
	"draft blog posts",
	"create content",
	"research topics",
	"polish your drafts",
	"improve grammar",
	"add sources",
	"rewrite sections",
];

export function AICapabilities() {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % capabilities.length);
		}, 2500);
		return () => clearInterval(interval);
	}, []);

	return (
		<section className="relative py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900">
			{/* Background gradient orb */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[120px]"
				animate={{
					scale: [1, 1.1, 1],
					opacity: [0.3, 0.5, 0.3],
				}}
				transition={{
					duration: 8,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			/>

			<div className="relative max-w-5xl mx-auto px-6 text-center">
				{/* Icon */}
				<motion.div
					className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-8"
					initial={{ scale: 0, rotate: -180 }}
					whileInView={{ scale: 1, rotate: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
				>
					<Sparkles className="h-8 w-8 text-white" />
				</motion.div>

				{/* Main heading */}
				<motion.h2
					className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-4"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.6 }}
				>
					AI that helps you
				</motion.h2>

				{/* Rotating capabilities */}
				<div className="relative h-20 lg:h-24 flex items-center justify-center mb-8">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentIndex}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -30 }}
							transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
							className="absolute"
						>
							<span className="text-5xl lg:text-6xl xl:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400">
								{capabilities[currentIndex]}
							</span>
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Subtitle */}
				<motion.p
					className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.4, duration: 0.6 }}
				>
					Whatever you need to write, AI is ready to assist—instantly.
				</motion.p>
			</div>
		</section>
	);
}
