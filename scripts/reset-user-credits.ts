import { db } from "@repo/database";

async function resetUserCredits() {
	try {
		// Get all users and check their credit status
		const users = await db.user.findMany({
			select: {
				id: true,
				email: true,
				credits: true,
				creditsUsed: true,
				creditsResetAt: true,
			},
		});

		console.log("Current user credit status:");
		console.log("=" .repeat(80));

		for (const user of users) {
			console.log(`\nUser: ${user.email}`);
			console.log(`  Total Credits: ${user.credits}`);
			console.log(`  Credits Used: ${user.creditsUsed}`);
			console.log(`  Available: ${user.credits - user.creditsUsed}`);
			console.log(`  Last Reset: ${user.creditsResetAt || "Never"}`);

			// Fix any users where creditsUsed > credits
			if (user.creditsUsed > user.credits) {
				console.log(`  ⚠️  ISSUE: Credits used (${user.creditsUsed}) > Total credits (${user.credits})`);
				console.log(`  Resetting to: credits=1000, creditsUsed=0`);

				await db.user.update({
					where: { id: user.id },
					data: {
						credits: 1000,
						creditsUsed: 0,
						creditsResetAt: new Date(),
					},
				});
				console.log(`  ✓ Reset completed`);
			}
		}

		console.log("\n" + "=".repeat(80));
		console.log("Credit check completed!");
	} catch (error) {
		console.error("Error:", error);
	} finally {
		await db.$disconnect();
	}
}

resetUserCredits();
