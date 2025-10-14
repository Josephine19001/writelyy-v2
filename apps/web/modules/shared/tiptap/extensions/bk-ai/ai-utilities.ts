// AI utilities from BK editor

export async function generateAiResponse({ prompt }: { prompt: string }) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not found. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful writing assistant. Provide concise, well-formatted responses using markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI generation failed: ${response.statusText}`);
  }

  return response;
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
  try {
    onLoading?.();
    const response = await generateAiResponse({ prompt });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    let result = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
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
              onChunk?.(result);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      // Small delay for smooth streaming
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  } catch (error) {
    onError?.(error as Error);
    onComplete?.();
  }
}
