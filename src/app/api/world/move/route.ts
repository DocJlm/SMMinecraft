import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/auth';
import { kvGet, kvSet, KEYS } from '@/lib/kv';
import { PlayerState, Position, ZoneType } from '@/types';
import { getZoneAtPosition } from '@/lib/world-config';

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { x, y, z } = body as Position;

  const player = await kvGet<PlayerState>(KEYS.player(userId));
  if (!player) return NextResponse.json({ error: 'Not in world' }, { status: 400 });

  const zone = getZoneAtPosition({ x, y, z });

  player.position = { x, y, z };
  player.zone = (zone?.id || 'none') as ZoneType;
  player.lastSeen = Date.now();
  player.isOnline = true;

  await kvSet(KEYS.player(userId), player, { ex: 300 });

  return NextResponse.json({ zone: player.zone });
}
