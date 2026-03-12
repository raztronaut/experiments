"use client";

import { useCallback, useEffect, useRef } from "react";
import { R3FDevToolsInjector } from "@/components/dev";
import { ExperimentCanvas } from "@/lib/toolkit/r3f";
import { CRTMonitor } from "../canvas/CRTMonitor";
import { EXPERIMENTS } from "../data";
import { useAnnouncingStore } from "../store";
import "./showcase-section.css";

export function ShowcaseSection({ isMobile }: { isMobile: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const setActiveExperiment = useAnnouncingStore((s) => s.setActiveExperiment);
  const setMousePosition = useAnnouncingStore((s) => s.setMousePosition);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 5;
      setMousePosition(x, y);
    },
    [setMousePosition]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const handleListLeave = useCallback(() => {
    setActiveExperiment(null);
  }, [setActiveExperiment]);

  return (
    <section className="showcase-hero" ref={sectionRef}>
      {!isMobile && (
        <div className="showcase-canvas-wrap">
          <ExperimentCanvas
            adaptive
            camera={{ fov: 30, near: 0.1, far: 1000, position: [0, 0.15, 1] }}
            errorFallback={<div className="showcase-canvas-fallback" />}
            gl={{
              alpha: true,
              antialias: true,
              toneMapping: 4, // ACESFilmicToneMapping
              toneMappingExposure: 1.25,
            }}
            style={{ background: "transparent" }}
            tempus
          >
            <ambientLight intensity={5} />
            <directionalLight intensity={2.5} position={[15, 10, -5]} />
            <pointLight
              decay={0.3}
              distance={10}
              intensity={5}
              position={[-5, -2.5, 0]}
            />
            <CRTMonitor />
            <R3FDevToolsInjector />
          </ExperimentCanvas>
        </div>
      )}

      {isMobile && (
        <div className="showcase-mobile-grid">
          {EXPERIMENTS.slice(0, 6).map((exp) => (
            <img
              alt={exp.title}
              className="showcase-mobile-img"
              key={exp.slug}
              src={exp.poster}
            />
          ))}
        </div>
      )}

      <ul className="showcase-projects" onMouseLeave={handleListLeave}>
        {EXPERIMENTS.map((exp) => (
          <li
            data-img={exp.poster}
            key={exp.slug}
            onMouseEnter={() => setActiveExperiment(exp.slug)}
          >
            {exp.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
