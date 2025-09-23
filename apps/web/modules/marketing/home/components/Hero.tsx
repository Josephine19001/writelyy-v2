import Image from "next/image";
import heroImage from "../../../../public/images/hero-image.png";
import heroImageDark from "../../../../public/images/hero-image-dark.png";
import { Button } from "@ui/components/button";

export function Hero() {
	return (
		<div className="relative max-w-full overflow-x-hidden bg-linear-to-b from-0% from-card to-[50vh] to-background">
			<div className="absolute left-1/2 z-10 ml-[-500px] h-[500px] w-[1000px] rounded-full bg-linear-to-r from-primary to-bg opacity-20 blur-[150px]" />
			<div className="container relative z-20 pt-32 pb-12 text-center lg:pb-16">
				{/* <div className="mb-4 flex justify-start">
					<div className="mx-auto flex flex-wrap items-start justify-start rounded-full border border-highlight/30 p-px px-4 py-1 font-normal text-highlight text-sm">
						<span className="flex items-center gap-2 rounded-full font-semibold text-highlight">
							<span className="size-2 rounded-full bg-highlight" />
							Early Access
						</span>
					</div>
				</div> */}

				<h1 className="mx-auto text-balance font-semi-bold text-3xl mb-8">
					Writing made easier with AI
				</h1>
				<div className="flex justify-center">
					<Button>Start writing</Button>
				</div>

				<div className="mx-auto mt-8  rounded-2xl border bg-card/50 p-2 shadow-lg dark:shadow-foreground/10">
					<Image
						src={heroImage}
						alt="Our application"
						className="block rounded-xl dark:hidden"
						priority
					/>
					<Image
						src={heroImageDark}
						alt="Our application"
						className="hidden rounded-xl dark:block"
						priority
					/>
				</div>
			</div>
		</div>
	);
}
