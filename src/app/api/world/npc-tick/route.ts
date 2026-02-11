import { NextResponse } from 'next/server';
import { kvSet, KEYS } from '@/lib/kv';
import { NPC_CONFIGS } from '@/lib/npc-config';
import { PlayerState } from '@/types';

export async function POST() {
  try {
    for (const npc of NPC_CONFIGS) {
      // Random walk within wander radius of home position
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * npc.wanderRadius;
      const x = npc.homePosition.x + Math.cos(angle) * dist;
      const z = npc.homePosition.z + Math.sin(angle) * dist;

      const player: PlayerState = {
        userId: npc.id,
        name: npc.name,
        avatar: '',
        position: { x: Math.round(x * 10) / 10, y: 1, z: Math.round(z * 10) / 10 },
        color: npc.color,
        zone: npc.zone,
        lastSeen: Date.now(),
        isOnline: true,
      };

      await kvSet(KEYS.player(npc.id), player, { ex: 60 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('NPC tick error:', error);
    return NextResponse.json({ error: 'NPC tick failed' }, { status: 500 });
  }
}
