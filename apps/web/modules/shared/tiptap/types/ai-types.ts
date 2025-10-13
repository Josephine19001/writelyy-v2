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
  | "professional"
  | "casual"
  | "straightforward"
  | "confident"
  | "friendly"
  | "academic"
  | "business"
  | "technical"
  | "creative"
  | "persuasive"
  | "empathetic"
  | "formal"
  | "childfriendly"
  | "conversational"
  | "emotional"
  | "excited"
  | "funny"
  | "humorous"
  | "informative"
  | "inspirational"
  | "memeify"
  | "narrative"
  | "objective"
  | "poetic"
  | string; // Allow any string for custom tones

export interface TextOptions {
  tone?: Tone;
  language?: Language;
  style?: string;
  format?: string;
  // Additional properties for AI commands
  text?: string;
  insertAt?: number;
  stream?: boolean;
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
