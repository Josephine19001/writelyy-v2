import { Extension } from "@tiptap/core";
import { DOMSerializer, DOMParser } from "prosemirror-model";
import { requestCompletion } from "./ai-utilities";

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

export interface AiTextOptions {
	prompt: string;
	command: string;
	insert?: boolean | { from: number; to: number };
	stream?: boolean;
	tone?: string;
	format?: string;
	sources?: SourceContext[];
	snippets?: SnippetContext[];
	includeDocumentContext?: boolean; // Whether to include full document for context awareness
}

export interface BkAiStorage {
	status?: "loading" | "success" | "error";
	message?: string;
	error?: Error;
	insertPosition?: { from: number; to: number } | false;
	originalText?: string;
	insertedContentEndPos?: number; // Track where inserted content ends
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
						sources,
						snippets,
						includeDocumentContext = false, // Default to false for targeted edits
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

						// Build the prompt with clear separation
						let basePrompt = "";

						if (command === "prompt") {
							basePrompt = `Generate content for this prompt: "${htmlContent}"`;
						} else {
							basePrompt = `TASK: ${command} the following content

TARGET CONTENT TO MODIFY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${htmlContent}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS:
- Process ONLY the content shown above between the lines
- Preserve the exact HTML structure (same tags, same nesting)
- Return the modified version in the same HTML format
- Do NOT include any other content from the document`;
						}

						// Add tone if specified
						if (tone && tone !== "auto") {
							basePrompt += `\n- Use a ${tone} tone`;
						}

						return basePrompt;
					};

					const { onLoading, onError } = this.options;

					// Get full document context for AI awareness (only if requested)
					const documentContext = includeDocumentContext ? editor.getText() : undefined;

					const finalPrompt = question();

					console.log('🚀 [AI Extension] Sending to AI:', {
						prompt: finalPrompt,
						includeDocumentContext,
						documentContextLength: documentContext?.length || 0,
						documentContextPreview: documentContext ? documentContext.slice(0, 200) + '...' : 'N/A',
						sources: sources?.length || 0,
						snippets: snippets?.length || 0,
					});

					requestCompletion({
						prompt: finalPrompt,
						sources,
						snippets,
						documentContext,
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
							console.log('✅ [AI Extension] Received from AI:', {
								rawCompletion: completion,
								completionLength: completion.length,
							});

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

							console.log('🧹 [AI Extension] After cleaning:', {
								cleanedCompletion: cleanedCompletion,
								cleanedLength: cleanedCompletion.length,
							});

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

								// Use a transaction to track the insertion properly
								const { state, view } = editor;
								const { tr } = state;

								// Delete the old content
								tr.delete(from, to);

								// Parse the HTML content to insert
								const parser = DOMParser.fromSchema(editor.schema);
								const tempDiv = document.createElement('div');
								tempDiv.innerHTML = cleanedCompletion;
								const slice = parser.parseSlice(tempDiv);

								// Insert the new content
								tr.insert(from, slice.content);

								// Calculate the end position
								// The end position is the start position + the size of the inserted content
								const insertedSize = slice.content.size;
								const endPos = from + insertedSize;

								// Apply the transaction
								view.dispatch(tr);

								// Store the end position
								editor.commands.command(() => {
									const storage = (editor.storage as any).ai;
									storage.insertedContentEndPos = endPos;
									console.log('📍 Stored positions:', { from, endPos, insertedSize, originalText });
									return true;
								});
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
				({ editor, commands, state }) => {
					const storage = (editor.storage as any).ai;
					const { originalText, insertPosition, insertedContentEndPos } = storage || {};

					console.log('🔄 aiReject called:', { originalText, insertPosition, insertedContentEndPos, options });

					// If we have original text and insert position, restore it
					if (
						insertPosition &&
						insertPosition.from !== undefined &&
						insertedContentEndPos !== undefined
					) {
						const { from } = insertPosition;
						const to = insertedContentEndPos;

						console.log('📍 Deleting range and restoring:', { from, to, originalText });

						try {
							// Delete the AI content and restore original text in one transaction
							const chain = editor.chain().focus().deleteRange({ from, to });

							// If there was original text, insert it back
							if (originalText) {
								chain.insertContentAt(from, originalText);
							}

							const result = chain.run();
							console.log('✅ Restore result:', result);
						} catch (error) {
							console.error("❌ Error restoring original text:", error);
							// Fallback: just reset without restoration
						}
					} else {
						console.warn('⚠️ Missing required data for restoration');
					}

					if (options?.type === "reset") {
						return commands.aiReset();
					}
					return commands.aiReset();
				},
		};
	},
});
