import { Zone, Position, TradeItem } from '@/types';

export const WORLD_SIZE = 64;
export const PLAYER_TIMEOUT = 30000;
export const POLL_INTERVAL = 2000;
export const POSITION_REPORT_INTERVAL = 2000;

export const ZONES: Zone[] = [
  {
    id: 'cafe',
    name: '☕ Cafe',
    nameEn: 'Cafe',
    emoji: '☕',
    description: 'AI free chat, share interests',
    center: { x: -16, y: 0, z: -16 },
    radius: 8,
    color: '#8B4513',
    buildingHeight: 5,
  },
  {
    id: 'plaza',
    name: '💕 Dating Plaza',
    nameEn: 'Dating Plaza',
    emoji: '💕',
    description: 'AI dating, compatibility scoring',
    center: { x: 16, y: 0, z: -16 },
    radius: 10,
    color: '#FF69B4',
    buildingHeight: 3,
  },
  {
    id: 'market',
    name: '🏪 Market',
    nameEn: 'Market',
    emoji: '🏪',
    description: 'AI negotiation, auto trading',
    center: { x: 0, y: 0, z: 16 },
    radius: 8,
    color: '#DAA520',
    buildingHeight: 4,
  },
];

export function getZoneAtPosition(pos: Position): Zone | null {
  for (const zone of ZONES) {
    const dx = pos.x - zone.center.x;
    const dz = pos.z - zone.center.z;
    if (Math.sqrt(dx * dx + dz * dz) <= zone.radius) {
      return zone;
    }
  }
  return null;
}

export function getPlayerColor(userId: string): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const SPAWN_POSITION: Position = { x: 0, y: 1, z: 0 };

export const TRADE_ITEMS: TradeItem[] = [
  { id: 'diamond', name: 'Diamond', emoji: '💎', rarity: 'epic', value: 100 },
  { id: 'gold', name: 'Gold', emoji: '🥇', rarity: 'rare', value: 50 },
  { id: 'iron', name: 'Iron', emoji: '⚙️', rarity: 'common', value: 20 },
  { id: 'wood', name: 'Wood', emoji: '🪵', rarity: 'common', value: 5 },
  { id: 'apple', name: 'Apple', emoji: '🍎', rarity: 'common', value: 3 },
  { id: 'book', name: 'Magic Book', emoji: '📕', rarity: 'rare', value: 40 },
  { id: 'potion', name: 'Potion', emoji: '🧪', rarity: 'rare', value: 35 },
  { id: 'star', name: 'Star Shard', emoji: '⭐', rarity: 'epic', value: 80 },
];

export function getRandomItems(count: number): TradeItem[] {
  const shuffled = [...TRADE_ITEMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getTerrainHeight(x: number, z: number): number {
  const scale = 0.1;
  const h = Math.sin(x * scale) * Math.cos(z * scale) * 2 +
            Math.sin(x * scale * 2.3 + 1.5) * Math.cos(z * scale * 1.7) * 1;
  return Math.max(0, Math.floor(h));
}

/** Check if a world position is blocked by a building wall. */
export function isPositionBlocked(px: number, pz: number): boolean {
  const pr = 0.4; // player collision radius

  for (const zone of ZONES) {
    const r = Math.floor(zone.radius * 0.55);
    const cx = zone.center.x;
    const cz = zone.center.z;
    const t = 0.5 + pr; // wall half-thickness + player radius

    // West wall (x = cx - r)
    if (Math.abs(px - (cx - r)) < t &&
        pz >= cz - r - t && pz <= cz + r + t) {
      return true;
    }
    // East wall (x = cx + r)
    if (Math.abs(px - (cx + r)) < t &&
        pz >= cz - r - t && pz <= cz + r + t) {
      return true;
    }
    // Back wall (z = cz + r)
    if (Math.abs(pz - (cz + r)) < t &&
        px >= cx - r - t && px <= cx + r + t) {
      return true;
    }
    // Front wall (z = cz - r) — has door gap at |x - cx| <= 1
    if (Math.abs(pz - (cz - r)) < t &&
        px >= cx - r - t && px <= cx + r + t) {
      // Allow through if within door opening
      if (Math.abs(px - cx) > 1.5) {
        return true;
      }
    }
  }
  return false;
}
