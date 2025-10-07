import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  selectedText?: string;
  provider: 'gemini-free' | 'openai-gpt4';
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

async function callOpenAI(messages: Array<{ role: string; content: string }>, model: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'No response generated.';
}

async function callClaude(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key not configured');
  }

  // Convert messages format for Claude
  const systemMessage = "You are a helpful writing assistant integrated into a document editor. Help users improve their writing, generate content, and answer questions about their text.";
  const claudeMessages = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022', // Latest Claude 3.5 Sonnet
      max_tokens: 1000,
      system: systemMessage,
      messages: claudeMessages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || 'No response generated.';
}

async function callGemini(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key not configured');
  }

  // Convert messages for Gemini format
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || 'No response generated.';
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, selectedText, provider, history } = body;

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful writing assistant integrated into a document editor. Help users improve their writing, generate content, and answer questions about their text. Be concise and practical.'
      },
      ...history,
      {
        role: 'user',
        content: selectedText ? `Selected text: "${selectedText}"\n\nRequest: ${message}` : message
      }
    ];

    let content: string;

    switch (provider) {
      case 'openai-gpt4':
        content = await callOpenAI(messages, 'gpt-4o');
        break;
      case 'gemini-free':
        content = await callGemini(messages);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return NextResponse.json({ content });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}