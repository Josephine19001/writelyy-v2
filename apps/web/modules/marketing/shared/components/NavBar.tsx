"use client";

import { LocaleLink, useLocalePathname } from "@i18n/routing";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { WaitlistDialog } from "@marketing/home/components/WaitlistDialog";
import { ColorModeToggle } from "@shared/components/ColorModeToggle";
import { LocaleSwitch } from "@shared/components/LocaleSwitch";
import { Logo } from "@shared/components/Logo";
import { Button } from "@ui/components/button";
// import {
// 	DropdownMenu,
// 	DropdownMenuContent,
// 	DropdownMenuItem,
// 	DropdownMenuTrigger,
// } from "@ui/components/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@ui/components/sheet";
import { cn } from "@ui/lib";
import {
	MenuIcon,
} from "lucide-react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

export function NavBar() {
	const t = useTranslations();
	const { user } = useSession();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const localePathname = useLocalePathname();
	const [isTop, setIsTop] = useState(true);

	const debouncedScrollHandler = useDebounceCallback(
		() => {
			setIsTop(window.scrollY <= 10);
		},
		150,
		{
			maxWait: 150,
		},
	);

	useEffect(() => {
		window.addEventListener("scroll", debouncedScrollHandler);
		debouncedScrollHandler();
		return () => {
			window.removeEventListener("scroll", debouncedScrollHandler);
		};
	}, [debouncedScrollHandler]);

	useEffect(() => {
		setMobileMenuOpen(false);
	}, [localePathname]);

	const isDocsPage = localePathname.startsWith("/docs");

	const menuItems: {
		label: string;
		href: string;
	}[] = [
		{
			label: "Pricing",
			href: "/#pricing",
		},
		{
			label: "Contact",
			href: "/contact",
		},
	];

	const isMenuItemActive = (href: string) => localePathname.startsWith(href);

	return (
		<nav
			className={cn(
				"fixed top-0 left-0 z-50 w-full transition-shadow duration-200",
				!isTop || isDocsPage
					? "bg-card/80 shadow-sm backdrop-blur-lg"
					: "shadow-none",
			)}
			data-test="navigation"
		>
			<div className="container">
				<div
					className={cn(
						"flex items-center justify-stretch gap-6 transition-[padding] duration-200",
						!isTop || isDocsPage ? "py-4" : "py-6",
					)}
				>
					<div className="flex flex-1 justify-start">
						<LocaleLink
							href="/"
							className="block hover:no-underline active:no-underline"
						>
							<Logo
								textClassName={
									isTop && !isDocsPage
										? "text-gray-900 dark:text-white"
										: "text-foreground"
								}
							/>
						</LocaleLink>
					</div>

					{/* <div className="hidden flex-1 items-center justify-center lg:flex">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className={cn(
										"px-3 py-2 font-medium text-sm transition-colors h-auto gap-1",
										isTop && !isDocsPage
											? "text-white/90 hover:text-white"
											: "text-foreground/80 hover:text-foreground",
									)}
								>
									Product
									<ChevronDownIcon className="h-3 w-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="center"
								className="w-80"
							>
								{productTools.map((tool) => (
									<DropdownMenuItem
										key={tool.href}
										asChild
										className="p-0"
									>
										<LocaleLink
											href={tool.href}
											className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors"
										>
											<div className="flex-shrink-0">
												<tool.icon className="h-5 w-5 text-primary" />
											</div>
											<div className="flex-1">
												<div className="font-medium text-sm">
													{tool.label}
												</div>
												<div className="text-xs text-muted-foreground">
													{tool.description}
												</div>
											</div>
										</LocaleLink>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{menuItems.map((menuItem) => (
							<LocaleLink
								key={menuItem.href}
								href={menuItem.href}
								className={cn(
									"block px-3 py-2 font-medium text-sm transition-colors",
									isTop && !isDocsPage
										? "text-white/90 hover:text-white"
										: "text-foreground/80 hover:text-foreground",
									isMenuItemActive(menuItem.href)
										? isTop && !isDocsPage
											? "font-bold text-white"
											: "font-bold text-foreground"
										: "",
								)}
								prefetch
							>
								{menuItem.label}
							</LocaleLink>
						))}
					</div> */}

					<div className="flex flex-1 items-center justify-end gap-3">
						<ColorModeToggle
							iconClassName={
								isTop && !isDocsPage
									? "size-4 text-gray-900 dark:text-white"
									: "size-4"
							}
						/>
						{config.i18n.enabled && (
							<Suspense>
								<LocaleSwitch />
							</Suspense>
						)}

						<Sheet
							open={mobileMenuOpen}
							onOpenChange={(open) => setMobileMenuOpen(open)}
						>
							<SheetTrigger asChild>
								<Button
									className={cn(
										"lg:hidden",
										isTop && !isDocsPage &&
											"text-gray-900 dark:text-gray-900",
									)}
									size="icon"
									variant="light"
									aria-label="Menu"
								>
									<MenuIcon className="size-4" />
								</Button>
							</SheetTrigger>
							<SheetContent className="w-[280px]" side="right">
								<SheetTitle />
								<div className="flex flex-col items-start justify-center">
									{menuItems.map((menuItem) => (
										<LocaleLink
											key={menuItem.href}
											href={menuItem.href}
											className={cn(
												"block px-3 py-2 font-medium text-base text-foreground/80",
												isMenuItemActive(menuItem.href)
													? "font-bold text-foreground"
													: "",
											)}
											prefetch
										>
											{menuItem.label}
										</LocaleLink>
									))}

									{user ? (
										<NextLink
											key="dashboard"
											href="/app"
											className="block px-3 py-2 text-base"
										>
											{t("common.menu.dashboard")}
										</NextLink>
									) : (
										<WaitlistDialog>
											<Button className="w-full mt-4 bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-500 hover:from-pink-500 hover:via-fuchsia-600 hover:to-purple-600 text-white shadow-lg">
												Join Waitlist
											</Button>
										</WaitlistDialog>
									)}
								</div>
							</SheetContent>
						</Sheet>

						{config.ui.saas.enabled &&
							(user ? (
								<Button
									key="dashboard"
									className={cn(
										"hidden lg:flex",
										isTop && !isDocsPage
											? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
											: "",
									)}
									asChild
									variant="secondary"
								>
									<NextLink href="/app">
										{t("common.menu.dashboard")}
									</NextLink>
								</Button>
							) : (
								<WaitlistDialog>
									<Button
										key="waitlist"
										className={cn(
											"hidden lg:flex bg-gradient-to-r from-pink-400 via-fuchsia-500 to-purple-500 hover:from-pink-500 hover:via-fuchsia-600 hover:to-purple-600 dark:from-pink-400/90 dark:via-fuchsia-500/90 dark:to-purple-500/90 dark:hover:from-pink-500 dark:hover:via-fuchsia-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105",
										)}
									>
										Join Waitlist
									</Button>
								</WaitlistDialog>
							))}
					</div>
				</div>
			</div>
		</nav>
	);
}
