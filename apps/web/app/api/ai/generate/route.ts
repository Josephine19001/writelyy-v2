import type { NextRequest } from "next/server";

// Use Edge Runtime for fastest performance (no cold starts, runs close to users)
export const runtime = "edge";

// Enable maximum timeout for streaming
export const maxDuration = 60;

interface SourceContext {
	id: string;
	name: string;
	type: string;
	content?: string; // extracted text or URL
}

interface SnippetContext {
	id: string;
	title: string;
	content: string;
}

interface GenerateRequest {
	prompt: string;
	sources?: SourceContext[];
	snippets?: SnippetContext[];
	documentContext?: string; // Current document content for context awareness
}

export async function POST(request: NextRequest) {
	try {
		console.log('🔵 [Generate API] Request received');
		const body: GenerateRequest = await request.json();
		const { prompt, sources, snippets, documentContext } = body;
		console.log('🔵 [Generate API] Prompt:', prompt?.substring(0, 50));

		// Build enhanced prompt with context from sources, snippets, and document
		let enhancedPrompt = prompt;
		const contextParts: string[] = [];

		// Add document context if available (current document content)
		if (documentContext && documentContext.trim()) {
			const docPreview = documentContext.slice(0, 3000); // Limit to avoid token limits
			contextParts.push(`Current Document Content:\n${docPreview}${documentContext.length > 3000 ? '...' : ''}`);
		}

		// Add snippet context if available
		if (snippets && snippets.length > 0) {
			const snippetDetails = snippets.map((snippet, idx) =>
				`${idx + 1}. "${snippet.title}":\n${snippet.content}`
			).join('\n\n');
			contextParts.push(`Referenced Snippets:\n${snippetDetails}`);
		}

		// Add source context if available
		if (sources && sources.length > 0) {
			const sourceDetails = sources.map((source, idx) => {
				const parts = [`${idx + 1}. "${source.name}" (${source.type})`];
				if (source.content) {
					// Limit content to avoid token limits
					const contentPreview = source.content.slice(0, 1500);
					parts.push(`Content: ${contentPreview}${source.content.length > 1500 ? '...' : ''}`);
				}
				return parts.join('\n');
			}).join('\n\n');
			contextParts.push(`Referenced Sources:\n${sourceDetails}`);
		}

		// Append context to prompt if available
		if (contextParts.length > 0) {
			enhancedPrompt = `${prompt}\n\n--- Additional Context ---\n${contextParts.join('\n\n')}\n--- End Context ---\n\nPlease use this additional context to help with the task.`;
		}

		const apiKey = process.env.OPENAI_API_KEY;

		if (!apiKey) {
			console.error("🔴 [Generate API] OpenAI API key not configured");
			console.error("🔴 [Generate API] Available env vars:", Object.keys(process.env).filter(k => k.includes('OPENAI')));
			return new Response(
				JSON.stringify({ error: "OpenAI API key not configured" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		console.log('✅ [Generate API] API key found, calling OpenAI...');

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
								"You are a helpful writing assistant. Follow these rules strictly:\n" +
								"1. When editing existing content, PRESERVE the exact HTML structure and heading levels\n" +
								"2. If the original has <h1>, use <h1> in your response - do NOT change to <h3> or other levels\n" +
								"3. Maintain list structure (<ul>/<ol>/<li>) exactly as in the original\n" +
								"4. Do NOT add extra blank lines, line breaks, or spacing between HTML elements\n" +
								"5. Use <p> for paragraphs, <strong> for bold, <em> for italic\n" +
								"6. Return ONLY HTML content without markdown syntax, explanations, or extra text\n" +
								"7. Keep content compact - no unnecessary whitespace between tags",
						},
						{
							role: "user",
							content: enhancedPrompt,
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
