import { Environment, Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { ConsolePanel3D } from "./ConsolePanel3D";

export function MissionControlCanvas() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Very subtle "breathing" or camera vibration
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Environment
        environmentIntensity={0.05}
        files="/experiments/announcing-v2/sky.jpg"
      />

      {/* Immersive 3D Command Room Architecture */}
      <RoomStructure />

      {/* The Central Command Deck */}
      <ConsolePanel3D />

      <ambientLight intensity={0.02} />

      {/* Cinematic Spotlights */}
      <spotLight
        angle={0.5}
        castShadow
        color="#4488ff"
        decay={2}
        intensity={200}
        penumbra={1}
        position={[4, 10, 4]}
      />
      <spotLight
        angle={0.4}
        color="#ff4444"
        decay={2}
        intensity={150}
        penumbra={1}
        position={[-6, 8, 2]}
      />
      <pointLight
        color="#224488"
        decay={2}
        intensity={50}
        position={[0, 2, -2]}
      />
    </group>
  );
}

function RoomStructure() {
  return (
    <group position={[0, 0, -2]}>
      {/* Back Wall / Support Beams */}
      <mesh position={[0, 0, -5]} receiveShadow>
        <boxGeometry args={[20, 15, 0.5]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>

      {/* Vertical Beams */}
      <Beam position={[-7, 0, -4.8]} scale={[0.6, 15, 0.6]} />
      <Beam position={[7, 0, -4.8]} scale={[0.6, 15, 0.6]} />
      <Beam position={[-12, 0, -3]} scale={[0.4, 15, 0.4]} />
      <Beam position={[12, 0, -3]} scale={[0.4, 15, 0.4]} />

      {/* Ceiling Pipes / Wires */}
      <Float floatIntensity={0.2} rotationIntensity={0.1} speed={1}>
        <Pipe
          position={[0, 6, -3]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.15, 20, 0.15]}
        />
      </Float>
      <Pipe
        position={[-3, 6, -4]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.08, 20, 0.08]}
      />
      <Pipe
        position={[4, 6.5, -3.5]}
        rotation={[0, 0.2, Math.PI / 2]}
        scale={[0.05, 20, 0.05]}
      />
    </group>
  );
}

function Beam({ position, scale }: any) {
  return (
    <mesh castShadow position={position} receiveShadow scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#111115" metalness={0.9} roughness={0.3} />
    </mesh>
  );
}

function Pipe({ position, rotation, scale }: any) {
  return (
    <mesh castShadow position={position} rotation={rotation} scale={scale}>
      <capsuleGeometry args={[1, 1, 4, 8]} />
      <meshStandardMaterial color="#1a1a1e" metalness={1} roughness={0.2} />
    </mesh>
  );
}
