"use client";

import { Button } from "@ui/components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@ui/components/select";
import { Textarea } from "@ui/components/textarea";
import {
	ArrowRightIcon,
	FileText,
	RefreshCw,
	Search,
	Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Product = "humanizer" | "detector" | "summariser" | "paraphraser";

const PRODUCT_CONFIGS = {
	humanizer: {
		icon: Sparkles,
		name: "AI Humanizer",
		actionLabel: "Humanize Text",
		placeholder: "Paste your AI-generated text here...",
		route: "/app/humanizer",
	},
	detector: {
		icon: Search,
		name: "AI Detector",
		actionLabel: "Detect AI Content",
		placeholder: "Paste the text you want to analyze for AI detection...",
		route: "/app/detector",
	},
	summariser: {
		icon: FileText,
		name: "Summarizer",
		actionLabel: "Summarize Text",
		placeholder: "Paste your text here to generate a summary...",
		route: "/app/summariser",
	},
	paraphraser: {
		icon: RefreshCw,
		name: "Paraphraser",
		actionLabel: "Paraphrase Text",
		placeholder: "Paste your text here to rephrase and rewrite it...",
		route: "/app/paraphraser",
	},
} as const;

const MIN_WORDS = 30;

export function HeroTryComponent() {
	const [text, setText] = useState("");
	const [selectedProduct, setSelectedProduct] =
		useState<Product>("humanizer");
	const router = useRouter();

	const wordCount = text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
	const isTextValid = wordCount >= MIN_WORDS;

	const currentConfig = PRODUCT_CONFIGS[selectedProduct];
	const Icon = currentConfig.icon;

	const handleTryNow = () => {
		if (!isTextValid) return;

		// Save content and selected product to localStorage
		const trialData = {
			content: text,
			product: selectedProduct,
			timestamp: Date.now(),
			wordCount: wordCount,
		};

		localStorage.setItem("writelyy_trial_data", JSON.stringify(trialData));

		// Navigate to signup with redirect url
		const redirectTo = encodeURIComponent(currentConfig.route);
		router.push(`/auth/signup?redirectTo=${redirectTo}&trial=true`);
	};

	return (
		<div className="mx-auto mt-8 max-w-5xl">
			{/* Text Input Container */}
			<div className="relative">
				{/* Top Header Row */}
				<div className="absolute top-6 left-3 right-3 flex justify-between items-center z-10 px-3">
					{/* Title - Left Side */}
					<h3 className="text-lg font-semibold text-foreground">
						Try it out
					</h3>

					{/* Product Selection Dropdown - Right Side */}
					<Select
						value={selectedProduct}
						onValueChange={(value: Product) =>
							setSelectedProduct(value)
						}
					>
						<SelectTrigger className="w-48 h-8 text-xs rounded-xl">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="humanizer">
								<div className="flex items-center gap-2">
									<Sparkles className="w-3 h-3" />
									{PRODUCT_CONFIGS.humanizer.name}
								</div>
							</SelectItem>
							<SelectItem value="detector">
								<div className="flex items-center gap-2">
									<Search className="w-3 h-3" />
									{PRODUCT_CONFIGS.detector.name}
								</div>
							</SelectItem>
							<SelectItem value="summariser">
								<div className="flex items-center gap-2">
									<FileText className="w-3 h-3" />
									{PRODUCT_CONFIGS.summariser.name}
								</div>
							</SelectItem>
							<SelectItem value="paraphraser">
								<div className="flex items-center gap-2">
									<RefreshCw className="w-3 h-3" />
									{PRODUCT_CONFIGS.paraphraser.name}
								</div>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Text Area */}
				<Textarea
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="Paste your content here..."
					rows={12}
					className="resize-none pt-16 pb-20 px-6 text-base rounded-3xl"
				/>

				{/* Bottom Controls */}
				<div className="absolute bottom-6 left-3 right-3 flex justify-between items-center px-3">
					{/* Word Count - Bottom Left */}
					<div className="text-sm text-foreground/60">
						<span>{wordCount}/1000 words</span>
					</div>

					{/* Action Button - Bottom Right */}
					<Button
						onClick={handleTryNow}
						disabled={!isTextValid}
						size="sm"
						className="h-10 px-4 text-sm font-medium rounded-xl"
					>
						<Icon className="mr-2 w-4 h-4" />
						{currentConfig.name}
						<ArrowRightIcon className="ml-2 w-3 h-3" />
					</Button>
				</div>
			</div>
		</div>
	);
}
