import type { NextRequest } from "next/server";
import { getSession } from '@saas/auth/lib/server';
import { hasEnoughCredits, deductCredits } from '@repo/database/lib/credits';

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

// Credit cost for AI generation (higher than chat due to more tokens)
const GENERATION_CREDIT_COST = 25;

export async function POST(request: NextRequest) {
	try {
		console.log('🔵 [Generate API] Request received');

		// Check authentication
		const session = await getSession();
		if (!session?.user?.id) {
			return new Response(
				JSON.stringify({ error: 'Unauthorized' }),
				{ status: 401, headers: { "Content-Type": "application/json" } }
			);
		}

		// Check if user has enough credits
		const hasCredits = await hasEnoughCredits(session.user.id, GENERATION_CREDIT_COST);
		if (!hasCredits) {
			return new Response(
				JSON.stringify({
					error: 'Insufficient credits',
					message: 'You have run out of AI credits. Please upgrade your plan or wait for your monthly reset.',
					upgradeUrl: '/app/settings/billing'
				}),
				{ status: 402, headers: { "Content-Type": "application/json" } }
			);
		}

		const body: GenerateRequest = await request.json();
		const { prompt, sources, snippets, documentContext } = body;
		console.log('🔵 [Generate API] Request details:', {
			promptLength: prompt?.length,
			promptPreview: prompt?.substring(0, 100) + '...',
			hasDocumentContext: !!documentContext,
			documentContextLength: documentContext?.length,
			sourcesCount: sources?.length || 0,
			snippetsCount: snippets?.length || 0,
		});

		// Build enhanced prompt with context from sources, snippets, and document
		let enhancedPrompt = prompt;
		const contextParts: string[] = [];

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

		// Add document context if available (current document content) - for context awareness only
		if (documentContext && documentContext.trim()) {
			const docPreview = documentContext.slice(0, 3000); // Limit to avoid token limits
			contextParts.push(`DOCUMENT CONTEXT (for reference only, DO NOT modify or return this):\n${docPreview}${documentContext.length > 3000 ? '...' : ''}`);
		}

		// Append context to prompt if available
		if (contextParts.length > 0) {
			enhancedPrompt = `${prompt}

═══════════════════════════════════════════════════════════
BACKGROUND CONTEXT (FOR AWARENESS ONLY - DO NOT MODIFY OR RETURN)
═══════════════════════════════════════════════════════════

${contextParts.join('\n\n───────────────────────────────────────────────────────────────\n\n')}

═══════════════════════════════════════════════════════════
END OF BACKGROUND CONTEXT
═══════════════════════════════════════════════════════════

CRITICAL INSTRUCTIONS:
1. The content above this line is BACKGROUND CONTEXT ONLY
2. DO NOT include, modify, or return ANY of the background context
3. ONLY process and return the specific content mentioned in the main instruction at the top
4. Return ONLY the modified version of the targeted content, nothing else`;
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
		console.log('📤 [Generate API] Sending to OpenAI:', {
			fullPrompt: enhancedPrompt,
			promptLength: enhancedPrompt.length,
		});

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
								"You are a precise writing assistant that edits ONLY the specific content requested. Follow these rules:\n\n" +
								"HTML STRUCTURE:\n" +
								"1. PRESERVE the exact HTML structure and heading levels from the input\n" +
								"2. If input has <h1>, output must have <h1> (never change heading levels)\n" +
								"3. Maintain list structure (<ul>/<ol>/<li>) exactly as in the original\n" +
								"4. Use <p> for paragraphs, <strong> for bold, <em> for italic\n" +
								"5. Do NOT add extra blank lines, line breaks, or spacing between HTML elements\n" +
								"6. Keep content compact - no unnecessary whitespace between tags\n\n" +
								"OUTPUT FORMAT:\n" +
								"7. Return ONLY HTML content without markdown syntax, explanations, or extra text\n" +
								"8. Do NOT wrap output in additional tags\n" +
								"9. Do NOT add comments or explanations\n\n" +
								"CONTEXT HANDLING (MOST IMPORTANT):\n" +
								"10. The user request contains the TARGET CONTENT at the top\n" +
								"11. Any 'BACKGROUND CONTEXT' section is for awareness only\n" +
								"12. DO NOT modify, include, or return any background context\n" +
								"13. DO NOT return the entire document\n" +
								"14. ONLY return the modified version of the TARGET CONTENT specified in the main instruction\n" +
								"15. If you see document context or additional context, completely ignore it in your output\n\n" +
								"SCOPE:\n" +
								"16. Process ONLY the specific content mentioned in the main instruction\n" +
								"17. Return ONLY that processed content, nothing more, nothing less",
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

		// Deduct credits immediately (before streaming starts)
		// This prevents abuse from cancelled streams
		await deductCredits(session.user.id, GENERATION_CREDIT_COST);
		console.log('✅ [Generate API] Credits deducted:', GENERATION_CREDIT_COST);

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
