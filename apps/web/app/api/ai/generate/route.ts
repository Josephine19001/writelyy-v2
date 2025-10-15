import type { NextRequest } from "next/server";

// Use Edge Runtime for fastest performance (no cold starts, runs close to users)
export const runtime = "edge";

// Enable maximum timeout for streaming
export const maxDuration = 60;

interface GenerateRequest {
	prompt: string;
}

export async function POST(request: NextRequest) {
	try {
		const body: GenerateRequest = await request.json();
		const { prompt } = body;

		const apiKey = process.env.OPENAI_API_KEY;

		if (!apiKey) {
			console.error("🔵 [API] OpenAI API key not configured");
			return new Response(
				JSON.stringify({ error: "OpenAI API key not configured" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Make the OpenAI request with optimized settings
		const response = await fetch(
			"https://api.openai.com/v1/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: "gpt-4o-mini", // Fast and cost-effective model
					messages: [
						{
							role: "system",
							content:
								"You are a helpful writing assistant. Provide concise, well-formatted responses using HTML tags. Use <p> for paragraphs, <strong> for bold, <em> for italic, <h1>-<h6> for headings, <ul>/<ol>/<li> for lists, etc. Do NOT use markdown syntax.",
						},
						{
							role: "user",
							content: prompt,
						},
					],
					stream: true, // Enable streaming for real-time response
					temperature: 0.7, // Balanced creativity
					max_tokens: 2000, // Reasonable limit for editor content
				}),
			},
		);

		if (!response.ok) {
			const error = await response.text();
			console.error("🔵 [API] OpenAI API error:", response.status, error);
			return new Response(
				JSON.stringify({
					error: `AI generation failed: ${response.statusText}`,
					details: error,
				}),
				{
					status: response.status,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Stream the response directly with optimized headers
		return new Response(response.body, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache, no-transform", // Prevent any caching or transformation
				Connection: "keep-alive",
				"X-Accel-Buffering": "no", // Disable proxy buffering
			},
		});
	} catch (error) {
		console.error("🔵 [API] AI generation error:", error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
}
