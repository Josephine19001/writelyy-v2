"use client";

import { Button } from "@ui/components/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";

interface CollapsibleSectionProps {
	title: string;
	children: ReactNode;
	defaultOpen?: boolean;
}

export function CollapsibleSection({
	title,
	children,
	defaultOpen = true,
}: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="mt-4">
			<Button
				variant="ghost"
				className="w-full justify-between h-auto p-3 font-medium text-sm hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent rounded-xl transition-all duration-300"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span className="text-xs text-foreground/70 uppercase tracking-wider font-semibold">
					{title}
				</span>
				{isOpen ? (
					<ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300" />
				) : (
					<ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300" />
				)}
			</Button>
			{isOpen && <div className="px-3 pb-2 pt-1">{children}</div>}
		</div>
	);
}
