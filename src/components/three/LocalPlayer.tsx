'use client';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useGameStore } from '@/stores/game-store';
import { getZoneAtPosition, WORLD_SIZE } from '@/lib/world-config';
import PlayerAvatar from './PlayerAvatar';

const SPEED = 8;
const HALF = WORLD_SIZE / 2 - 1;

interface LocalPlayerProps {
  color: string;
  name: string;
  onPositionChange: (x: number, y: number, z: number) => void;
}

export default function LocalPlayer({ color, name, onPositionChange }: LocalPlayerProps) {
  const keys = useKeyboard();
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const posRef = useRef(new THREE.Vector3(0, 1, 0));
  const setPosition = useGameStore((s) => s.setPosition);
  const setZone = useGameStore((s) => s.setZone);
  const lastReportRef = useRef(0);
  const showChat = useGameStore((s) => s.showChat);

  useFrame((_, delta) => {
    if (!groupRef.current || showChat) return;

    const dir = new THREE.Vector3();
    const k = keys.current;

    if (k['w'] || k['arrowup']) dir.z -= 1;
    if (k['s'] || k['arrowdown']) dir.z += 1;
    if (k['a'] || k['arrowleft']) dir.x -= 1;
    if (k['d'] || k['arrowright']) dir.x += 1;

    if (dir.length() > 0) {
      dir.normalize().multiplyScalar(SPEED * delta);
      posRef.current.add(dir);

      posRef.current.x = Math.max(-HALF, Math.min(HALF, posRef.current.x));
      posRef.current.z = Math.max(-HALF, Math.min(HALF, posRef.current.z));
      posRef.current.y = 1;

      groupRef.current.position.copy(posRef.current);

      const pos = { x: posRef.current.x, y: posRef.current.y, z: posRef.current.z };
      setPosition(pos);

      const zone = getZoneAtPosition(pos);
      setZone(zone?.id || 'none');

      const now = Date.now();
      if (now - lastReportRef.current > 200) {
        lastReportRef.current = now;
        onPositionChange(pos.x, pos.y, pos.z);
      }
    }

    // Camera follow - isometric style
    const camOffset = new THREE.Vector3(15, 20, 15);
    const targetCamPos = posRef.current.clone().add(camOffset);
    camera.position.lerp(targetCamPos, 0.05);
    camera.lookAt(posRef.current);
  });

  return (
    <group ref={groupRef} position={[0, 1, 0]}>
      <PlayerAvatar
        position={[0, 0, 0]}
        color={color}
        name={name}
        isLocal
      />
    </group>
  );
}
