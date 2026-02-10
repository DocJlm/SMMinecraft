import { NextResponse } from 'next/server';
import { getSessionUserId, clearSessionCookie } from '@/lib/auth';
import { kvDel, KEYS } from '@/lib/kv';

export async function POST() {
  const userId = await getSessionUserId();
  if (userId) {
    await kvDel(KEYS.player(userId));
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
