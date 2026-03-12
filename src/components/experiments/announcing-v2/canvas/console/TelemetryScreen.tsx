import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CanvasText } from "../CanvasText";

interface TelemetryScreenProps {
  color: string;
  title: string;
  type?: "bars" | "bits" | "wave";
}

export function TelemetryScreen({
  title,
  color,
  type = "bars",
}: TelemetryScreenProps) {
  const dataRef = useRef<THREE.Group>(null);
  const { dataPoints } = useMemo(
    () => ({
      dataPoints: [...new Array(12)].map(() => Math.random()),
    }),
    []
  );

  useFrame(({ clock }) => {
    if (dataRef.current) {
      if (type === "bars") {
        dataRef.current.children.forEach((child, i) => {
          if (child instanceof THREE.Mesh) {
            child.scale.y = 0.2 + Math.sin(clock.elapsedTime * 2 + i) * 0.8;
          }
        });
      } else if (type === "bits") {
        dataRef.current.children.forEach((child, i) => {
          if (
            child instanceof THREE.Mesh &&
            child.material instanceof THREE.Material
          ) {
            child.material.opacity =
              Math.sin(clock.elapsedTime * 10 + i) > 0.5 ? 1 : 0.1;
          }
        });
      }
    }
  });

  return (
    <group>
      <CanvasText color={color} fontSize={0.15} position={[0, 1.2, 0]}>
        {title}
      </CanvasText>

      <group position={[0, -0.2, 0]} ref={dataRef}>
        {type === "bars" &&
          dataPoints.map((_, i) => (
            <mesh key={i} position={[(i - 5.5) * 0.2, 0, 0]}>
              <boxGeometry args={[0.1, 1, 0.02]} />
              <meshBasicMaterial color={color} opacity={0.6} transparent />
            </mesh>
          ))}
        {type === "bits" &&
          [...new Array(25)].map((_, i) => (
            <mesh
              key={i}
              position={[((i % 5) - 2) * 0.4, (Math.floor(i / 5) - 2) * 0.4, 0]}
            >
              <planeGeometry args={[0.3, 0.3]} />
              <meshBasicMaterial color={color} opacity={0.8} transparent />
            </mesh>
          ))}
        {type === "wave" && <LineWave color={color} />}
      </group>
    </group>
  );
}

function LineWave({ color }: { color: string }) {
  const lineRef = useRef<THREE.Line>(null);
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 50; i++) {
      pts.push(new THREE.Vector3((i / 25 - 1) * 1.5, 0, 0));
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < 50; i++) {
        const x = (i / 25 - 1) * 1.5;
        positions[i * 3 + 1] =
          Math.sin(x * 5 + clock.elapsedTime * 10) * 0.4 * Math.random();
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <Line
      color={color}
      lineWidth={2}
      opacity={0.8}
      points={points}
      ref={lineRef as any}
      transparent
    />
  );
}
