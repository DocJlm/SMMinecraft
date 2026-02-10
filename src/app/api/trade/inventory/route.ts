import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { kvGet, KEYS } from '@/lib/kv';
import { PlayerInventory } from '@/types';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const inv = await kvGet<PlayerInventory>(KEYS.inventory(userId));
  return NextResponse.json({ inventory: inv || { userId, items: [], coins: 0 } });
}
