'use client';
import { Sky } from '@react-three/drei';

export default function SkyBox() {
  return (
    <Sky
      distance={450000}
      sunPosition={[100, 50, 100]}
      inclination={0.5}
      azimuth={0.25}
      turbidity={8}
      rayleigh={2}
    />
  );
}
