"use client";

import { orpcClient } from "@shared/lib/orpc-client";
import { Button } from "@ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ui/components/card";
import { Progress } from "@ui/components/progress";
import { Zap, TrendingUp, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { config } from "@repo/config";

export function CreditsDisplay() {
	const { data: creditsData, isLoading } = useQuery({
		queryKey: ["user-credits"],
		queryFn: () => orpcClient.users.getCredits({}),
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5 text-primary" />
						AI Credits
					</CardTitle>
					<CardDescription>Loading...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (!creditsData) {
		return null;
	}

	const { available, total, used, planId, percentageUsed } = creditsData;
	const planName = planId === "free" ? "Free" : "Pro";
	const isPro = planId === "pro";

	return (
		<Card className="border-2 border-primary/10">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Zap className="h-5 w-5 text-primary" />
					AI Credits
					<span className={`ml-auto text-xs px-2 py-1 rounded-full ${isPro ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-gray-200 dark:bg-gray-700"}`}>
						{planName}
					</span>
				</CardTitle>
				<CardDescription>
					Your monthly AI usage allowance
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Credits Overview */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">Credits Used</span>
						<span className="font-semibold">
							{used.toLocaleString()} / {total.toLocaleString()}
						</span>
					</div>
					<Progress value={percentageUsed} className="h-2" />
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>{percentageUsed}% used</span>
						<span className="flex items-center gap-1">
							<Zap className="h-3 w-3" />
							{available.toLocaleString()} remaining
						</span>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-4">
					<div className="p-3 rounded-lg bg-muted/50">
						<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
							<TrendingUp className="h-3 w-3" />
							This Month
						</div>
						<div className="text-2xl font-bold">
							{used.toLocaleString()}
						</div>
						<div className="text-xs text-muted-foreground">
							credits used
						</div>
					</div>
					<div className="p-3 rounded-lg bg-muted/50">
						<div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
							<Calendar className="h-3 w-3" />
							Plan Limit
						</div>
						<div className="text-2xl font-bold">
							{total.toLocaleString()}
						</div>
						<div className="text-xs text-muted-foreground">
							credits/month
						</div>
					</div>
				</div>

				{/* Upgrade CTA */}
				{!isPro && (
					<div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
						<h4 className="font-semibold mb-1 text-sm">Need more credits?</h4>
						<p className="text-xs text-muted-foreground mb-3">
							Upgrade to Pro for 100,000 credits per month - that's 100x more!
						</p>
						<Button asChild size="sm" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
							<Link href="/app/settings/billing">
								Upgrade to Pro
							</Link>
						</Button>
					</div>
				)}

				{/* Info */}
				<div className="text-xs text-muted-foreground">
					<p>
						Credits reset on the 1st of each month. Each AI generation uses approximately 10-50 credits depending on length.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
