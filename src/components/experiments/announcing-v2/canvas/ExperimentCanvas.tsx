"use client";

import type { ReactNode } from "react";
import tunnel from "tunnel-rat";
import { ExperimentCanvas as ToolkitCanvas } from "@/lib/toolkit/r3f";

export const SceneTunnel = tunnel();

export function ExperimentCanvas({ children }: { children: ReactNode }) {
  return (
    <ToolkitCanvas
      adaptive
      camera={{ position: [0, 0, 5], fov: 45 }}
      errorFallback={<p>3D content unavailable.</p>}
      gl={{
        alpha: false,
        antialias: true,
        stencil: false,
        depth: true,
        powerPreference: "high-performance",
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
      tempus
    >
      <SceneTunnel.Out />
      {children}
    </ToolkitCanvas>
  );
}
