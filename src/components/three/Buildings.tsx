'use client';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { ZONES } from '@/lib/world-config';
import { Zone } from '@/types';

function ZoneBuilding({ zone }: { zone: Zone }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const color = new THREE.Color(zone.color);

  const { matrices, count } = useMemo(() => {
    const mats: THREE.Matrix4[] = [];
    const r = Math.floor(zone.radius * 0.6);

    for (let x = -r; x <= r; x++) {
      for (let z = -r; z <= r; z++) {
        const isEdge = Math.abs(x) === r || Math.abs(z) === r;
        const isDoor = Math.abs(x) < 2 && z === -r;
        if (isEdge && !isDoor) {
          for (let y = 1; y <= zone.buildingHeight; y++) {
            const mat = new THREE.Matrix4();
            mat.setPosition(zone.center.x + x, y, zone.center.z + z);
            mats.push(mat);
          }
        }
      }
    }

    // Floor
    for (let x = -r; x <= r; x++) {
      for (let z = -r; z <= r; z++) {
        const mat = new THREE.Matrix4();
        mat.setPosition(zone.center.x + x, 0.01, zone.center.z + z);
        mats.push(mat);
      }
    }

    return { matrices: mats, count: mats.length };
  }, [zone]);

  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      meshRef.current.setMatrixAt(i, matrices[i]);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices, count]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial color={color} transparent opacity={0.85} />
      </instancedMesh>
      <Text
        position={[zone.center.x, zone.buildingHeight + 2, zone.center.z]}
        fontSize={1.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="black"
      >
        {zone.emoji} {zone.nameEn}
      </Text>
    </group>
  );
}

export default function Buildings() {
  return (
    <group>
      {ZONES.map((zone) => (
        <ZoneBuilding key={zone.id} zone={zone} />
      ))}
    </group>
  );
}
