// AI utilities from BK editor

interface SourceContext {
	id: string;
	name: string;
	type: string;
	content?: string;
}

interface SnippetContext {
	id: string;
	title: string;
	content: string;
}

export async function generateAiResponse({
	prompt,
	sources,
	snippets,
	documentContext,
}: {
	prompt: string;
	sources?: SourceContext[];
	snippets?: SnippetContext[];
	documentContext?: string;
}) {
	try {
		// Call our API route instead of OpenAI directly
		const response = await fetch("/api/ai/generate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt,
				sources,
				snippets,
				documentContext,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("🤖 [AI] Error response:", errorText);

			let error: { error?: string };
			try {
				error = JSON.parse(errorText);
			} catch {
				error = { error: errorText || response.statusText };
			}

			throw new Error(
				error.error || `AI generation failed: ${response.statusText}`,
			);
		}

		return response;
	} catch (error) {
		console.error("🤖 [AI] Fetch error:", error);
		throw error;
	}
}

export async function requestCompletion({
	prompt,
	sources,
	snippets,
	documentContext,
	onLoading,
	onChunk,
	onSuccess,
	onError,
	onComplete,
}: {
	prompt: string;
	sources?: SourceContext[];
	snippets?: SnippetContext[];
	documentContext?: string;
	onLoading?: () => void;
	onChunk?: (chunk: string) => void;
	onSuccess?: (completion: string) => void;
	onError?: (error: Error) => void;
	onComplete?: () => void;
}) {
	try {
		onLoading?.();

		const response = await generateAiResponse({
			prompt,
			sources,
			snippets,
			documentContext,
		});

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();

		if (!reader) {
			throw new Error("No response body");
		}

		let result = "";
		let chunkCount = 0;

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				console.log('📥 [AI Utilities] Complete AI response received:', {
					fullResponse: result,
					responseLength: result.length,
					chunkCount: chunkCount,
				});
				onSuccess?.(result);
				onComplete?.();
				return;
			}

			const chunk = decoder.decode(value);
			const lines = chunk.split("\n");

			for (const line of lines) {
				if (line.startsWith("data: ")) {
					const data = line.slice(6);

					if (data === "[DONE]") {
						continue;
					}

					try {
						const parsed = JSON.parse(data);
						const content = parsed.choices[0]?.delta?.content;

						if (content) {
							result += content;
							chunkCount++;
							onChunk?.(result);
						}
					} catch {
						// Skip invalid JSON
						console.warn(
							"🤖 [AI] Failed to parse chunk:",
							data.substring(0, 50),
						);
					}
				}
			}

			// Small delay for smooth streaming
			await new Promise((resolve) => setTimeout(resolve, 25));
		}
	} catch (error) {
		console.error("🤖 [AI] requestCompletion error:", error);
		onError?.(error as Error);
		onComplete?.();
	}
}
