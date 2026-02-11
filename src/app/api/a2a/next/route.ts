import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { executeNextRound } from '@/lib/a2a-engine';
import { kvGet, KEYS } from '@/lib/kv';
import { Conversation } from '@/types';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId } = await request.json();
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
  }

  try {
    const conv = await kvGet<Conversation>(KEYS.conversation(conversationId));
    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conv.status === 'completed' || conv.status === 'error') {
      return NextResponse.json({ conversation: conv });
    }

    const updated = await executeNextRound(conversationId, conv);
    return NextResponse.json({ conversation: updated });
  } catch (error: unknown) {
    console.error('A2A next round error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
