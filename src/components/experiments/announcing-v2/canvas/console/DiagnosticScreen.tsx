import { Float, MeshDistortMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { CanvasText } from "../CanvasText";

export function DiagnosticScreen() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(clock.elapsedTime * 20.0) * 0.001;
    }
  });

  return (
    <group>
      <CanvasText color="#4488ff" fontSize={0.2} position={[0, 1.2, 0]}>
        ANNV2 // SYSTEM DIAGNOSTIC
      </CanvasText>

      <mesh ref={meshRef}>
        <planeGeometry args={[5, 2]} />
        <meshBasicMaterial
          color="#4488ff"
          opacity={0.1}
          transparent
          wireframe
        />
      </mesh>

      <Float floatIntensity={0.5} rotationIntensity={0.5} speed={2}>
        <mesh position={[0, 0, 0.1]}>
          <tetrahedronGeometry args={[0.5]} />
          <MeshDistortMaterial
            color="#4488ff"
            distort={0.4}
            opacity={0.8}
            speed={2}
            transparent
            wireframe
          />
        </mesh>
      </Float>
    </group>
  );
}
