"use client";

import { orpcClient } from "@shared/lib/orpc-client";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import { AlertTriangle, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CreditWarningBanner() {
	const [dismissed, setDismissed] = useState(false);

	const { data: creditsData } = useQuery({
		queryKey: ["user-credits"],
		queryFn: () => orpcClient.users.getCredits({}),
		refetchInterval: 30000, // Refresh every 30 seconds
		retry: (failureCount, error: any) => {
			if (error?.message === "Unauthorized") {
				return false;
			}
			return failureCount < 3;
		},
		throwOnError: false,
	});

	// Reset dismissed state when credits change significantly
	useEffect(() => {
		if (creditsData && creditsData.percentageUsed < 80) {
			setDismissed(false);
		}
	}, [creditsData]);

	if (!creditsData || dismissed) {
		return null;
	}

	const { available, total, percentageUsed, planId } = creditsData;
	const isPro = planId === "pro";

	// Show warning when credits are running low
	const showWarning = percentageUsed >= 80;
	const isCritical = percentageUsed >= 95;
	const isOutOfCredits = available === 0;

	if (!showWarning) {
		return null;
	}

	return (
		<Alert
			variant={isCritical ? "error" : "default"}
			className={`mb-4 ${
				isCritical
					? "border-red-500 bg-red-50 dark:bg-red-950/20"
					: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
			}`}
		>
			<div className="flex items-start gap-3">
				{isCritical ? (
					<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
				) : (
					<Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
				)}
				<div className="flex-1">
					<AlertTitle className="text-sm font-semibold mb-1">
						{isOutOfCredits
							? "Out of AI Credits!"
							: isCritical
								? "AI Credits Almost Depleted"
								: "AI Credits Running Low"}
					</AlertTitle>
					<AlertDescription className="text-xs">
						{isOutOfCredits ? (
							<>
								You've used all {total.toLocaleString()} of your
								monthly AI credits.{" "}
								{isPro
									? "Your credits will reset on the 1st of next month."
									: "Upgrade to Pro for 100x more credits or wait for the monthly reset."}
							</>
						) : (
							<>
								You've used {percentageUsed}% of your AI credits
								({available.toLocaleString()} remaining).{" "}
								{!isPro &&
									"Upgrade to Pro for 100,000 credits per month."}
							</>
						)}
					</AlertDescription>
					<div className="flex gap-2 mt-3">
						{!isPro && (
							<Button asChild size="sm" className="h-7 text-xs">
								<Link href="/app/settings/billing">
									Upgrade to Pro
								</Link>
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs"
							onClick={() => setDismissed(true)}
						>
							Dismiss
						</Button>
					</div>
				</div>
			</div>
		</Alert>
	);
}
