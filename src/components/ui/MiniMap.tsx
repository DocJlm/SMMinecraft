'use client';
import { useGameStore } from '@/stores/game-store';
import { useAuthStore } from '@/stores/auth-store';
import { ZONES, WORLD_SIZE } from '@/lib/world-config';

const MAP_SIZE = 150;
const HALF = WORLD_SIZE / 2;

function worldToMap(x: number, z: number): { mx: number; my: number } {
  return {
    mx: ((x + HALF) / WORLD_SIZE) * MAP_SIZE,
    my: ((z + HALF) / WORLD_SIZE) * MAP_SIZE,
  };
}

export default function MiniMap() {
  const position = useGameStore((s) => s.position);
  const remotePlayers = useGameStore((s) => s.remotePlayers);
  const localUser = useAuthStore((s) => s.user);

  const localPos = worldToMap(position.x, position.z);

  return (
    <div
      className="pointer-events-auto absolute bottom-4 right-4 rounded-lg border-2 border-white/20 overflow-hidden backdrop-blur-sm"
      style={{ width: MAP_SIZE, height: MAP_SIZE, background: 'rgba(74,124,63,0.7)' }}
    >
      {ZONES.map((zone) => {
        const pos = worldToMap(zone.center.x, zone.center.z);
        const size = (zone.radius / WORLD_SIZE) * MAP_SIZE * 2;
        return (
          <div
            key={zone.id}
            className="absolute rounded-sm opacity-60"
            style={{
              left: pos.mx - size / 2,
              top: pos.my - size / 2,
              width: size,
              height: size,
              backgroundColor: zone.color,
            }}
            title={zone.nameEn}
          />
        );
      })}

      {Object.values(remotePlayers)
        .filter((p) => p.userId !== localUser?.userId && p.isOnline)
        .map((player) => {
          const pos = worldToMap(player.position.x, player.position.z);
          return (
            <div
              key={player.userId}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: pos.mx - 4,
                top: pos.my - 4,
                backgroundColor: player.color,
              }}
              title={player.name}
            />
          );
        })}

      <div
        className="absolute w-3 h-3 rounded-full bg-yellow-300 border border-white"
        style={{ left: localPos.mx - 6, top: localPos.my - 6 }}
      />

      <div className="absolute bottom-1 left-1 text-[8px] text-white/60">Map</div>
    </div>
  );
}
