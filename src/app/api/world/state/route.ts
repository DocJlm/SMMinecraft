import { NextResponse } from 'next/server';
import { kvGet, kvKeys, KEYS } from '@/lib/kv';
import { PlayerState, WorldState } from '@/types';
import { PLAYER_TIMEOUT } from '@/lib/world-config';

export async function GET() {
  const keys = await kvKeys(KEYS.playersPattern());
  const players: Record<string, PlayerState> = {};
  let onlineCount = 0;

  const now = Date.now();
  for (const key of keys) {
    const player = await kvGet<PlayerState>(key);
    if (player && now - player.lastSeen < PLAYER_TIMEOUT) {
      player.isOnline = true;
      players[player.userId] = player;
      onlineCount++;
    }
  }

  const state: WorldState = { players, onlineCount };
  return NextResponse.json(state);
}
