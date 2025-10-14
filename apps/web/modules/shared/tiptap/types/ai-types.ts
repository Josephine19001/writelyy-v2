/**
 * Custom AI type definitions to replace @tiptap-pro/extension-ai types
 * These types are used throughout the AI menu components
 */

export type Language =
  | "auto"
  | "ar"
  | "zh"
  | "cs"
  | "da"
  | "nl"
  | "en"
  | "fi"
  | "fr"
  | "de"
  | "el"
  | "he"
  | "hi"
  | "hu"
  | "id"
  | "it"
  | "ja"
  | "ko"
  | "no"
  | "pl"
  | "pt"
  | "ro"
  | "ru"
  | "es"
  | "sv"
  | "th"
  | "tr"
  | "uk"
  | "vi";

export type Tone =
  | "academic"
  | "business"
  | "casual"
  | "childfriendly"
  | "confident"
  | "conversational"
  | "creative"
  | "emotional"
  | "excited"
  | "formal"
  | "friendly"
  | "funny"
  | "humorous"
  | "informative"
  | "inspirational"
  | "memeify"
  | "narrative"
  | "objective"
  | "persuasive"
  | "poetic"
  | "professional"
  | "straightforward"
  | "technical"
  | "empathetic"
  | string; // Allow any custom tone string

export interface TextOptions {
  tone?: Tone;
  language?: Language;
  style?: string;
  format?: string;
  // Additional properties for AI commands
  text?: string;
  insertAt?: number | { from: number; to: number };
  stream?: boolean;
  regenerate?: boolean;
}

export interface AICommandOptions {
  text?: string;
  tone?: Tone;
  language?: Language;
  options?: TextOptions;
}

export interface AIMenuItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  action: (options?: AICommandOptions) => void;
}

export interface AIMenuSection {
  title: string;
  items: AIMenuItem[];
}
