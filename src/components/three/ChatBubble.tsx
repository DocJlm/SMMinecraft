'use client';
import { Billboard, Text } from '@react-three/drei';

interface ChatBubbleProps {
  position: [number, number, number];
  message: string;
  speakerName: string;
}

export default function ChatBubble({ position, message, speakerName }: ChatBubbleProps) {
  const truncated = message.length > 60 ? message.slice(0, 57) + '...' : message;

  return (
    <Billboard position={[position[0], position[1] + 3.5, position[2]]}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[Math.max(truncated.length * 0.12, 2), 0.8]} />
        <meshBasicMaterial color="white" transparent opacity={0.9} />
      </mesh>
      <Text
        fontSize={0.2}
        color="#333"
        anchorX="center"
        anchorY="middle"
        maxWidth={5}
      >
        {speakerName}: {truncated}
      </Text>
    </Billboard>
  );
}
