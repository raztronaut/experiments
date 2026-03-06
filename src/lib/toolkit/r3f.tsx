"use client";

import { Preload } from "@react-three/drei";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { type ReactNode, Suspense } from "react";

interface ExperimentCanvasProps extends CanvasProps {
  children: ReactNode;
}

export function ExperimentCanvas({
  children,
  ...props
}: ExperimentCanvasProps) {
  return (
    <Canvas dpr={[1, 2]} {...props}>
      <Suspense fallback={null}>
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
