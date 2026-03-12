import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface CanvasTextProps {
  anchorX?: "center" | "left" | "right";
  anchorY?: "bottom" | "middle" | "top";
  children: string;
  color?: string;
  fontSize?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const PX_PER_UNIT = 128;

export function CanvasText({
  children,
  fontSize = 0.1,
  color = "white",
  position,
  rotation,
}: CanvasTextProps) {
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  const { texture, worldW, worldH } = useMemo(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const px = Math.round(fontSize * PX_PER_UNIT);
    const font = `bold ${px}px "IBM Plex Mono", "Courier New", monospace`;
    ctx.font = font;
    const metrics = ctx.measureText(children);

    const pad = Math.ceil(px * 0.35);
    const w = Math.ceil(metrics.width) + pad * 2;
    const h = px + pad * 2;
    canvas.width = w;
    canvas.height = h;

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(children, w / 2, h / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    textureRef.current = tex;

    return { texture: tex, worldW: w / PX_PER_UNIT, worldH: h / PX_PER_UNIT };
  }, [children, fontSize, color]);

  useEffect(() => {
    return () => {
      textureRef.current?.dispose();
    };
  }, []);

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[worldW, worldH]} />
      <meshBasicMaterial depthWrite={false} map={texture} transparent />
    </mesh>
  );
}
