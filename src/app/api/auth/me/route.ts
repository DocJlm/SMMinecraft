import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { kvGet, KEYS } from '@/lib/kv';
import { StoredUser } from '@/types';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const stored = await kvGet<StoredUser>(KEYS.user(userId));
  if (!stored) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: stored.user, shades: stored.shades || [] });
}
