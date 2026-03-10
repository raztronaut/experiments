"use client";

import { useCallback, useEffect, useRef } from "react";
import { R3FDevToolsInjector } from "@/components/dev";
import { ExperimentCanvas } from "@/lib/toolkit/r3f";
import { CRTMonitor } from "../canvas/CRTMonitor";
import { EXPERIMENTS } from "../data";
import { useAnnouncingStore } from "../store";

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

      <style>{`
        .showcase-hero {
          position: relative;
          width: 100%;
          height: 100svh;
          background-color: #b0b0b0;
          overflow: hidden;
        }

        .showcase-canvas-wrap {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .showcase-canvas-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #b0b0b0;
        }

        .showcase-projects {
          position: absolute;
          left: 50%;
          bottom: 4rem;
          transform: translateX(-50%);
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          list-style: none;
          z-index: 2;
          margin: 0;
          padding: 0;
        }

        .showcase-projects li {
          text-transform: uppercase;
          font-family: "Geist Mono", "IBM Plex Mono", monospace;
          font-size: 0.7rem;
          font-weight: 450;
          color: #000;
          width: max-content;
          padding: 0.5rem 1rem;
          background-color: #fff;
          border: 1px solid #000;
          box-shadow: 4px 4px 0px -1px rgba(0, 0, 0, 1);
          cursor: pointer;
          transition: color 0.15s, background-color 0.15s;
        }
        .showcase-projects li:hover {
          color: #fff;
          background-color: #000;
        }

        .showcase-mobile-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          padding: 2rem;
          height: 100%;
          align-content: center;
        }
        .showcase-mobile-img {
          width: 100%;
          aspect-ratio: 16/9;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid rgba(0,0,0,0.1);
        }

        @media (max-width: 1000px) {
          .showcase-projects {
            flex-wrap: wrap;
            padding: 0 4rem;
          }
        }
      `}</style>
    </section>
  );
}
