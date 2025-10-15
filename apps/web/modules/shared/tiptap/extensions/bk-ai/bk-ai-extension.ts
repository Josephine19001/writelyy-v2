import { Extension } from "@tiptap/core";
import { requestCompletion } from "./ai-utilities";

interface AiTextOptions {
  prompt: string;
  command: string;
  insert?: boolean | { from: number; to: number };
  stream?: boolean;
  tone?: string;
  format?: string;
}

export interface BkAiStorage {
  status?: "loading" | "success" | "error";
  message?: string;
  error?: Error;
  insertPosition?: { from: number; to: number } | false;
  originalText?: string;
}

export interface BkAiOptions {
  onLoading?: () => void;
  onError?: (error: Error) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    bkAi: {
      aiTextPrompt: (options: AiTextOptions) => ReturnType;
      aiCompletion: ({ command }: { command: string }) => ReturnType;
      aiReset: () => ReturnType;
      aiAccept: () => ReturnType;
      aiReject: (options?: { type?: "reset" }) => ReturnType;
    };
  }
}

export const BkAi = Extension.create<BkAiOptions, BkAiStorage>({
  name: "ai",

  addStorage() {
    return {};
  },

  addCommands() {
    return {
      aiTextPrompt:
        ({ prompt, command, insert, stream = true, tone, format = "rich-text" }) =>
        ({ editor, state }) => {
          console.log('🤖 [Extension] aiTextPrompt called with:', { command, insert, tone, format });

          // Determine insert position
          let insertPosition: { from: number; to: number } | false = false;

          if (insert === true) {
            // If insert is true, use current selection
            const { from, to } = state.selection;
            insertPosition = { from, to };
            console.log('🤖 [Extension] Using selection position:', insertPosition);
          } else if (insert && typeof insert === 'object') {
            // If insert is an object with from/to, use it
            insertPosition = insert;
            console.log('🤖 [Extension] Using provided position:', insertPosition);
          }

          const question = () => {
            let basePrompt = "";

            if (command === "prompt") {
              basePrompt = `Please generate for this prompt: "${prompt}".`;
            } else {
              basePrompt = `Please ${command} this text: "${prompt}".`;
            }

            // Add tone if specified
            if (tone && tone !== "auto") {
              basePrompt += ` Use a ${tone} tone.`;
            }

            return basePrompt;
          };

          const { onLoading, onError } = this.options;

          console.log('🤖 [Extension] Starting requestCompletion...');
          requestCompletion({
            prompt: question(),
            onLoading: () => {
              console.log('🤖 [Extension] onLoading callback triggered');
              (editor.storage as any).ai = {
                status: "loading",
                message: insertPosition ? prompt : undefined,
                error: undefined,
              };
              // Set UI state flags for loading
              editor.commands.aiGenerationSetIsLoading(true);
              editor.commands.aiGenerationHasMessage(false);
              onLoading?.();
            },
            onChunk: (chunk) => {
              editor.commands.command(() => {
                const storage = (editor.storage as any).ai;
                storage.message = chunk;
                return true;
              });
            },
            onSuccess: (completion) => {
              console.log('🤖 [Extension] onSuccess callback triggered, completion length:', completion.length);
              editor.commands.command(() => {
                const storage = (editor.storage as any).ai;
                storage.status = "success";
                storage.message = completion;
                storage.insertPosition = insertPosition;
                storage.originalText = insertPosition ? editor.state.doc.textBetween(insertPosition.from, insertPosition.to, ' ') : undefined;
                return true;
              });
              // Set UI state flags for completion
              editor.commands.aiGenerationSetIsLoading(false);
              editor.commands.aiGenerationHasMessage(true);
              // Don't auto-insert - let user accept/reject via UI
            },
            onError: (error) => {
              console.error('🤖 [Extension] onError callback triggered:', error);
              onError?.(error);
              editor.commands.command(() => {
                const storage = (editor.storage as any).ai;
                storage.status = "error";
                storage.error = error;
                return true;
              });

              // Set UI state flags for error
              editor.commands.aiGenerationSetIsLoading(false);
              editor.commands.aiGenerationHasMessage(false);

              if (insertPosition && insertPosition.from !== undefined && insertPosition.to !== undefined) {
                const { from, to } = insertPosition;
                editor.chain()
                  .focus()
                  .deleteRange({ from, to })
                  .insertContentAt(from, prompt)
                  .aiReset()
                  .run();
              }
            },
          });

          return true;
        },

      aiCompletion:
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
            .aiReset()
            .setAiPlaceholder({ from, to })
            .aiTextPrompt({
              prompt: prompt,
              command: command,
              insert: { from, to },
            })
            .run();
        },

      aiReset:
        () =>
        ({ commands }) => {
          return commands.command(({ editor }) => {
            (editor.storage as any).ai = {};
            // Reset UI state flags
            editor.commands.aiGenerationSetIsLoading(false);
            editor.commands.aiGenerationHasMessage(false);
            return true;
          });
        },

      aiAccept:
        () =>
        ({ editor, commands }) => {
          const storage = (editor.storage as any).ai;
          const { message, insertPosition } = storage || {};

          if (!message) {
            return false;
          }

          if (insertPosition && insertPosition.from !== undefined && insertPosition.to !== undefined) {
            const { from, to } = insertPosition;
            editor.chain()
              .focus()
              .deleteRange({ from, to })
              .insertContentAt(from, message)
              .run();
          }

          // Reset after accepting
          commands.aiReset();
          return true;
        },

      aiReject:
        (options) =>
        ({ commands }) => {
          if (options?.type === "reset") {
            return commands.aiReset();
          }
          return commands.aiReset();
        },
    };
  },
});
