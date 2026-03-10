"use client";

import { GizmoHelper, GizmoViewport, OrbitControls } from "@react-three/drei";
import { useCallback, useEffect, useState } from "react";

type CameraMode = "main" | "orbit";

/**
 * Camera helpers for R3F experiments, activated by ?debug.
 * Keyboard shortcuts (basement.studio Daylight pattern):
 *   O = toggle orbit controls (free camera navigation)
 *   G = toggle grid helper
 *
 * Main mode shows the scene as-is. Orbit mode adds OrbitControls
 * for free camera exploration + a gizmo for orientation.
 */
export function DebugCamera() {
  const [mode, setMode] = useState<CameraMode>("main");
  const [showGrid, setShowGrid] = useState(false);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
      return;
    }

    switch (e.key.toLowerCase()) {
      case "o":
        setMode((m) => (m === "orbit" ? "main" : "orbit"));
        break;
      case "g":
        setShowGrid((v) => !v);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <>
      {mode === "orbit" && (
        <>
          <OrbitControls enableDamping makeDefault />
          <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
            <GizmoViewport />
          </GizmoHelper>
        </>
      )}
      {showGrid && <gridHelper args={[20, 20, "#444", "#222"]} />}
    </>
  );
}
