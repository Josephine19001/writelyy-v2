"use client";
import { PricingTable } from "@saas/payments/components/PricingTable";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export function PricingSection() {
	const t = useTranslations();
	const [isVisible, setIsVisible] = useState(false);
	const ref = useRef<HTMLElement>(null);

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

	return (
		<section
			ref={ref}
			id="pricing"
			className="scroll-mt-16 mt-20 py-12 lg:py-16"
		>
			<div className="container mx-auto max-w-screen-xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={
						isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
					}
					transition={{ duration: 0.6 }}
					className="mb-12 text-center"
				>
					<h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
						Pricing
					</h2>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={
						isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
					}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="rounded-3xl bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 p-6 lg:p-12"
				>
					<PricingTable />
				</motion.div>
			</div>
		</section>
	);
}
