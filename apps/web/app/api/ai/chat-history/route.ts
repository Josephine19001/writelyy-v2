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

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Fetch chat history for the document
    const chatHistory = await db.aiChat.findFirst({
      where: {
        documentId,
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!chatHistory) {
      return NextResponse.json({
        chatId: null,
        messages: [],
        title: 'New Chat',
      });
    }

    return NextResponse.json({
      chatId: chatHistory.id,
      messages: chatHistory.messages || [],
      title: chatHistory.title || 'Chat',
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
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
    const { documentId, message, title } = body;

    if (!documentId || !message) {
      return NextResponse.json(
        { error: 'Document ID and message are required' },
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

    if (chatHistory) {
      // Update existing chat
      const existingMessages = (chatHistory.messages as unknown as ChatMessage[]) || [];
      chatHistory = await db.aiChat.update({
        where: { id: chatHistory.id },
        data: {
          messages: [...existingMessages, message],
          title: title || chatHistory.title,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new chat
      chatHistory = await db.aiChat.create({
        data: {
          documentId,
          userId: session.user.id,
          messages: [message],
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
    console.error('Error saving chat message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Delete chat history for the document
    await db.aiChat.deleteMany({
      where: {
        documentId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat history:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat history' },
      { status: 500 }
    );
  }
}
