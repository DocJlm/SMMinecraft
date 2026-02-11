'use client';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect } from 'react';

export default function SkyBox() {
  const { scene } = useThree();

  useEffect(() => {
    // Gradient sky using a large sphere
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1a237e');    // Deep blue top
    gradient.addColorStop(0.3, '#4fc3f7');  // Light blue
    gradient.addColorStop(0.6, '#81d4fa');  // Sky blue
    gradient.addColorStop(1.0, '#b3e5fc');  // Horizon
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const skyGeo = new THREE.SphereGeometry(400, 32, 32);
    const skyMat = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.name = 'sky';
    scene.add(skyMesh);

    return () => {
      scene.remove(skyMesh);
      skyGeo.dispose();
      skyMat.dispose();
      texture.dispose();
    };
  }, [scene]);

  // Sun
  return (
    <mesh position={[100, 80, -100]}>
      <sphereGeometry args={[5, 16, 16]} />
      <meshBasicMaterial color="#FFF59D" />
    </mesh>
  );
}
