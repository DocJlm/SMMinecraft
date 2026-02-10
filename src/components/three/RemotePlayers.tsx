'use client';
import { useGameStore } from '@/stores/game-store';
import { useAuthStore } from '@/stores/auth-store';
import PlayerAvatar from './PlayerAvatar';

export default function RemotePlayers() {
  const remotePlayers = useGameStore((s) => s.remotePlayers);
  const localUser = useAuthStore((s) => s.user);
  const activeConv = useGameStore((s) => s.activeConversation);

  return (
    <group>
      {Object.values(remotePlayers)
        .filter((p) => p.userId !== localUser?.userId && p.isOnline)
        .map((player) => {
          const isTalking = activeConv?.status === 'active' &&
            (activeConv.playerA.userId === player.userId || activeConv.playerB.userId === player.userId);
          return (
            <PlayerAvatar
              key={player.userId}
              position={[player.position.x, player.position.y, player.position.z]}
              color={player.color}
              name={player.name}
              isTalking={isTalking}
            />
          );
        })}
    </group>
  );
}
