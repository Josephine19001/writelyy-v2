import { Extension } from "@tiptap/core";
import { DOMSerializer } from "prosemirror-model";
import { requestCompletion } from "./ai-utilities";

export interface AiTextOptions {
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
			bkAiTextPrompt: (options: AiTextOptions) => ReturnType;
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
			bkAiTextPrompt:
				(options: AiTextOptions) =>
				({ editor, state }) => {
					const {
						prompt,
						command,
						insert,
						stream = true,
						tone,
						format = "rich-text",
					} = options;

					// Determine insert position
					let insertPosition: { from: number; to: number } | false =
						false;

					if (insert === true) {
						// If insert is true, use current selection
						const { from, to } = state.selection;
						insertPosition = { from, to };
					} else if (insert && typeof insert === "object") {
						// If insert is an object with from/to, use it
						insertPosition = insert;
					}

					const question = () => {
						let basePrompt = "";
						let htmlContent = prompt;

						// Get the HTML structure of the selected content
						if (insertPosition) {
							const { from, to } = insertPosition;

							// Get the actual HTML from the editor for the selected range
							try {
								// Use Tiptap's built-in method to get HTML from a specific range
								const selectedFragment = state.doc.slice(
									from,
									to,
								);
								const div = document.createElement("div");

								// Serialize the fragment to DOM using ProseMirror's DOMSerializer
								const serializer = DOMSerializer.fromSchema(
									editor.schema,
								);
								const fragment = serializer.serializeFragment(
									selectedFragment.content,
								);
								div.appendChild(fragment);

								if (div.innerHTML) {
									htmlContent = div.innerHTML;
								}
							} catch (e) {
								console.warn(
									"🤖 [Extension] Could not extract HTML, using text:",
									e,
								);
								// Fallback to the text content
							}
						}

						if (command === "prompt") {
							basePrompt = `Please generate content for this prompt: "${htmlContent}".`;
						} else {
							basePrompt = `Please ${command} the following HTML content. Return the result in the EXACT same HTML structure and format:\n\n${htmlContent}`;
						}

						// Add tone if specified
						if (tone && tone !== "auto") {
							basePrompt += `\n\nUse a ${tone} tone.`;
						}

						// Add specific formatting instructions
						basePrompt += `\n\nCRITICAL FORMATTING RULES:
- Return HTML in the EXACT same format as provided (same tags, same structure)
- If input has <h1>, output must have <h1> (not <h2>, <h3>, etc.)
- If input has <ul><li>, output must have <ul><li> (same list type)
- Do NOT add extra blank lines, whitespace, or line breaks between tags
- Do NOT wrap the output in additional tags
- Return ONLY the processed HTML content, nothing else`;

						return basePrompt;
					};

					const { onLoading, onError } = this.options;

					requestCompletion({
						prompt: question(),
						onLoading: () => {
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
							// Clean up the completion text to remove extra whitespace and line breaks
							const cleanedCompletion = completion
								// Remove multiple consecutive line breaks
								.replace(/\n{3,}/g, "\n\n")
								// Remove whitespace between closing and opening tags
								.replace(/>\s+</g, "><")
								// Remove extra spaces at the start of lines
								.replace(/\n\s+/g, "\n")
								// Clean up specific tag combinations
								.replace(/<\/p>\s*<p>/g, "</p><p>")
								.replace(/<\/li>\s*<li>/g, "</li><li>")
								.replace(/<\/ul>\s*<ul>/g, "</ul><ul>")
								.replace(/<\/ol>\s*<ol>/g, "</ol><ol>")
								.replace(/<\/h([1-6])>\s*<p>/g, "</h$1><p>")
								.replace(/<\/p>\s*<h([1-6])>/g, "</p><h$1>")
								.trim();

							// Store the original text before any modifications
							const originalText = insertPosition
								? editor.state.doc.textBetween(
										insertPosition.from,
										insertPosition.to,
										" ",
									)
								: undefined;

							editor.commands.command(() => {
								const storage = (editor.storage as any).ai;
								storage.status = "success";
								storage.message = cleanedCompletion;
								storage.insertPosition = insertPosition;
								storage.originalText = originalText;
								return true;
							});

							// If insertPosition exists, temporarily replace the text with AI suggestion
							if (
								insertPosition &&
								insertPosition.from !== undefined &&
								insertPosition.to !== undefined
							) {
								const { from, to } = insertPosition;

								// Replace the selected text with the AI-generated content
								// This shows the "after" state inline in the editor
								editor
									.chain()
									.focus()
									.deleteRange({ from, to })
									.insertContentAt(from, cleanedCompletion)
									.run();
							}

							// Set UI state flags for completion
							editor.commands.aiGenerationSetIsLoading(false);
							editor.commands.aiGenerationHasMessage(true);
							// Don't auto-insert - let user accept/reject via UI
						},
						onError: (error) => {
							console.error(
								"🤖 [Extension] onError callback triggered:",
								error,
							);
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

							if (
								insertPosition &&
								insertPosition.from !== undefined &&
								insertPosition.to !== undefined
							) {
								const { from, to } = insertPosition;
								editor
									.chain()
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
						.bkAiTextPrompt({
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
				({ commands }) => {
					// The AI-generated content is already inserted in the editor
					// Just reset the storage to clean up
					commands.aiReset();
					return true;
				},

			aiReject:
				(options) =>
				({ editor, commands }) => {
					const storage = (editor.storage as any).ai;
					const { originalText, insertPosition, message } =
						storage || {};

					// If we have original text and insert position, restore it
					if (
						originalText !== undefined &&
						insertPosition &&
						insertPosition.from !== undefined &&
						message
					) {
						const { from } = insertPosition;
						const currentTo = from + message.length;

						// Delete the AI-generated content and restore original text
						editor
							.chain()
							.focus()
							.deleteRange({ from, to: currentTo })
							.insertContentAt(from, originalText)
							.run();
					}

					if (options?.type === "reset") {
						return commands.aiReset();
					}
					return commands.aiReset();
				},
		};
	},
});
