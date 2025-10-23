import { config } from "@repo/config";
import { db } from "../index";

/**
 * Get credit limit for a plan
 */
export function getCreditLimitForPlan(planId: string): number {
	const plan = config.payments.plans[planId];
	return plan?.monthlyCredits ?? 1000; // Default to free tier
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(
	userId: string,
	requiredCredits: number,
): Promise<boolean> {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { credits: true, creditsUsed: true },
	});

	if (!user) return false;

	const availableCredits = user.credits - user.creditsUsed;
	return availableCredits >= requiredCredits;
}

/**
 * Get available credits for user
 */
export async function getAvailableCredits(
	userId: string,
): Promise<{ available: number; total: number; used: number }> {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { credits: true, creditsUsed: true },
	});

	if (!user) {
		return { available: 0, total: 0, used: 0 };
	}

	return {
		available: Math.max(0, user.credits - user.creditsUsed),
		total: user.credits,
		used: user.creditsUsed,
	};
}

/**
 * Deduct credits from user
 */
export async function deductCredits(
	userId: string,
	amount: number,
): Promise<boolean> {
	try {
		const hasCredits = await hasEnoughCredits(userId, amount);
		if (!hasCredits) {
			return false;
		}

		await db.user.update({
			where: { id: userId },
			data: {
				creditsUsed: {
					increment: amount,
				},
			},
		});

		return true;
	} catch (error) {
		console.error("Error deducting credits:", error);
		return false;
	}
}

/**
 * Reset user credits based on their plan
 */
export async function resetUserCredits(
	userId: string,
	planId: string,
): Promise<void> {
	const creditLimit = getCreditLimitForPlan(planId);

	await db.user.update({
		where: { id: userId },
		data: {
			credits: creditLimit,
			creditsUsed: 0,
			creditsResetAt: new Date(),
		},
	});
}

/**
 * Check if credits need to be reset (monthly reset)
 */
export async function checkAndResetCreditsIfNeeded(
	userId: string,
	planId: string,
): Promise<void> {
	const user = await db.user.findUnique({
		where: { id: userId },
		select: { creditsResetAt: true },
	});

	if (!user) return;

	const now = new Date();
	const resetDate = user.creditsResetAt;

	// If never reset or more than 30 days ago, reset credits
	if (!resetDate || now.getTime() - resetDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
		await resetUserCredits(userId, planId);
	}
}

/**
 * Update user credits when they upgrade/downgrade plan
 */
export async function updateCreditsOnPlanChange(
	userId: string,
	newPlanId: string,
): Promise<void> {
	const newCreditLimit = getCreditLimitForPlan(newPlanId);

	await db.user.update({
		where: { id: userId },
		data: {
			credits: newCreditLimit,
			creditsUsed: 0,
			creditsResetAt: new Date(),
		},
	});
}
