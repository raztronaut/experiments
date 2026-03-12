import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { CanvasText } from "../CanvasText";

interface TactileButtonProps {
  color: string;
  label: string;
  position: [number, number, number];
}

export function TactileButton({ position, label, color }: TactileButtonProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.emissiveIntensity =
        0.5 + Math.sin(clock.elapsedTime * 5) * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.4, 0.6]} />
        <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          ref={materialRef}
        />
      </mesh>
      <CanvasText
        color="white"
        fontSize={0.1}
        position={[0, 0.3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </CanvasText>
    </group>
  );
}

interface StatusLEDProps {
  color: string;
  position: [number, number, number];
}

export function StatusLED({ position, color }: StatusLEDProps) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.emissiveIntensity =
        2 + Math.sin(clock.elapsedTime * 10 + position[0]) * 1.5;
    }
  });
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        ref={materialRef}
      />
    </mesh>
  );
}
