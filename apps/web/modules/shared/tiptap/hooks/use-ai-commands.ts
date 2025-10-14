/**
 * React hook for Tiptap AI commands
 *
 * Provides easy access to AI commands and functionality
 */

"use client";

import { useCallback, useMemo } from "react";
import type { Editor } from "@tiptap/core";
import {
  executeAiCommand,
  acceptAiContent,
  rejectAiContent,
  stopAiGeneration,
  isAiGenerating,
  getAiSuggestions,
  acceptAiSuggestion,
  rejectAiSuggestion,
  getAiChanges,
  acceptAiChange,
  rejectAiChange,
  acceptAllAiChanges,
  rejectAllAiChanges,
  getSelectedText,
  getDocumentContext,
  hasAiExtension,
  hasAiAgentExtension,
  hasAiSuggestionExtension,
  hasAiChangesExtension,
} from "../lib/tiptap-ai-utils";
import { AI_TONE_PRESETS, AI_LANGUAGE_PRESETS } from "../config/ai-config";

export interface UseAiCommandsOptions {
  editor: Editor | null;
}

export interface AiCommandOptions {
  tone?: string;
  language?: string;
  text?: string;
  stream?: boolean;
}

/**
 * Hook for working with Tiptap AI commands
 */
export function useAiCommands({ editor }: UseAiCommandsOptions) {
  // Check if AI extensions are available
  const hasAi = useMemo(() => hasAiExtension(editor), [editor]);
  const hasAiAgent = useMemo(() => hasAiAgentExtension(editor), [editor]);
  const hasAiSuggestion = useMemo(() => hasAiSuggestionExtension(editor), [editor]);
  const hasAiChanges = useMemo(() => hasAiChangesExtension(editor), [editor]);

  // AI Command Executors
  const improve = useCallback(
    (options?: AiCommandOptions) => {
      return executeAiCommand(editor, "improve", options);
    },
    [editor]
  );

  const fixSpelling = useCallback(
    (options?: AiCommandOptions) => {
      return executeAiCommand(editor, "fixSpelling", options);
    },
    [editor]
  );

  const makeShorter = useCallback(
    (options?: AiCommandOptions) => {
      return executeAiCommand(editor, "makeShorter", options);
    },
    [editor]
  );

  const makeLonger = useCallback(
    (options?: AiCommandOptions) => {
      return executeAiCommand(editor, "makeLonger", options);
    },
    [editor]
  );

  const simplify = useCallback(
    (options?: AiCommandOptions) => {
      return executeAiCommand(editor, "simplify", options);
    },
    [editor]
  );

  const emojify = useCallback(
    (options?: AiCommandOptions) => {
      return executeAiCommand(editor, "emojify", options);
    },
    [editor]
  );

  const changeTone = useCallback(
    (options?: AiCommandOptions) => {
      return executeAiCommand(editor, "changeTone", options);
    },
    [editor]
  );

  const translate = useCallback(
    (options?: AiCommandOptions) => {
      return executeAiCommand(editor, "translate", options);
    },
    [editor]
  );

  const customPrompt = useCallback(
    (options?: AiCommandOptions) => {
      return executeAiCommand(editor, "custom", options);
    },
    [editor]
  );

  // AI Content Management
  const accept = useCallback(() => {
    return acceptAiContent(editor);
  }, [editor]);

  const reject = useCallback((options?: { type?: "reset" | "undo" }) => {
    return rejectAiContent(editor, options);
  }, [editor]);

  const stop = useCallback(() => {
    return stopAiGeneration(editor);
  }, [editor]);

  const isGenerating = useCallback(() => {
    return isAiGenerating(editor);
  }, [editor]);

  // AI Suggestions (if enabled)
  const suggestions = useMemo(() => {
    if (!hasAiSuggestion) return [];
    return getAiSuggestions(editor);
  }, [editor, hasAiSuggestion]);

  const acceptSuggestion = useCallback(
    (suggestionId: string) => {
      return acceptAiSuggestion(editor, suggestionId);
    },
    [editor]
  );

  const rejectSuggestion = useCallback(
    (suggestionId: string) => {
      return rejectAiSuggestion(editor, suggestionId);
    },
    [editor]
  );

  // AI Changes (if enabled)
  const changes = useMemo(() => {
    if (!hasAiChanges) return [];
    return getAiChanges(editor);
  }, [editor, hasAiChanges]);

  const acceptChange = useCallback(
    (changeId: string) => {
      return acceptAiChange(editor, changeId);
    },
    [editor]
  );

  const rejectChange = useCallback(
    (changeId: string) => {
      return rejectAiChange(editor, changeId);
    },
    [editor]
  );

  const acceptAllChanges = useCallback(() => {
    return acceptAllAiChanges(editor);
  }, [editor]);

  const rejectAllChanges = useCallback(() => {
    return rejectAllAiChanges(editor);
  }, [editor]);

  // Utility functions
  const selectedText = useMemo(() => {
    return getSelectedText(editor);
  }, [editor]);

  const documentContext = useCallback(
    (options?: { maxLength?: number; includeFullDocument?: boolean }) => {
      return getDocumentContext(editor, options);
    },
    [editor]
  );

  // Predefined commands for easy access
  const commands = useMemo(
    () => ({
      improve,
      fixSpelling,
      makeShorter,
      makeLonger,
      simplify,
      emojify,
      changeTone,
      translate,
      customPrompt,
    }),
    [
      improve,
      fixSpelling,
      makeShorter,
      makeLonger,
      simplify,
      emojify,
      changeTone,
      translate,
      customPrompt,
    ]
  );

  // Content management
  const contentActions = useMemo(
    () => ({
      accept,
      reject,
      stop,
      isGenerating,
    }),
    [accept, reject, stop, isGenerating]
  );

  // Suggestion management
  const suggestionActions = useMemo(
    () => ({
      suggestions,
      acceptSuggestion,
      rejectSuggestion,
    }),
    [suggestions, acceptSuggestion, rejectSuggestion]
  );

  // Change management
  const changeActions = useMemo(
    () => ({
      changes,
      acceptChange,
      rejectChange,
      acceptAllChanges,
      rejectAllChanges,
    }),
    [changes, acceptChange, rejectChange, acceptAllChanges, rejectAllChanges]
  );

  // Utility functions
  const utils = useMemo(
    () => ({
      selectedText,
      documentContext,
      tonePresets: AI_TONE_PRESETS,
      languagePresets: AI_LANGUAGE_PRESETS,
    }),
    [selectedText, documentContext]
  );

  // Feature flags
  const features = useMemo(
    () => ({
      hasAi,
      hasAiAgent,
      hasAiSuggestion,
      hasAiChanges,
    }),
    [hasAi, hasAiAgent, hasAiSuggestion, hasAiChanges]
  );

  return {
    commands,
    contentActions,
    suggestionActions,
    changeActions,
    utils,
    features,
  };
}
