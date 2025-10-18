import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@repo/auth';
import { db } from '@repo/database';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Fetch all chats for the user, ordered by most recent
    const chats = await db.aiChat.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        documentId: true,
        updatedAt: true,
        messages: true,
      },
    });

    // Return chats with message count
    const chatsWithMetadata = chats.map(chat => ({
      id: chat.id,
      title: chat.title || 'Untitled Chat',
      documentId: chat.documentId,
      updatedAt: chat.updatedAt,
      messageCount: Array.isArray(chat.messages) ? chat.messages.length : 0,
    }));

    return NextResponse.json({
      chats: chatsWithMetadata,
      total: chatsWithMetadata.length,
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}
