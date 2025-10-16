import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const aiSecret = process.env.TIPTAP_AI_SECRET;
		const aiAppId = process.env.TIPTAP_AI_APP_ID;

		if (!aiSecret || !aiAppId) {
			console.error("🤖 Missing AI configuration");
			return NextResponse.json(
				{ error: "Missing AI configuration" },
				{ status: 500 },
			);
		}

		const now = Math.floor(Date.now() / 1000);

		// Match Tiptap's exact JWT payload structure from their example
		const payload = {
			iat: now,
			nbf: now,
			exp: now + 60 * 60 * 24, // 24 hours expiration
			iss: "https://cloud.tiptap.dev",
			aud: aiAppId,
		};

		// Use the secret exactly as provided by Tiptap
		const token = jwt.sign(payload, aiSecret, { algorithm: "HS256" });

		// Verify the token can be decoded properly
		try {
			jwt.verify(token, aiSecret) as any;
		} catch (verifyError) {
			console.error("🤖 JWT verification failed:", verifyError);
			return NextResponse.json(
				{ error: "Token verification failed" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			token,
			expiresAt: new Date((now + 60 * 60 * 24) * 1000).toISOString(),
		});
	} catch (error) {
		console.error("Error generating AI token:", error);
		return NextResponse.json(
			{ error: "Failed to generate AI token" },
			{ status: 500 },
		);
	}
}
