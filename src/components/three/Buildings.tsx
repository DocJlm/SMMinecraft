'use client';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { ZONES } from '@/lib/world-config';
import { Zone } from '@/types';

function ZoneBuilding({ zone }: { zone: Zone }) {
  const wallRef = useRef<THREE.InstancedMesh>(null);
  const floorRef = useRef<THREE.InstancedMesh>(null);
  const accentRef = useRef<THREE.InstancedMesh>(null);

  const wallColor = new THREE.Color(zone.color);
  const floorColor = new THREE.Color(zone.color).multiplyScalar(0.6);
  const accentColor = new THREE.Color(zone.color).lerp(new THREE.Color('#ffffff'), 0.5);

  const { wallMats, wallCount, floorMats, floorCount, accentMats, accentCount } = useMemo(() => {
    const walls: THREE.Matrix4[] = [];
    const floors: THREE.Matrix4[] = [];
    const accents: THREE.Matrix4[] = [];
    const r = Math.floor(zone.radius * 0.55);
    const h = zone.buildingHeight;

    // Walls with window gaps
    for (let x = -r; x <= r; x++) {
      for (let z = -r; z <= r; z++) {
        const isEdge = Math.abs(x) === r || Math.abs(z) === r;
        const isDoor = Math.abs(x) <= 1 && z === -r;

        if (isEdge && !isDoor) {
          for (let y = 1; y <= h; y++) {
            // Window pattern: skip some blocks
            const isWindow = y >= 2 && y < h &&
              ((Math.abs(x) !== r || (z % 3 === 0 && Math.abs(z) < r - 1)) ||
               (Math.abs(z) !== r || (x % 3 === 0 && Math.abs(x) < r - 1)));

            if (!isWindow || y === 1 || y === h) {
              const mat = new THREE.Matrix4();
              mat.setPosition(zone.center.x + x, y, zone.center.z + z);
              walls.push(mat);
            }
          }
        }

        // Corner pillars - go 1 block higher
        const isCorner = (Math.abs(x) === r && Math.abs(z) === r);
        if (isCorner) {
          const mat = new THREE.Matrix4();
          mat.setPosition(zone.center.x + x, h + 1, zone.center.z + z);
          accents.push(mat);
        }
      }
    }

    // Floor tiles with checkerboard
    for (let x = -r; x <= r; x++) {
      for (let z = -r; z <= r; z++) {
        const mat = new THREE.Matrix4();
        mat.setPosition(zone.center.x + x, 0.02, zone.center.z + z);
        if ((x + z) % 2 === 0) {
          floors.push(mat);
        } else {
          accents.push(mat);
        }
      }
    }

    // Doorframe accents
    for (let y = 1; y <= Math.min(h, 3); y++) {
      for (const dx of [-2, 2]) {
        const mat = new THREE.Matrix4();
        mat.setPosition(zone.center.x + dx, y, zone.center.z - r);
        accents.push(mat);
      }
    }
    // Door top
    const doorTop = new THREE.Matrix4();
    doorTop.setPosition(zone.center.x, Math.min(h, 3) + 1, zone.center.z - r);
    accents.push(doorTop);

    // Interior decorations - tables/chairs (small pillars)
    const decorPositions = [
      { x: -2, z: -2 }, { x: 2, z: 2 }, { x: -2, z: 2 }, { x: 2, z: -2 },
    ];
    for (const dp of decorPositions) {
      if (Math.abs(dp.x) < r - 1 && Math.abs(dp.z) < r - 1) {
        const mat = new THREE.Matrix4();
        mat.setPosition(zone.center.x + dp.x, 1, zone.center.z + dp.z);
        accents.push(mat);
      }
    }

    return {
      wallMats: walls, wallCount: walls.length,
      floorMats: floors, floorCount: floors.length,
      accentMats: accents, accentCount: accents.length,
    };
  }, [zone]);

  useEffect(() => {
    if (wallRef.current) {
      for (let i = 0; i < wallCount; i++) wallRef.current.setMatrixAt(i, wallMats[i]);
      wallRef.current.instanceMatrix.needsUpdate = true;
    }
    if (floorRef.current) {
      for (let i = 0; i < floorCount; i++) floorRef.current.setMatrixAt(i, floorMats[i]);
      floorRef.current.instanceMatrix.needsUpdate = true;
    }
    if (accentRef.current) {
      for (let i = 0; i < accentCount; i++) accentRef.current.setMatrixAt(i, accentMats[i]);
      accentRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [wallMats, wallCount, floorMats, floorCount, accentMats, accentCount]);

  return (
    <group>
      {/* Walls */}
      {wallCount > 0 && (
        <instancedMesh ref={wallRef} args={[undefined, undefined, wallCount]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </instancedMesh>
      )}
      {/* Floor */}
      {floorCount > 0 && (
        <instancedMesh ref={floorRef} args={[undefined, undefined, floorCount]} receiveShadow>
          <boxGeometry args={[1, 0.15, 1]} />
          <meshStandardMaterial color={floorColor} roughness={0.9} />
        </instancedMesh>
      )}
      {/* Accents */}
      {accentCount > 0 && (
        <instancedMesh ref={accentRef} args={[undefined, undefined, accentCount]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={accentColor} roughness={0.6} metalness={0.1} />
        </instancedMesh>
      )}
      {/* Floating label */}
      <Billboard position={[zone.center.x, zone.buildingHeight + 3, zone.center.z]}>
        <Text
          fontSize={2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.15}
          outlineColor="#000000"
          font={undefined}
        >
          {zone.emoji} {zone.nameEn}
        </Text>
      </Billboard>
      {/* Glow marker on ground */}
      <mesh position={[zone.center.x, 0.05, zone.center.z - Math.floor(zone.radius * 0.55) - 2]}>
        <boxGeometry args={[3, 0.1, 1]} />
        <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export default function Buildings() {
  return (
    <group>
      {ZONES.map((zone) => (
        <ZoneBuilding key={zone.id} zone={zone} />
      ))}
      {/* Spawn point marker */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[2, 2, 0.1, 16]} />
        <meshStandardMaterial color="#4ECDC4" emissive="#4ECDC4" emissiveIntensity={0.3} />
      </mesh>
      <Billboard position={[0, 3, 0]}>
        <Text fontSize={1} color="#4ECDC4" anchorX="center" outlineWidth={0.08} outlineColor="black">
          Spawn Point
        </Text>
      </Billboard>
    </group>
  );
}
