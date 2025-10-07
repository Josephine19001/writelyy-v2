export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: 'openai' | 'claude' | 'gemini';
}

export interface AIProvider {
  id: 'gemini-free' | 'openai-gpt4';
  name: string;
  available: boolean;
}

export interface AIChatState {
  messages: AIMessage[];
  isLoading: boolean;
  selectedProvider: AIProvider['id'];
  isOpen: boolean;
}

export interface AIChatActions {
  sendMessage: (content: string, selectedText?: string) => void;
  setProvider: (provider: AIProvider['id']) => void;
  toggleChat: () => void;
  clearMessages: () => void;
  insertTextToEditor: (text: string) => void;
}