"use client";

import { useCallback } from "react";
import * as THREE from "three";
import { R3FDevToolsInjector } from "@/components/dev/R3FDevToolsInjector";
import { ExperimentCanvas } from "@/lib/toolkit/r3f";
import { CRTMonitor } from "./canvas/CRTMonitor";
import { PROJECTS } from "./data";
import { useCrtDisplayStore } from "./store";
import "./crt-display.css";

export default function CrtDisplay() {
  const setActiveImage = useCrtDisplayStore((s) => s.setActiveImage);
  const setMousePosition = useCrtDisplayStore((s) => s.setMousePosition);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 5;
      setMousePosition(x, y);
    },
    [setMousePosition]
  );

  const handleProjectLeave = useCallback(() => {
    setActiveImage(null);
  }, [setActiveImage]);

  return (
    <section className="crt-display-hero" onPointerMove={handlePointerMove}>
      <ExperimentCanvas
        adaptive
        camera={{ fov: 30, near: 0.1, far: 1000, position: [0, 0.15, 1] }}
        errorFallback={<p>3D content unavailable.</p>}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
        }}
        style={{ position: "absolute", inset: 0 }}
      >
        <R3FDevToolsInjector />
        <CRTMonitor />
      </ExperimentCanvas>

      <ul
        className="crt-display-projects"
        onBlur={handleProjectLeave}
        onMouseLeave={handleProjectLeave}
      >
        {PROJECTS.map((project) => (
          <li key={project.label}>
            <button
              onFocus={() => setActiveImage(project.image)}
              onMouseEnter={() => setActiveImage(project.image)}
              type="button"
            >
              {project.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
