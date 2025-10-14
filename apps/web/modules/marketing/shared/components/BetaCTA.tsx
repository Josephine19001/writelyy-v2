"use client";

import { config } from "@repo/config";
import { WaitlistDialog } from "@marketing/home/components/WaitlistDialog";
import type { ReactNode } from "react";

interface BetaCTAProps {
	children: ReactNode;
	href?: string;
}

/**
 * Centralized CTA component that handles beta vs production behavior
 * - If isInBeta: Opens waitlist dialog
 * - If not in beta: Links to auth or custom href
 */
export function BetaCTA({ children, href = "/auth/sign-in" }: BetaCTAProps) {
	if (config.isInBeta) {
		return <WaitlistDialog>{children}</WaitlistDialog>;
	}

	return <a href={href}>{children}</a>;
}
