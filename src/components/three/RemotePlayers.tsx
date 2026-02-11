'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/game-store';
import { useAuthStore } from '@/stores/auth-store';
import PlayerAvatar from './PlayerAvatar';
import * as THREE from 'three';

// Store interpolated positions for smooth movement
const interpolatedPositions: Record<string, THREE.Vector3> = {};

function LerpedPlayer({
  userId,
  targetX,
  targetY,
  targetZ,
  color,
  name,
  isTalking,
}: {
  userId: string;
  targetX: number;
  targetY: number;
  targetZ: number;
  color: string;
  name: string;
  isTalking: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  if (!interpolatedPositions[userId]) {
    interpolatedPositions[userId] = new THREE.Vector3(targetX, targetY, targetZ);
  }

  useFrame(() => {
    const pos = interpolatedPositions[userId];
    pos.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.1);
    if (groupRef.current) {
      groupRef.current.position.set(pos.x, pos.y, pos.z);
    }
  });

  return (
    <group ref={groupRef} position={[targetX, targetY, targetZ]}>
      <PlayerAvatar
        position={[0, 0, 0]}
        color={color}
        name={name}
        isTalking={isTalking}
      />
    </group>
  );
}

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
            <LerpedPlayer
              key={player.userId}
              userId={player.userId}
              targetX={player.position.x}
              targetY={player.position.y}
              targetZ={player.position.z}
              color={player.color}
              name={player.name}
              isTalking={!!isTalking}
            />
          );
        })}
    </group>
  );
}
