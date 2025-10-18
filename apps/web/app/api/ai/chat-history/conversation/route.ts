import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { db } from '@repo/database';
import { headers } from 'next/headers';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: any[];
  snippets?: any[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, userMessage, aiMessage, title } = body;

    if (!documentId || !userMessage || !aiMessage) {
      return NextResponse.json(
        { error: 'Document ID, user message, and AI message are required' },
        { status: 400 }
      );
    }

    // Find existing chat or create new one
    let chatHistory = await db.aiChat.findFirst({
      where: {
        documentId,
        userId: session.user.id,
      },
    });

    const messages = [userMessage, aiMessage];

    if (chatHistory) {
      // Update existing chat with both messages
      const existingMessages = (chatHistory.messages as unknown as ChatMessage[]) || [];
      chatHistory = await db.aiChat.update({
        where: { id: chatHistory.id },
        data: {
          messages: [...existingMessages, ...messages],
          title: title || chatHistory.title,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new chat with both messages
      chatHistory = await db.aiChat.create({
        data: {
          documentId,
          userId: session.user.id,
          messages,
          title: title || 'New Chat',
        },
      });
    }

    return NextResponse.json({
      chatId: chatHistory.id,
      messages: chatHistory.messages || [],
      title: chatHistory.title || 'Chat',
    });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    );
  }
}
