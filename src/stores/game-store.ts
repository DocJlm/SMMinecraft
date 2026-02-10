import { create } from 'zustand';
import { Position, PlayerState, ZoneType, Conversation } from '@/types';
import { SPAWN_POSITION } from '@/lib/world-config';

interface GameState {
  position: Position;
  zone: ZoneType;
  setPosition: (pos: Position) => void;
  setZone: (zone: ZoneType) => void;
  remotePlayers: Record<string, PlayerState>;
  setRemotePlayers: (players: Record<string, PlayerState>) => void;
  showChat: boolean;
  setShowChat: (show: boolean) => void;
  showMatchResult: boolean;
  setShowMatchResult: (show: boolean) => void;
  showTradeWindow: boolean;
  setShowTradeWindow: (show: boolean) => void;
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  nearbyPlayer: PlayerState | null;
  setNearbyPlayer: (player: PlayerState | null) => void;
  hudMessage: string;
  setHudMessage: (msg: string) => void;
  onlineCount: number;
  setOnlineCount: (count: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  position: SPAWN_POSITION,
  zone: 'none',
  setPosition: (pos) => set({ position: pos }),
  setZone: (zone) => set({ zone }),
  remotePlayers: {},
  setRemotePlayers: (players) => set({ remotePlayers: players }),
  showChat: false,
  setShowChat: (show) => set({ showChat: show }),
  showMatchResult: false,
  setShowMatchResult: (show) => set({ showMatchResult: show }),
  showTradeWindow: false,
  setShowTradeWindow: (show) => set({ showTradeWindow: show }),
  activeConversation: null,
  setActiveConversation: (conv) => set({ activeConversation: conv }),
  nearbyPlayer: null,
  setNearbyPlayer: (player) => set({ nearbyPlayer: player }),
  hudMessage: '',
  setHudMessage: (msg) => set({ hudMessage: msg }),
  onlineCount: 0,
  setOnlineCount: (count) => set({ onlineCount: count }),
}));
