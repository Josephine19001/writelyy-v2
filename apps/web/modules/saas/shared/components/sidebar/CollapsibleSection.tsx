"use client";

import { Button } from "@ui/components/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, type ReactNode } from "react";

interface CollapsibleSectionProps {
	title: string;
	children: ReactNode;
	defaultOpen?: boolean;
}

export function CollapsibleSection({
	title,
	children,
	defaultOpen = false,
}: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="border-t">
			<Button
				variant="ghost"
				className="w-full justify-between h-auto p-3 font-medium text-sm"
				onClick={() => setIsOpen(!isOpen)}
			>
				<span>{title}</span>
				{isOpen ? (
					<ChevronDown className="h-4 w-4" />
				) : (
					<ChevronRight className="h-4 w-4" />
				)}
			</Button>
			{isOpen && <div className="px-3 pb-3">{children}</div>}
		</div>
	);
}
