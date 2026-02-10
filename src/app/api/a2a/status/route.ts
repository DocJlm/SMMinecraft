import { NextRequest, NextResponse } from 'next/server';
import { kvGet, KEYS } from '@/lib/kv';
import { Conversation } from '@/types';

export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get('id');
  if (!conversationId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const conv = await kvGet<Conversation>(KEYS.conversation(conversationId));
  if (!conv) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ conversation: conv });
}
