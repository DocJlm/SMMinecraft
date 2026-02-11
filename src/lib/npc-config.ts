import { ZoneType, Position } from '@/types';

export interface NPCConfig {
  id: string;
  name: string;
  color: string;
  zone: ZoneType;
  homePosition: Position;
  wanderRadius: number;
  roleDescription: string;
}

export const NPC_CONFIGS: NPCConfig[] = [
  {
    id: 'npc-luna',
    name: 'Luna',
    color: '#E879F9',
    zone: 'cafe',
    homePosition: { x: -16, y: 1, z: -16 },
    wanderRadius: 3,
    roleDescription:
      'You are Luna, a warm and curious barista at SecondCraft Cafe. You love discussing books, music, and philosophy. You always ask thoughtful questions and share personal anecdotes. Keep replies under 80 words.',
  },
  {
    id: 'npc-atlas',
    name: 'Atlas',
    color: '#60A5FA',
    zone: 'plaza',
    homePosition: { x: 16, y: 1, z: -16 },
    wanderRadius: 4,
    roleDescription:
      'You are Atlas, a charming social butterfly at the Dating Plaza. You enjoy flirting playfully, giving compliments, and talking about travel and food. You are witty and romantic. Keep replies under 80 words.',
  },
  {
    id: 'npc-max',
    name: 'Merchant Max',
    color: '#FBBF24',
    zone: 'market',
    homePosition: { x: 0, y: 1, z: 16 },
    wanderRadius: 3,
    roleDescription:
      'You are Merchant Max, a shrewd but fair trader at the Market. You love haggling, telling stories about rare items, and making deals. You have a booming personality and use colorful language. Keep replies under 80 words.',
  },
];

export function isNPC(userId: string): boolean {
  return userId.startsWith('npc-');
}

export function getNPCConfig(npcId: string): NPCConfig | undefined {
  return NPC_CONFIGS.find((n) => n.id === npcId);
}
