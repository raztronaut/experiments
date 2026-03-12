import type { ReactNode } from "react";
import { CanvasText } from "../CanvasText";

interface ScreenFrameProps {
  children: ReactNode;
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  title?: string;
}

export function ScreenFrame({
  children,
  position,
  size,
  rotation = [0, 0, 0],
  title,
}: ScreenFrameProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[size[0] + 0.4, size[1] + 0.6, 0.3]} />
        <meshStandardMaterial color="#141418" metalness={0.8} roughness={0.3} />
      </mesh>
      {title && (
        <CanvasText
          color="white"
          fontSize={0.1}
          position={[0, size[1] / 2 + 0.15, 0.16]}
        >
          {title}
        </CanvasText>
      )}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={size} />
        <meshBasicMaterial color="#020204" />
      </mesh>
      <group position={[0, 0, 0.11]}>{children}</group>
    </group>
  );
}
