import { Extension } from "@tiptap/core";

interface AiTextOptions {
  prompt: string;
  command: string;
  insert: false | { from: number; to: number };
}

export interface AiStorage {
  status?: "loading" | "success" | "error";
  message?: string;
  error?: Error;
}

export interface AiOptions {
  onLoading?: () => void;
  onError?: (error: Error) => void;
  apiEndpoint?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customAi: {
      customAiPrompt: (options: AiTextOptions) => ReturnType;
      customAiComplete: ({ command }: { command: string }) => ReturnType;
      customAiReset: () => ReturnType;
    };
  }

  interface Storage {
    customAi: AiStorage;
  }
}

async function generateAiResponse({ prompt }: { prompt: string }) {
  // TODO: Replace with your AI API endpoint
  // For now, using OpenAI directly (you can switch to any provider)
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not found");
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
          content: "You are a helpful writing assistant. Provide concise, well-formatted responses.",
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
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response;
}

async function requestCompletion({
  prompt,
  onLoading,
  onChunk,
  onSuccess,
  onError,
}: {
  prompt: string;
  onLoading?: () => void;
  onChunk?: (chunk: string) => void;
  onSuccess?: (completion: string) => void;
  onError?: (error: Error) => void;
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
    }
  } catch (error) {
    onError?.(error as Error);
  }
}

export const CustomAi = Extension.create<AiOptions, AiStorage>({
  name: "customAi",

  addStorage() {
    return {};
  },

  addCommands() {
    return {
      customAiPrompt:
        ({ prompt, command, insert }) =>
        ({ editor }) => {
          const question = () => {
            if (command === "prompt") {
              return `Please generate for this prompt: "${prompt}". Use markdown formatting when appropriate.`;
            }

            return `Please ${command} this text: "${prompt}". Use markdown formatting when appropriate.`;
          };

          const { onLoading, onError } = this.options;

          requestCompletion({
            prompt: question(),
            onLoading: () => {
              editor.storage.customAi = {
                status: "loading",
                message: insert ? prompt : undefined,
                error: undefined,
              };
              onLoading?.();
            },
            onChunk: (chunk) => {
              editor.commands.command(() => {
                const storage = editor.storage.customAi as AiStorage;
                storage.message = chunk;
                return true;
              });
            },
            onSuccess: (completion) => {
              const cm = editor.chain().command(() => {
                const storage = editor.storage.customAi as AiStorage;
                storage.status = "success";
                return true;
              });

              if (insert) {
                cm.focus()
                  .deleteRange({ from: insert.from, to: insert.to })
                  .insertContentAt(insert.from, completion);
              }

              cm.run();
            },
            onError: (error) => {
              onError?.(error);
              const cm = editor.chain().command(() => {
                const storage = editor.storage.customAi as AiStorage;
                storage.status = "error";
                storage.error = error;
                return true;
              });

              if (insert) {
                cm.focus()
                  .deleteRange({ from: insert.from, to: insert.to })
                  .insertContentAt(insert.from, prompt)
                  .customAiReset();
              }

              cm.run();
            },
          });

          return true;
        },

      customAiComplete:
        ({ command }) =>
        ({ chain, state }) => {
          const { from, to, empty } = state.selection;

          if (empty || !command) {
            return false;
          }

          const prompt = state.doc.textBetween(from, to);

          if (!prompt) {
            return false;
          }

          return chain()
            .customAiReset()
            .customAiPrompt({
              prompt: prompt,
              command: command,
              insert: { from, to },
            })
            .run();
        },

      customAiReset:
        () =>
        ({ commands }) => {
          return commands.command(({ editor }) => {
            editor.storage.customAi = {};
            return true;
          });
        },
    };
  },
});
