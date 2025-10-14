import { Extension } from "@tiptap/core";
import { requestCompletion } from "./ai-utilities";

interface AiTextOptions {
  prompt: string;
  command: string;
  insert: false | { from: number; to: number };
}

export interface BkAiStorage {
  status?: "loading" | "success" | "error";
  message?: string;
  error?: Error;
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
              (editor.storage as any).ai = {
                status: "loading",
                message: insert ? prompt : undefined,
                error: undefined,
              };
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
              const cm = editor.chain().command(() => {
                const storage = (editor.storage as any).ai;
                storage.status = "success";
                return true;
              });

              if (insert) {
                const range = editor.$pos(insert.from).range;
                cm.deleteRange(range).insertContentAt(insert.from, completion);
              }

              cm.run();
            },
            onError: (error) => {
              onError?.(error);
              const cm = editor.chain().command(() => {
                const storage = (editor.storage as any).ai;
                storage.status = "error";
                storage.error = error;
                return true;
              });

              if (insert) {
                const range = editor.$pos(insert.from).range;
                cm.focus()
                  .deleteRange(range)
                  .insertContentAt(range.from, prompt)
                  .aiReset();
              }

              cm.run();
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
            return true;
          });
        },
    };
  },
});
