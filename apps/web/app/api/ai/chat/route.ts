import { NextRequest, NextResponse } from 'next/server';

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

interface ChatRequest {
  prompt: string;
  sources?: SourceContext[];
  snippets?: SnippetContext[];
  documentId?: string;
  documentContext?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { prompt, sources, snippets, documentContext } = body;

    // Build enhanced prompt with context
    let enhancedPrompt = prompt;
    const contextParts: string[] = [];

    // Add document context if available
    if (documentContext && documentContext.trim()) {
      const docPreview = documentContext.slice(0, 2000);
      contextParts.push(`Current Document:\n${docPreview}${documentContext.length > 2000 ? '...' : ''}`);
    }

    // Add snippet context
    if (snippets && snippets.length > 0) {
      const snippetDetails = snippets.map((snippet, idx) =>
        `${idx + 1}. "${snippet.title}":\n${snippet.content}`
      ).join('\n\n');
      contextParts.push(`Snippets:\n${snippetDetails}`);
    }

    // Add source context
    if (sources && sources.length > 0) {
      const sourceDetails = sources.map((source, idx) => {
        const parts = [`${idx + 1}. "${source.name}" (${source.type})`];
        if (source.content) {
          const contentPreview = source.content.slice(0, 1000);
          parts.push(`Content: ${contentPreview}${source.content.length > 1000 ? '...' : ''}`);
        }
        return parts.join('\n');
      }).join('\n\n');
      contextParts.push(`Sources:\n${sourceDetails}`);
    }

    // Build final prompt with context
    if (contextParts.length > 0) {
      enhancedPrompt = `${prompt}\n\n--- Context ---\n${contextParts.join('\n\n')}\n--- End Context ---`;
    }

    // Call OpenAI API
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant integrated into a document editor. Help users with their writing, answer questions, provide suggestions, and assist with content creation. Be conversational, helpful, and concise. If given context from sources or snippets, use that information to provide better answers.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', response.status, error);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}