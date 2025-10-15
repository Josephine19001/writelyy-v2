/**
 * Tiptap AI Utilities
 *
 * Helper functions for working with Tiptap AI extensions
 */

import type { Editor } from "@tiptap/core";

import { AI_LANGUAGE_PRESETS, AI_TONE_PRESETS } from "../config/ai-config";

/**
 * Execute an AI command on the editor
 */
export const executeAiCommand = (
  editor: Editor | null,
  command: string,
  options?: {
    tone?: string;
    language?: string;
    text?: string;
    stream?: boolean;
  }
) => {
  if (!editor) {
    console.error("Editor not available");
    return false;
  }

  const { tone, language, text, stream = true } = options || {};

  // Build the command options
  const commandOptions = {
    ...(tone && { tone }),
    ...(language && { language }),
    ...(text && { text }),
    stream,
    format: "rich-text",
  };

  // Execute the command using the actual Tiptap AI extension commands
  try {
    switch (command) {
      case "improve":
        // Use aiRephrase for improving text
        return (editor.commands as any).aiRephrase?.(commandOptions) ?? false;

      case "fixSpelling":
        return (editor.commands as any).aiFixSpellingAndGrammar?.(commandOptions) ?? false;

      case "makeShorter":
        return (editor.commands as any).aiShorten?.(commandOptions) ?? false;

      case "makeLonger":
        return (editor.commands as any).aiExtend?.(commandOptions) ?? false;

      case "simplify":
        return (editor.commands as any).aiSimplify?.(commandOptions) ?? false;

      case "emojify":
        return (editor.commands as any).aiEmojify?.(commandOptions) ?? false;

      case "changeTone":
        return (editor.commands as any).aiAdjustTone?.(tone, commandOptions) ?? false;

      case "translate":
        return (editor.commands as any).aiTranslate?.(language, commandOptions) ?? false;

      case "custom":
        return (editor.commands as any).bkAiTextPrompt?.(commandOptions) ?? false;

      default:
        console.warn(`Unknown AI command: ${command}`);
        return false;
    }
  } catch (error) {
    console.error("Error executing AI command:", error);
    return false;
  }
};

/**
 * Accept AI-generated content
 */
export const acceptAiContent = (editor: Editor | null) => {
  if (!editor) {
    return false;
  }

  try {
    return (editor.commands as any).aiAccept?.() ?? false;
  } catch (error) {
    console.error("Error accepting AI content:", error);
    return false;
  }
};

/**
 * Reject AI-generated content
 */
export const rejectAiContent = (editor: Editor | null, options?: { type?: "reset" | "undo" }) => {
  if (!editor) {
    return false;
  }

  try {
    return (editor.commands as any).aiReject?.(options) ?? false;
  } catch (error) {
    console.error("Error rejecting AI content:", error);
    return false;
  }
};

/**
 * Stop AI generation
 */
export const stopAiGeneration = (editor: Editor | null) => {
  if (!editor) {
    return false;
  }

  try {
    return (editor.commands as any).aiStop?.() ?? false;
  } catch (error) {
    console.error("Error stopping AI generation:", error);
    return false;
  }
};

/**
 * Check if AI is currently generating
 */
export const isAiGenerating = (editor: Editor | null): boolean => {
  if (!editor) {
    return false;
  }

  // Check the editor state for AI activity
  // The AI storage has a 'state' property that indicates loading status
  const aiState = editor.storage.ai as any;
  return aiState?.state === "loading" || false;
};

/**
 * Get AI suggestions for the current document
 */
export const getAiSuggestions = (editor: Editor | null) => {
  if (!editor) {
    return [];
  }

  // Get suggestions from the AI Suggestion extension using getSuggestions method
  const suggestionState = editor.storage.aiSuggestion as any;
  return suggestionState?.getSuggestions?.() || [];
};

/**
 * Accept an AI suggestion
 */
export const acceptAiSuggestion = (editor: Editor | null, suggestionId: string) => {
  if (!editor) {
    return false;
  }

  try {
    return (editor.commands as any).acceptAiSuggestion?.({ id: suggestionId }) ?? false;
  } catch (error) {
    console.error("Error accepting AI suggestion:", error);
    return false;
  }
};

/**
 * Reject an AI suggestion
 */
export const rejectAiSuggestion = (editor: Editor | null, suggestionId: string) => {
  if (!editor) {
    return false;
  }

  try {
    return (editor.commands as any).rejectAiSuggestion?.({ id: suggestionId }) ?? false;
  } catch (error) {
    console.error("Error rejecting AI suggestion:", error);
    return false;
  }
};

/**
 * Get AI changes in the document
 */
export const getAiChanges = (editor: Editor | null) => {
  if (!editor) {
    return [];
  }

  // Get changes from the AI Changes extension
  const changesState = editor.storage.aiChanges as any;
  return changesState?.getChanges?.() || [];
};

/**
 * Accept an AI change
 */
export const acceptAiChange = (editor: Editor | null, changeId: string) => {
  if (!editor) {
    return false;
  }

  try {
    return (editor.commands as any).acceptAiChange?.({ id: changeId }) ?? false;
  } catch (error) {
    console.error("Error accepting AI change:", error);
    return false;
  }
};

/**
 * Reject an AI change
 */
export const rejectAiChange = (editor: Editor | null, changeId: string) => {
  if (!editor) {
    return false;
  }

  try {
    return (editor.commands as any).rejectAiChange?.({ id: changeId }) ?? false;
  } catch (error) {
    console.error("Error rejecting AI change:", error);
    return false;
  }
};

/**
 * Accept all AI changes
 */
export const acceptAllAiChanges = (editor: Editor | null) => {
  if (!editor) {
    return false;
  }

  try {
    return (editor.commands as any).acceptAllAiChanges?.() ?? false;
  } catch (error) {
    console.error("Error accepting all AI changes:", error);
    return false;
  }
};

/**
 * Reject all AI changes
 */
export const rejectAllAiChanges = (editor: Editor | null) => {
  if (!editor) {
    return false;
  }

  try {
    return (editor.commands as any).rejectAllAiChanges?.() ?? false;
  } catch (error) {
    console.error("Error rejecting all AI changes:", error);
    return false;
  }
};

/**
 * Get the selected text in the editor
 */
export const getSelectedText = (editor: Editor | null): string => {
  if (!editor) {
    return "";
  }

  const { from, to } = editor.state.selection;
  return editor.state.doc.textBetween(from, to, " ");
};

/**
 * Get the document context for AI
 * Returns the full document text or a portion around the selection
 */
export const getDocumentContext = (
  editor: Editor | null,
  options?: {
    maxLength?: number;
    includeFullDocument?: boolean;
  }
): string => {
  if (!editor) {
    return "";
  }

  const { maxLength = 5000, includeFullDocument = false } = options || {};

  if (includeFullDocument) {
    const fullText = editor.getText();
    return fullText.length > maxLength ? fullText.slice(0, maxLength) : fullText;
  }

  // Get context around the current selection
  const { from, to } = editor.state.selection;
  const contextRange = 500; // Characters before and after selection

  const startPos = Math.max(0, from - contextRange);
  const endPos = Math.min(editor.state.doc.content.size, to + contextRange);

  return editor.state.doc.textBetween(startPos, endPos, " ");
};

/**
 * Format AI prompt with context
 */
export const formatAiPrompt = (
  prompt: string,
  options?: {
    includeSelection?: boolean;
    includeContext?: boolean;
    editor?: Editor | null;
  }
): string => {
  const { includeSelection = true, includeContext = true, editor } = options || {};

  let formattedPrompt = prompt;

  if (editor && includeSelection) {
    const selectedText = getSelectedText(editor);
    if (selectedText) {
      formattedPrompt = `Selected text: "${selectedText}"\n\n${prompt}`;
    }
  }

  if (editor && includeContext) {
    const context = getDocumentContext(editor, { maxLength: 1000 });
    if (context) {
      formattedPrompt = `Document context: "${context}"\n\n${formattedPrompt}`;
    }
  }

  return formattedPrompt;
};

/**
 * Get available tone presets
 */
export const getTonePresets = () => {
  return Object.entries(AI_TONE_PRESETS).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));
};

/**
 * Get available language presets
 */
export const getLanguagePresets = () => {
  return Object.entries(AI_LANGUAGE_PRESETS).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value,
  }));
};

/**
 * Type guard for checking if editor has AI extension
 */
export const hasAiExtension = (editor: Editor | null): boolean => {
  if (!editor) {
    return false;
  }
  return !!editor.extensionManager.extensions.find((ext) => ext.name === "ai");
};

/**
 * Type guard for checking if editor has AI Agent extension
 */
export const hasAiAgentExtension = (editor: Editor | null): boolean => {
  if (!editor) {
    return false;
  }
  return !!editor.extensionManager.extensions.find((ext) => ext.name === "aiAgent");
};

/**
 * Type guard for checking if editor has AI Suggestion extension
 */
export const hasAiSuggestionExtension = (editor: Editor | null): boolean => {
  if (!editor) {
    return false;
  }
  return !!editor.extensionManager.extensions.find((ext) => ext.name === "aiSuggestion");
};

/**
 * Type guard for checking if editor has AI Changes extension
 */
export const hasAiChangesExtension = (editor: Editor | null): boolean => {
  if (!editor) {
    return false;
  }
  return !!editor.extensionManager.extensions.find((ext) => ext.name === "aiChanges");
};
