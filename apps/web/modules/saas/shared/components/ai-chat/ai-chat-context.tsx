"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type Editor } from '@tiptap/react';
import { AIChatState, AIChatActions, AIMessage, AIProvider } from './types';

interface AIChatContextValue extends AIChatState, AIChatActions {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
}

const AIChatContext = createContext<AIChatContextValue | null>(null);

const AVAILABLE_PROVIDERS: AIProvider[] = [
  { id: 'gemini-free', name: 'Gemini 1.5 Flash (Free)', available: true },
  { id: 'openai-gpt4', name: 'GPT-4o', available: true },
];

export function AIChatProvider({ children }: { children: ReactNode }) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider['id']>('gemini-free');
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = useCallback(async (content: string, selectedText?: string) => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: selectedText ? `Selected text: "${selectedText}"\n\nRequest: ${content}` : content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          selectedText,
          provider: selectedProvider === 'gemini-free' ? 'gemini' : 'openai',
          history: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        provider: selectedProvider === 'gemini-free' ? 'gemini' : 'openai',
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        provider: selectedProvider === 'gemini-free' ? 'gemini' : 'openai',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvider, messages]);

  const setProvider = useCallback((provider: AIProvider['id']) => {
    setSelectedProvider(provider);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const insertTextToEditor = useCallback((text: string) => {
    if (!editor) return;

    const { selection } = editor.state;
    const { from, to } = selection;

    editor.chain()
      .focus()
      .deleteRange({ from, to })
      .insertContent(text)
      .run();
  }, [editor]);

  const value: AIChatContextValue = {
    // State
    messages,
    isLoading,
    selectedProvider,
    isOpen,
    editor,
    
    // Actions
    sendMessage,
    setProvider,
    toggleChat,
    clearMessages,
    insertTextToEditor,
    setEditor,
  };

  return (
    <AIChatContext.Provider value={value}>
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error('useAIChat must be used within AIChatProvider');
  }
  return context;
}

export { AVAILABLE_PROVIDERS };