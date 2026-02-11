'use client';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { WORLD_SIZE, ZONES } from '@/lib/world-config';

// Seeded random for deterministic tree placement
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

interface TreePosition {
  x: number;
  z: number;
}

function generateTreePositions(): TreePosition[] {
  const trees: TreePosition[] = [];
  const half = WORLD_SIZE / 2;

  for (let i = 0; i < 60; i++) {
    const x = Math.floor(seededRandom(i * 7 + 1) * WORLD_SIZE) - half;
    const z = Math.floor(seededRandom(i * 13 + 3) * WORLD_SIZE) - half;

    // Skip if too close to zone centers or roads
    let tooClose = false;
    for (const zone of ZONES) {
      const dx = x - zone.center.x;
      const dz = z - zone.center.z;
      if (Math.sqrt(dx * dx + dz * dz) < zone.radius + 3) {
        tooClose = true;
        break;
      }
    }
    // Skip if on main roads (x~0 or z~0 corridors)
    if (Math.abs(x) < 2 || Math.abs(z) < 2) tooClose = true;

    if (!tooClose) trees.push({ x, z });
  }

  return trees.slice(0, 20);
}

export default function Decorations() {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);

  const trees = useMemo(() => generateTreePositions(), []);

  useMemo(() => {
    if (!trunkRef.current || !leavesRef.current) return;

    const mat = new THREE.Matrix4();
    trees.forEach((tree, i) => {
      // Trunk: y=0.75 (1.5 tall)
      mat.makeTranslation(tree.x, 0.75, tree.z);
      trunkRef.current!.setMatrixAt(i, mat);

      // Leaves: y=2.5 (on top of trunk)
      mat.makeTranslation(tree.x, 2.5, tree.z);
      leavesRef.current!.setMatrixAt(i, mat);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  return (
    <group>
      {/* Tree trunks */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} castShadow>
        <boxGeometry args={[0.4, 1.5, 0.4]} />
        <meshLambertMaterial color="#8B4513" />
      </instancedMesh>

      {/* Tree leaves */}
      <instancedMesh ref={leavesRef} args={[undefined, undefined, trees.length]} castShadow>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshLambertMaterial color="#228B22" />
      </instancedMesh>
    </group>
  );
}
