import { cn } from "@ui/lib";
import { useTranslations } from "next-intl";

export function FaqSection({ className }: { className?: string }) {
	const t = useTranslations();

	const items = [
		{
			question: "How is this different from Google Docs?",
			answer: "AI is built-in. No switching between tools for writing help.",
		},
		{
			question: "When is it ready?",
			answer: "Soon! Join early access to get notified.",
		},
		{
			question: "Is it hard to learn?",
			answer: "Nope. Feels just like Google Docs.",
		},
		{
			question: "Can I import my docs?",
			answer: "Yes. Works with Google Docs, Word, and more.",
		},
	];

	if (!items) {
		return null;
	}

	return (
		<section
			className={cn("scroll-mt-20 border-t py-12 lg:py-16", className)}
			id="faq"
		>
			<div className="container max-w-5xl">
				<div className="mb-12 text-center">
					<h1 className="mb-2 font-bold text-4xl lg:text-5xl">
						Quick questions
					</h1>
					<p className="text-lg opacity-50">The basics, no fluff</p>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{items.map((item, i) => (
						<div
							key={`faq-item-${i}`}
							className="rounded-lg bg-card border p-4 lg:p-6"
						>
							<h4 className="mb-2 font-semibold text-lg">
								{item.question}
							</h4>
							<p className="text-foreground/60">{item.answer}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
