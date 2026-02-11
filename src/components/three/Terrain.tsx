'use client';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { WORLD_SIZE, getTerrainHeight } from '@/lib/world-config';

// Rich color palette
const GRASS_COLORS = [
  new THREE.Color('#4a7c3f'),
  new THREE.Color('#5a8f4a'),
  new THREE.Color('#3d6b34'),
  new THREE.Color('#6b9e5a'),
];
const DIRT_COLOR = new THREE.Color('#8B6914');
const STONE_COLOR = new THREE.Color('#707070');
const SAND_COLOR = new THREE.Color('#c2b280');
const WATER_COLOR = new THREE.Color('#4a90d9');

export default function Terrain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  const { matrices, colors, count } = useMemo(() => {
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const half = WORLD_SIZE / 2;

    for (let x = -half; x < half; x += 1) {
      for (let z = -half; z < half; z += 1) {
        const h = getTerrainHeight(x, z);

        // Always at least one block at y=0
        const maxY = Math.max(0, h);
        for (let y = 0; y <= maxY; y++) {
          const mat = new THREE.Matrix4();
          mat.setPosition(x, y - 0.5, z); // Shift down so top is at y=0 for flat
          mats.push(mat);

          if (y === maxY && maxY === 0) {
            // Flat ground - varied grass
            const ci = Math.abs((x * 7 + z * 13) % 4);
            cols.push(GRASS_COLORS[ci].clone());
          } else if (y === maxY) {
            // Top of hill
            if (maxY >= 3) {
              cols.push(STONE_COLOR.clone());
            } else {
              const ci = Math.abs((x * 3 + z * 7) % 4);
              cols.push(GRASS_COLORS[ci].clone());
            }
          } else if (y >= maxY - 1) {
            cols.push(DIRT_COLOR.clone());
          } else {
            cols.push(STONE_COLOR.clone());
          }
        }
      }
    }

    return { matrices: mats, colors: cols, count: mats.length };
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, matrices[i]);
      mesh.setColorAt(i, colors[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [matrices, colors, count]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} receiveShadow castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial />
      </instancedMesh>
      {/* Water plane */}
      <mesh ref={waterRef} position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[WORLD_SIZE, WORLD_SIZE]} />
        <meshLambertMaterial color={WATER_COLOR} transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}
