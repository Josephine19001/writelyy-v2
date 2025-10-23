"use client";

import { useQuery } from "@tanstack/react-query";
import { orpcClient } from "@shared/lib/orpc-client";
import { Progress } from "@ui/components/progress";
import Link from "next/link";

export function CreditProgress() {
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

	if (!creditsData) {
		return null;
	}

	const { available, total, used, percentageUsed, planId } = creditsData;
	const isPro = planId === "pro";

	// Color based on usage (inverted - lower usage = more green)
	const getProgressColor = () => {
		if (percentageUsed >= 95) return "bg-red-500";
		if (percentageUsed >= 80) return "bg-yellow-500";
		return "bg-green-500";
	};

	return (
		<Link href="/app/settings/billing" className="block">
			<div className="px-3 py-2 mb-2 mx-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
				<div className="flex items-center justify-between mb-1.5">
					<div className="flex items-center gap-1.5">
						{/* <Zap className="h-3.5 w-3.5 text-primary" /> */}
						<span className="text-xs font-medium text-foreground">
							Credits
						</span>
					</div>
					<span className="text-[10px] font-semibold text-muted-foreground uppercase">
						{isPro ? "PRO" : "FREE"}
					</span>
				</div>
				<Progress
					value={percentageUsed}
					className="h-1.5 mb-1"
					indicatorClassName={getProgressColor()}
				/>
				<div className="text-[10px] text-muted-foreground">
					{available.toLocaleString()} of {total.toLocaleString()}{" "}
					remaining ({used.toLocaleString()} used)
				</div>
			</div>
		</Link>
	);
}
