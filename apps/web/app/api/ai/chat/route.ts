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
            content: `You are a helpful AI assistant integrated into a document editor. Help users with their writing, answer questions, provide suggestions, and assist with content creation.

IMPORTANT FORMATTING RULES:
1. Format your responses using HTML tags for rich formatting
2. Use <p> for paragraphs, <strong> for bold, <em> for emphasis, <ul>/<ol> for lists
3. Use <h3> or <h4> for headings (not h1 or h2)
4. Use <code> for inline code and <pre><code> for code blocks
5. Use <a href="..."> for links

DOCUMENT CHANGES - IMPORTANT:
ONLY use the document-change format when the user EXPLICITLY asks you to:
- Add/insert/write content to the document
- Improve/enhance/extend a section
- Create/generate new content for insertion
- Rewrite/update/modify document text
- Fix/correct the entire document

Keywords that indicate document changes: "add", "insert", "write", "create", "improve", "enhance", "extend", "rewrite", "update", "modify", "generate", "fix", "correct"

When user requests document changes, use this format with an action attribute:
<document-change action="insert">  <!-- or action="replace" -->
<p>I'll add this section for you:</p>
<change-content>
<h3>Your Heading</h3>
<p>Your content here...</p>
</change-content>
</document-change>

Action Types:
- action="insert" - For adding NEW content (use for: "add", "insert", "write", "create")
- action="replace" - For modifying EXISTING content (use for: "improve", "fix", "rewrite", "modify", "update", "correct the whole document", "make necessary fixes")

For regular chat (questions, explanations, summaries), just use HTML formatting WITHOUT the document-change wrapper.

Examples:
- "Can you summarize this?" → Regular HTML response
- "What does this mean?" → Regular HTML response
- "Add a section about X" → <document-change action="insert">
- "Improve this paragraph" → <document-change action="replace">
- "Fix the whole document" → <document-change action="replace">
- "Make necessary fixes" → <document-change action="replace">`
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