import { FaqSection } from "@marketing/home/components/FaqSection";
import { Features } from "@marketing/home/components/Features";
import { Hero } from "@marketing/home/components/Hero";
import { PricingSection } from "@marketing/home/components/PricingSection";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
	title: "Writely - AI-Powered Writing Assistant | Write at the Speed of AI",
	description: "Transform your ideas into polished documents with Writely's AI-powered writing assistant. Features include AI content generation, smart snippets, source management, and collaborative editing. No more blank page syndrome.",
	keywords: [
		"AI writing assistant",
		"AI content generator",
		"writing software",
		"document editor",
		"AI writing tool",
		"content creation",
		"writing app",
		"AI text generator",
		"smart writing",
		"collaborative writing",
		"document management",
		"AI editor",
		"writing productivity",
		"content writing tool",
		"AI copywriting",
	],
	authors: [{ name: "Writely" }],
	creator: "Writely",
	publisher: "Writely",
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://writely.ai"),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		title: "Writely - AI-Powered Writing Assistant",
		description: "Transform your ideas into polished documents with AI-powered writing assistance. No more blank page syndrome.",
		siteName: "Writely",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Writely - AI-Powered Writing Assistant",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Writely - AI-Powered Writing Assistant",
		description: "Transform your ideas into polished documents with AI-powered writing assistance. No more blank page syndrome.",
		images: ["/og-image.png"],
		creator: "@loplyyai",
		site: "@loplyyai",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
	},
};

export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	return (
		<>
			<Hero />
			<Features />
			<PricingSection />
			<FaqSection />
		</>
	);
}
