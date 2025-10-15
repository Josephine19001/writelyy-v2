// AI utilities from BK editor

export async function generateAiResponse({ prompt }: { prompt: string }) {
	console.log('🤖 [AI] Calling API with prompt:', `${prompt.substring(0, 100)}...`);

	try {
		// Call our API route instead of OpenAI directly
		const response = await fetch("/api/ai/generate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				prompt,
			}),
		});

		console.log('🤖 [AI] Response status:', response.status, response.statusText);

		if (!response.ok) {
			const errorText = await response.text();
			console.error('🤖 [AI] Error response:', errorText);

			let error: { error?: string };
			try {
				error = JSON.parse(errorText);
			} catch {
				error = { error: errorText || response.statusText };
			}

			throw new Error(error.error || `AI generation failed: ${response.statusText}`);
		}

		console.log('🤖 [AI] Response received successfully, starting stream...');
		return response;
	} catch (error) {
		console.error('🤖 [AI] Fetch error:', error);
		throw error;
	}
}

export async function requestCompletion({
	prompt,
	onLoading,
	onChunk,
	onSuccess,
	onError,
	onComplete,
}: {
	prompt: string;
	onLoading?: () => void;
	onChunk?: (chunk: string) => void;
	onSuccess?: (completion: string) => void;
	onError?: (error: Error) => void;
	onComplete?: () => void;
}) {
	console.log('🤖 [AI] requestCompletion started');
	try {
		console.log('🤖 [AI] Calling onLoading callback');
		onLoading?.();

		const response = await generateAiResponse({ prompt });

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();

		if (!reader) {
			throw new Error("No response body");
		}

		console.log('🤖 [AI] Starting to read stream...');
		let result = "";
		let chunkCount = 0;

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				console.log(`🤖 [AI] Stream complete. Total chunks: ${chunkCount}, Result length: ${result.length}`);
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
						console.log('🤖 [AI] Received [DONE] marker');
						continue;
					}

					try {
						const parsed = JSON.parse(data);
						const content = parsed.choices[0]?.delta?.content;

						if (content) {
							result += content;
							chunkCount++;
							onChunk?.(result);

							// Log every 10 chunks
							if (chunkCount % 10 === 0) {
								console.log(`🤖 [AI] Chunk ${chunkCount}: ${result.length} chars`);
							}
						}
					} catch {
						// Skip invalid JSON
						console.warn('🤖 [AI] Failed to parse chunk:', data.substring(0, 50));
					}
				}
			}

			// Small delay for smooth streaming
			await new Promise((resolve) => setTimeout(resolve, 25));
		}
	} catch (error) {
		console.error('🤖 [AI] requestCompletion error:', error);
		onError?.(error as Error);
		onComplete?.();
	}
}
