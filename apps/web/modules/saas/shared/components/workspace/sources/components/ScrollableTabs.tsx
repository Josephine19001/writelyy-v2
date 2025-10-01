"use client";

import { Button } from "@ui/components/button";
import { cn } from "@ui/lib";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface TabItem {
	key: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface ScrollableTabsProps {
	tabs: TabItem[];
	activeTab: string;
	onTabChange: (tabKey: string) => void;
	maxVisibleTabs?: number;
}

export function ScrollableTabs({
	tabs,
	activeTab,
	onTabChange,
	maxVisibleTabs = 4,
}: ScrollableTabsProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [useScrollable, setUseScrollable] = useState(false);

	useEffect(() => {
		setUseScrollable(tabs.length > maxVisibleTabs);
	}, [tabs.length, maxVisibleTabs]);

	const checkScrollButtons = () => {
		if (!scrollRef.current || !useScrollable) return;

		const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
	};

	useEffect(() => {
		checkScrollButtons();
		const scrollElement = scrollRef.current;
		if (scrollElement) {
			scrollElement.addEventListener("scroll", checkScrollButtons);
			return () => scrollElement.removeEventListener("scroll", checkScrollButtons);
		}
	}, [useScrollable]);

	const scroll = (direction: "left" | "right") => {
		if (!scrollRef.current) return;
		
		const scrollAmount = 120;
		const newScrollLeft = scrollRef.current.scrollLeft + 
			(direction === "right" ? scrollAmount : -scrollAmount);
		
		scrollRef.current.scrollTo({
			left: newScrollLeft,
			behavior: "smooth",
		});
	};

	if (!useScrollable) {
		// Use grid layout for few tabs
		return (
			<div 
				className={cn(
					"grid w-full gap-1 p-1 bg-muted rounded-lg",
					tabs.length <= 4 ? "grid-cols-4" : 
					tabs.length <= 6 ? "grid-cols-3" : 
					"grid-cols-2"
				)}
			>
				{tabs.map((tab) => (
					<Button
						key={tab.key}
						variant={activeTab === tab.key ? "default" : "ghost"}
						size="sm"
						className="text-xs px-2 h-7"
						onClick={() => onTabChange(tab.key)}
					>
						<tab.icon className="h-3 w-3 mr-1" />
						<span className="hidden sm:inline">{tab.label}</span>
						<span className="sm:hidden">{tab.label.slice(0, 3)}</span>
					</Button>
				))}
			</div>
		);
	}

	// Use scrollable layout for many tabs
	return (
		<div className="relative flex items-center bg-muted rounded-lg p-1">
			{canScrollLeft && (
				<Button
					variant="ghost"
					size="sm"
					className="absolute left-1 z-10 h-7 w-6 p-0 bg-muted hover:bg-muted-foreground/10"
					onClick={() => scroll("left")}
				>
					<ChevronLeft className="h-3 w-3" />
				</Button>
			)}
			
			<div
				ref={scrollRef}
				className="flex gap-1 overflow-x-auto scrollbar-hide w-full px-6"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				{tabs.map((tab) => (
					<Button
						key={tab.key}
						variant={activeTab === tab.key ? "default" : "ghost"}
						size="sm"
						className="text-xs px-2 h-7 whitespace-nowrap flex-shrink-0"
						onClick={() => onTabChange(tab.key)}
					>
						<tab.icon className="h-3 w-3 mr-1" />
						{tab.label}
					</Button>
				))}
			</div>

			{canScrollRight && (
				<Button
					variant="ghost"
					size="sm"
					className="absolute right-1 z-10 h-7 w-6 p-0 bg-muted hover:bg-muted-foreground/10"
					onClick={() => scroll("right")}
				>
					<ChevronRight className="h-3 w-3" />
				</Button>
			)}
		</div>
	);
}