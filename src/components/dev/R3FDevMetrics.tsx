"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

const REPORT_INTERVAL_MS = 2000;

/**
 * Logs R3F renderer stats to the console every 2 seconds.
 * Must be placed inside a <Canvas> component.
 * Designed for AI agents to read from the dev server terminal.
 */
export function R3FDevMetrics() {
  const { gl } = useThree();
  const lastReportRef = useRef(performance.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      if (now - lastReportRef.current >= REPORT_INTERVAL_MS) {
        const info = gl.info;
        const render = info.render;
        const memory = info.memory;

        console.log(
          `[R3FMetrics] calls=${render.calls} triangles=${render.triangles}` +
            ` geometries=${memory.geometries} textures=${memory.textures}`
        );

        lastReportRef.current = now;
      }
    }, REPORT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [gl]);

  return null;
}
