"use client";

import { cn } from "@ui/lib";
import {
	DollarSign,
	Globe,
	GraduationCap,
	Lock,
	Minus,
	Plus,
	Shield,
	Sparkles,
	Star,
} from "lucide-react";
import { useState } from "react";

export function FaqSection({ className }: { className?: string }) {
	const [openItems, setOpenItems] = useState<string[]>([]);

	const items = [
		{
			question: "What is Writelyy?",
			icon: Sparkles,
			answer:
				"Writelyy is a smart text editor designed for writers who want to work smarter, not harder. Write documents, manage snippets, organize sources, and get AI help—all in one place.",
		},
		{
			question: "How do snippets work?",
			icon: Star,
			answer:
				"Snippets are reusable text blocks you can save and insert anywhere. Perfect for email templates, code blocks, common phrases, or anything you type repeatedly. Just create once, use forever.",
		},
		{
			question: "What are sources for?",
			icon: Shield,
			answer:
				"Sources let you save and organize reference materials—links, quotes, research notes. Keep everything you need in one place while you write. No more tab overload.",
		},
		{
			question: "How does the AI help?",
			icon: Sparkles,
			answer:
				"Built-in AI tools help you write better: humanize AI text, detect AI content, summarize long docs, or paraphrase sentences. It's like having a writing assistant that actually gets it.",
		},
		{
			question: "Can I work on multiple documents?",
			icon: GraduationCap,
			answer:
				"Yep! Writelyy has tabs, just like your browser. Switch between documents without losing your flow. Perfect for research papers, blog posts, or juggling multiple projects.",
		},
		{
			question: "Do I need to install anything?",
			icon: Globe,
			answer:
				"Nope. Writelyy runs in your browser. Sign up, start writing. Works on Mac, Windows, or whatever you've got.",
		},
		{
			question: "Is my data private?",
			icon: Lock,
			answer:
				"100%. Your docs, snippets, and sources are yours. We don't sell data or train AI models on your content. What you write stays yours.",
		},
		{
			question: "How much does it cost?",
			icon: DollarSign,
			answer:
				"We have a free plan to get started, plus paid plans with more features and AI credits. Check out our pricing page for details. No hidden fees.",
		},
	];

	if (!items) {
		return null;
	}

	const handleValueChange = (value: string) => {
		setOpenItems(value ? [value] : []);
	};

	const isOpen = (value: string) => openItems.includes(value);

	return (
		<section
			className={cn("scroll-mt-20 border-t py-12 lg:py-16", className)}
			id="faq"
		>
			<div className="container max-w-4xl">
				<div className="mb-12 lg:text-center">
					<h1 className="mb-2 font-bold text-4xl lg:text-5xl">
						Questions? We've got answers
					</h1>
					<p className="text-lg opacity-50">
						Everything you need to know about Writelyy
					</p>
				</div>
				<div className="space-y-3">
					{items.map((item, i) => {
						const value = `item-${i}`;
						const itemIsOpen = isOpen(value);
						const Icon = item.icon;

						return (
							<div
								key={`faq-item-${i}`}
								className="rounded-2xl bg-muted/50 border border-border/50 overflow-hidden"
							>
								<button
									type="button"
									onClick={() =>
										handleValueChange(
											itemIsOpen ? "" : value,
										)
									}
									className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
								>
									<div className="flex items-center gap-4 pr-4">
										<Icon className="size-5 text-primary flex-shrink-0" />
										<span className="font-medium text-lg">
											{item.question}
										</span>
									</div>
									{itemIsOpen ? (
										<Minus className="size-5 text-muted-foreground flex-shrink-0" />
									) : (
										<Plus className="size-5 text-muted-foreground flex-shrink-0" />
									)}
								</button>
								{itemIsOpen && (
									<div className="px-6 pb-6 pl-[4.5rem]">
										<p className="text-muted-foreground leading-relaxed">
											{item.answer}
										</p>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
