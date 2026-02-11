// ===== User & Auth =====
export interface SecondMeUser {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  selfIntroduction: string;
  profileCompleteness: number;
  route: string;
}

export interface SecondMeShade {
  id: number;
  shadeName: string;
  shadeIcon: string;
  confidenceLevel: string;
  shadeDescription: string;
  shadeContent: string;
  hasPublicContent: boolean;
  shadeNamePublic: string;
  shadeDescriptionPublic: string;
  shadeContentPublic: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string[];
}

export interface StoredUser {
  user: SecondMeUser;
  tokens: AuthTokens;
  shades?: SecondMeShade[];
  joinedAt: number;
}

// ===== World & Player =====
export type ZoneType = 'cafe' | 'plaza' | 'market' | 'none';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface PlayerState {
  userId: string;
  name: string;
  avatar: string;
  position: Position;
  color: string;
  zone: ZoneType;
  lastSeen: number;
  isOnline: boolean;
}

export interface WorldState {
  players: Record<string, PlayerState>;
  onlineCount: number;
}

export interface Zone {
  id: ZoneType;
  name: string;
  nameEn: string;
  emoji: string;
  description: string;
  center: Position;
  radius: number;
  color: string;
  buildingHeight: number;
}

// ===== A2A Conversation =====
export type ConversationMode = 'chat' | 'dating' | 'trade';
export type ConversationStatus = 'pending' | 'active' | 'completed' | 'error';

export interface ConversationMessage {
  round: number;
  speaker: 'A' | 'B';
  speakerName: string;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  mode: ConversationMode;
  status: ConversationStatus;
  playerA: { userId: string; name: string; avatar?: string };
  playerB: { userId: string; name: string; avatar?: string };
  messages: ConversationMessage[];
  currentRound: number;
  maxRounds: number;
  sessionIdA?: string;
  sessionIdB?: string;
  result?: ConversationResult;
  createdAt: number;
  updatedAt: number;
}

export interface ConversationResult {
  compatibilityScore?: number;
  tradeCompleted?: boolean;
  tradeSummary?: string;
  summary?: string;
}

// ===== Trade =====
export interface TradeItem {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic';
  value: number;
}

export interface PlayerInventory {
  userId: string;
  items: TradeItem[];
  coins: number;
}
