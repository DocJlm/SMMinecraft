'use client';
import { PlayerState } from '@/types';

interface PlayerCardProps {
  player: PlayerState;
  onClose: () => void;
  onChat: () => void;
  onDate: () => void;
  onTrade: () => void;
  currentZone: string;
}

export default function PlayerCard({ player, onClose, onChat, onDate, onTrade, currentZone }: PlayerCardProps) {
  return (
    <div className="pointer-events-auto absolute bottom-40 left-1/2 -translate-x-1/2 z-20">
      <div className="bg-black/80 rounded-2xl p-4 backdrop-blur-md border border-white/10 min-w-[280px]">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg"
            style={{ backgroundColor: player.color }}
          />
          <div>
            <p className="text-white font-bold">{player.name}</p>
            <p className="text-white/50 text-xs">Online</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/50 hover:text-white">x</button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onChat}
            className="flex-1 py-2 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 text-sm transition"
          >
            Chat
          </button>
          {(currentZone === 'plaza' || currentZone === 'none') && (
            <button
              onClick={onDate}
              className="flex-1 py-2 rounded-lg bg-pink-500/30 hover:bg-pink-500/50 text-pink-200 text-sm transition"
            >
              Date
            </button>
          )}
          {(currentZone === 'market' || currentZone === 'none') && (
            <button
              onClick={onTrade}
              className="flex-1 py-2 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 text-sm transition"
            >
              Trade
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
