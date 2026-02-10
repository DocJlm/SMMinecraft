import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { kvDel, KEYS } from '@/lib/kv';

export async function POST() {
  const userId = await getSessionUserId();
  if (userId) {
    await kvDel(KEYS.player(userId));
  }
  return NextResponse.json({ ok: true });
}
