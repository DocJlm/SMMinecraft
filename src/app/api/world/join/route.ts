import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { kvGet, kvSet, KEYS } from '@/lib/kv';
import { StoredUser, PlayerState } from '@/types';
import { SPAWN_POSITION, getPlayerColor, getRandomItems } from '@/lib/world-config';

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stored = await kvGet<StoredUser>(KEYS.user(userId));
  if (!stored) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const player: PlayerState = {
    userId,
    name: stored.user.name,
    avatar: stored.user.avatar,
    position: SPAWN_POSITION,
    color: getPlayerColor(userId),
    zone: 'none',
    lastSeen: Date.now(),
    isOnline: true,
  };

  await kvSet(KEYS.player(userId), player, { ex: 300 });

  const inv = await kvGet(KEYS.inventory(userId));
  if (!inv) {
    await kvSet(KEYS.inventory(userId), {
      userId,
      items: getRandomItems(3),
      coins: 100,
    }, { ex: 86400 * 7 });
  }

  return NextResponse.json({ player });
}
