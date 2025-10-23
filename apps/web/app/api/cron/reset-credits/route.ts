import { NextResponse } from 'next/server';
import { db } from '@repo/database';
import { getCreditLimitForPlan } from '@repo/database/lib/credits';
import { createPurchasesHelper } from '@repo/payments/lib/helper';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// Add this to vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/reset-credits",
//     "schedule": "0 0 1 * *"  // First day of every month at midnight
//   }]
// }

export async function GET(request: Request) {
  try {
    // Verify this is called by Vercel Cron (optional security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 [Credit Reset] Starting monthly credit reset...');

    // Get all users
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        purchases: true,
      },
    });

    let resetCount = 0;
    let errorCount = 0;

    // Reset credits for each user based on their plan
    for (const user of users) {
      try {
        // Determine user's current plan
        const { activePlan } = createPurchasesHelper(user.purchases);
        const planId = activePlan?.id ?? 'free';
        const creditLimit = getCreditLimitForPlan(planId);

        // Reset credits
        await db.user.update({
          where: { id: user.id },
          data: {
            credits: creditLimit,
            creditsUsed: 0,
            creditsResetAt: new Date(),
          },
        });

        resetCount++;
        console.log(`✅ Reset credits for user ${user.email} (${planId}): ${creditLimit} credits`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error resetting credits for user ${user.email}:`, error);
      }
    }

    const summary = {
      success: true,
      totalUsers: users.length,
      resetCount,
      errorCount,
      timestamp: new Date().toISOString(),
    };

    console.log('🎉 [Credit Reset] Completed:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ [Credit Reset] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}
