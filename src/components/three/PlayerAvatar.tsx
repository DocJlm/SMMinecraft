'use client';
import { useRef } from 'react';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface PlayerAvatarProps {
  position: [number, number, number];
  color: string;
  name: string;
  isLocal?: boolean;
  isTalking?: boolean;
}

export default function PlayerAvatar({ position, color, name, isLocal, isTalking }: PlayerAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={position}>
      {/* Body */}
      <mesh ref={meshRef} castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.4, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshLambertMaterial color={isLocal ? '#FFD93D' : color} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.15, 1.45, 0.31]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[-0.15, 1.45, 0.31]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* Name tag */}
      <Billboard position={[0, 2.2, 0]}>
        <Text
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="black"
        >
          {name}
        </Text>
      </Billboard>
      {isTalking && (
        <Billboard position={[0, 2.6, 0]}>
          <Text fontSize={0.4} color="#FFD93D" anchorX="center">
            💬
          </Text>
        </Billboard>
      )}
    </group>
  );
}
