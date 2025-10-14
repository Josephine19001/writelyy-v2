/**
 * Tiptap AI Configuration
 *
 * This file contains the configuration for Tiptap Pro AI extensions.
 * It handles AI token management, streaming, and command configuration.
 */

import type { AiOptions } from "@tiptap-pro/extension-ai";

/**
 * AI Extension Configuration
 * Configures the core AI extension for text generation
 */
export const getAiExtensionConfig = (aiToken: string | null): Partial<AiOptions> => {
  if (!aiToken) {
    console.warn("AI token not available");
  }

  return {
    // Tiptap Cloud configuration
    appId: process.env.NEXT_PUBLIC_TIPTAP_AI_APP_ID || "",
    token: aiToken || "",

    // Enable autocompletion
    autocompletion: true,

    // Callbacks for AI events
    onLoading: () => {
      console.log("AI is generating...");
    },
    onSuccess: () => {
      console.log("AI generation completed");
    },
    onError: (error) => {
      console.error("AI generation error:", error);
    },
  };
};

/**
 * AI Agent Configuration
 * Configures the AI Agent extension for document editing
 */
export const getAiAgentConfig = (aiToken: string | null): Record<string, any> => {
  if (!aiToken) {
    console.warn("AI Agent token not available");
  }

  return {
    appId: process.env.NEXT_PUBLIC_TIPTAP_AI_APP_ID,
    token: aiToken || "",

    // Enable the AI agent to read and edit the document
    enableDocumentReading: true,
    enableDocumentEditing: true,

    // System prompt for the AI agent
    systemPrompt: "You are a helpful writing assistant. Help users improve their documents by making thoughtful edits and suggestions.",
  };
};

/**
 * AI Suggestions Configuration
 * Configures the AI Suggestion extension for proofreading
 */
export const getAiSuggestionConfig = (aiToken: string | null): Record<string, any> => {
  if (!aiToken) {
    console.warn("AI Suggestion token not available");
  }

  return {
    appId: process.env.NEXT_PUBLIC_TIPTAP_AI_APP_ID,
    token: aiToken || "",

    // Define proofreading rules
    rules: [
      {
        id: "spelling",
        name: "Spelling",
        description: "Check for spelling errors",
        enabled: true,
      },
      {
        id: "grammar",
        name: "Grammar",
        description: "Check for grammar errors",
        enabled: true,
      },
      {
        id: "clarity",
        name: "Clarity",
        description: "Improve clarity and readability",
        enabled: true,
      },
      {
        id: "conciseness",
        name: "Conciseness",
        description: "Remove unnecessary words",
        enabled: true,
      },
    ],

    // Auto-update suggestions when content changes
    autoUpdate: true,

    // Debounce time in ms before generating new suggestions
    debounce: 1000,
  };
};

/**
 * AI Changes Configuration
 * Configures the AI Changes extension for tracking AI-generated changes
 */
export const getAiChangesConfig = (): Record<string, any> => {
  return {
    // Track all AI-generated changes
    trackChanges: true,

    // Allow users to accept/reject changes
    allowAcceptReject: true,

    // Highlight color for AI changes
    highlightColor: "rgba(59, 130, 246, 0.2)", // Blue highlight
  };
};

/**
 * OpenAI Model Configuration
 * Configure which OpenAI models to use for different tasks
 */
export const AI_MODELS = {
  // Main text generation model
  textGeneration: "gpt-4o",

  // Fast responses for simple tasks
  simple: "gpt-4o-mini",

  // Advanced reasoning
  advanced: "gpt-4o",

  // Image generation
  imageGeneration: "dall-e-3",
} as const;

/**
 * AI Command Presets
 * Predefined tone and style presets for AI commands
 */
export const AI_TONE_PRESETS = {
  professional: "professional",
  casual: "casual",
  friendly: "friendly",
  formal: "formal",
  technical: "technical",
  creative: "creative",
  academic: "academic",
  persuasive: "persuasive",
  humorous: "humorous",
  empathetic: "empathetic",
} as const;

export const AI_LANGUAGE_PRESETS = {
  auto: "auto",
  english: "en",
  spanish: "es",
  french: "fr",
  german: "de",
  italian: "it",
  portuguese: "pt",
  chinese: "zh",
  japanese: "ja",
  korean: "ko",
  arabic: "ar",
} as const;

/**
 * Feature Flags
 * Control which AI features are enabled
 */
export const AI_FEATURES = {
  // Core AI generation
  textGeneration: true,

  // AI Agent for document editing
  aiAgent: true,

  // AI Suggestions for proofreading
  aiSuggestions: true,

  // Track AI changes
  trackChanges: true,

  // Image generation
  imageGeneration: false, // Set to true when enabled

  // Custom LLM integration
  customLLM: false, // Set to true for custom backend
} as const;
