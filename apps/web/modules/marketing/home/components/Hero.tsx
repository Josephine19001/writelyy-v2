// import { Button } from "@ui/components/button";
// import { ArrowRightIcon, FileText, Lightbulb, Zap } from "lucide-react";
// import Link from "next/link";
import { HeroTryComponent } from "./HeroTry";

export function Hero() {
	return (
		<div className="relative max-w-full overflow-x-hidden">
			<div className="absolute left-1/2 top-0 z-10 ml-[-500px] h-[500px] w-[1000px] rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-30 blur-[150px]" />

			<div className="container relative z-20 pt-30 pb-2 lg:pt-36 lg:pb-4">
				{/* Main headline */}
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="mb-6 text-balance font-bold text-4xl lg:text-5xl xl:text-6xl">
						Your smart editor for
						<span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
							{" "}
							better writing
						</span>
					</h1>

					{/* CTA Buttons */}
					{/* <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
						<Button size="lg" asChild>
							<Link href="/auth/signup">
								Start writing free
								<ArrowRightIcon className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<Link href="#features">See how it works</Link>
						</Button>
					</div> */}

					{/* Feature Pills */}
					{/* <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
						<div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
							<Zap className="h-4 w-4 text-primary" />
							<span>Built-in AI tools</span>
						</div>
						<div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
							<FileText className="h-4 w-4 text-primary" />
							<span>Reusable snippets</span>
						</div>
						<div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
							<Lightbulb className="h-4 w-4 text-primary" />
							<span>Organized sources</span>
						</div>
					</div> */}
				</div>

				{/* Try Before Signup Component */}
				<HeroTryComponent />
			</div>
		</div>
	);
}
