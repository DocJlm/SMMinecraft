'use client';
import { useGameStore } from '@/stores/game-store';
import { useAuthStore } from '@/stores/auth-store';
import { ZONES } from '@/lib/world-config';

export default function HUD() {
  const zone = useGameStore((s) => s.zone);
  const position = useGameStore((s) => s.position);
  const onlineCount = useGameStore((s) => s.onlineCount);
  const nearbyPlayer = useGameStore((s) => s.nearbyPlayer);
  const hudMessage = useGameStore((s) => s.hudMessage);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const currentZone = ZONES.find((z) => z.id === zone);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top bar */}
      <div className="pointer-events-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-black/60 px-4 py-2 text-white backdrop-blur-sm">
            <span className="font-bold text-lg">SecondCraft</span>
            <span className="ml-3 text-sm text-green-400">{onlineCount} online</span>
          </div>
          {currentZone && (
            <div
              className="rounded-lg px-4 py-2 text-white backdrop-blur-sm"
              style={{ backgroundColor: currentZone.color + 'CC' }}
            >
              {currentZone.emoji} {currentZone.nameEn}
            </div>
          )}
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="rounded-lg bg-black/60 px-3 py-2 text-white text-sm backdrop-blur-sm">
            {user?.name}
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/'; }}
            className="rounded-lg bg-red-500/80 px-3 py-2 text-white text-sm hover:bg-red-600 backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Center messages */}
      {hudMessage && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-pulse">
          <div className="rounded-xl bg-black/70 px-6 py-3 text-white text-lg backdrop-blur-sm">
            {hudMessage}
          </div>
        </div>
      )}

      {/* Nearby player prompt */}
      {nearbyPlayer && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
          <div className="rounded-xl bg-black/70 px-6 py-3 text-white backdrop-blur-sm text-center">
            <p className="text-lg font-bold">{nearbyPlayer.name}</p>
            <p className="text-sm text-yellow-300 mt-1">Press E to interact with their AI</p>
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4">
        <div className="rounded-lg bg-black/50 px-4 py-2 text-white/70 text-xs backdrop-blur-sm">
          <p>WASD - Move | E - Interact | ESC - Close</p>
          <p className="mt-1">
            Pos: ({Math.round(position.x)}, {Math.round(position.z)})
          </p>
        </div>
      </div>
    </div>
  );
}
