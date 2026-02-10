import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { createConversation, executeNextRound } from '@/lib/a2a-engine';
import { ConversationMode } from '@/types';

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { targetUserId, mode } = await request.json();
  if (!targetUserId || !mode) {
    return NextResponse.json({ error: 'Missing targetUserId or mode' }, { status: 400 });
  }

  try {
    const conv = await createConversation(userId, targetUserId, mode as ConversationMode);
    const updated = await executeNextRound(conv.id);
    return NextResponse.json({ conversation: updated });
  } catch (error: unknown) {
    console.error('A2A chat error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
