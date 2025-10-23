import type { config } from "@repo/config";
import type { ReactNode } from "react";

type ProductReferenceId = keyof (typeof config)["payments"]["plans"];

export function usePlanData() {
	const planData: Record<
		ProductReferenceId,
		{
			title: string;
			description: ReactNode;
			features: ReactNode[];
		}
	> = {
		free: {
			title: "Free",
			description: "Perfect for getting started with AI-powered writing",
			features: [
				"5,000 AI credits per month",
				"All core writing features",
				"Limited Snippets & sources",
				"Basic AI assistance",
				"Community support",
				// "$1 = 1,000 credits (add-ons)",
			],
		},
		pro: {
			title: "Pro",
			description: "Unlimited AI writing power for professionals",
			features: [
				"100,000 AI credits per month",
				"All core writing features",
				"Unlimited snippets & sources",
				"Advanced AI assistance",
				"Priority support",
				"No Writelyy watermarks in exports",
				// "Document collaboration",
				// "$1 = 1,500 credits (25% discount)",
			],
		},
		// enterprise: {
		// 	title: "Enterprise",
		// 	description: "Custom plan tailored to your requirements",
		// 	features: ["Unlimited projects", "Enterprise support"],
		// },
		// lifetime: {
		// 	title: t("pricing.products.lifetime.title"),
		// 	description: t("pricing.products.lifetime.description"),
		// 	features: [
		// 		t("pricing.products.lifetime.features.noRecurringCosts"),
		// 		t("pricing.products.lifetime.features.extendSupport"),
		// 	],
		// },
	};

	return { planData };
}
