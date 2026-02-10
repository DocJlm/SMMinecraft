'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import SkyBox from './SkyBox';
import Terrain from './Terrain';
import Buildings from './Buildings';
import LocalPlayer from './LocalPlayer';
import RemotePlayers from './RemotePlayers';

interface VoxelWorldProps {
  playerColor: string;
  playerName: string;
  onPositionChange: (x: number, y: number, z: number) => void;
}

function LoadingFallback() {
  return (
    <mesh position={[0, 2, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#4ECDC4" wireframe />
    </mesh>
  );
}

export default function VoxelWorld({ playerColor, playerName, onPositionChange }: VoxelWorldProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [15, 20, 15], fov: 50, near: 0.1, far: 500 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#87CEEB']} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 80, 50]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <fog attach="fog" args={['#87CEEB', 60, 120]} />

      <Suspense fallback={<LoadingFallback />}>
        <SkyBox />
        <Terrain />
        <Buildings />
        <LocalPlayer
          color={playerColor}
          name={playerName}
          onPositionChange={onPositionChange}
        />
        <RemotePlayers />
      </Suspense>
    </Canvas>
  );
}
