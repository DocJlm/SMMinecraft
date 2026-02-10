'use client';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { WORLD_SIZE, getTerrainHeight } from '@/lib/world-config';

const GRASS_COLOR = new THREE.Color('#4a7c3f');
const DIRT_COLOR = new THREE.Color('#8B6914');
const STONE_COLOR = new THREE.Color('#808080');

export default function Terrain() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { matrices, colors, count } = useMemo(() => {
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const half = WORLD_SIZE / 2;

    for (let x = -half; x < half; x++) {
      for (let z = -half; z < half; z++) {
        const h = getTerrainHeight(x, z);
        for (let y = 0; y <= h; y++) {
          const mat = new THREE.Matrix4();
          mat.setPosition(x, y, z);
          mats.push(mat);

          if (y === h) cols.push(GRASS_COLOR.clone());
          else if (y >= h - 1) cols.push(DIRT_COLOR.clone());
          else cols.push(STONE_COLOR.clone());
        }

        if (h < 0) {
          const mat = new THREE.Matrix4();
          mat.setPosition(x, 0, z);
          mats.push(mat);
          cols.push(GRASS_COLOR.clone());
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
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial vertexColors />
    </instancedMesh>
  );
}
