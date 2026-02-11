import { NextRequest, NextResponse } from 'next/server';
import { kvGet, KEYS } from '@/lib/kv';
import { Conversation } from '@/types';
import { getConversationCount } from '@/lib/a2a-engine';

export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get('id');

  // If no id provided, return global conversation count
  if (!conversationId) {
    const count = await getConversationCount();
    return NextResponse.json({ conversationCount: count });
  }

  const conv = await kvGet<Conversation>(KEYS.conversation(conversationId));
  if (!conv) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ conversation: conv });
}
