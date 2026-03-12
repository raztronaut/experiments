"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExperimentCanvas } from "@/lib/toolkit/r3f";
import { TempleScene } from "../canvas/TempleScene";
import { BLUEPRINT_CONTENT } from "../data";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useAnnouncingStore } from "../store";
import "./blueprint-section.css";

gsap.registerPlugin(ScrollTrigger);

const GRID_MARKERS = [
  { top: "20%", left: "25%" },
  { top: "40%", left: "75%" },
  { top: "60%", left: "15%" },
  { top: "75%", left: "60%" },
  { top: "30%", left: "50%" },
  { top: "50%", left: "85%" },
  { top: "85%", left: "40%" },
  { top: "15%", left: "65%" },
];

const MEASURES = ["0m", "15m", "30m", "45m", "60m"];

export function BlueprintSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const setMousePosition = useAnnouncingStore((s) => s.setMousePosition);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setRevealed(true);
    }
  }, [reducedMotion]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 5;
      setMousePosition(x, y);
    },
    [setMousePosition]
  );

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${window.innerHeight * 2}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          useAnnouncingStore.getState().setBlueprintProgress(p);
          if (p > 0.1 && !revealed) {
            setRevealed(true);
          }
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <section
        className={`${revealed ? "blueprint-reveal" : ""} blueprint-section`}
        onMouseMove={handleMouseMove}
        ref={sectionRef}
      >
        <div className="blueprint-grid" />

        <div className="blueprint-grid-markers">
          {GRID_MARKERS.map((pos, i) => (
            <div
              className="blueprint-grid-marker"
              key={i}
              style={{ top: pos.top, left: pos.left }}
            />
          ))}
        </div>

        <div className="blueprint-canvas-wrap">
          <ExperimentCanvas
            adaptive
            camera={{ fov: 35, near: 0.1, far: 100, position: [0, 0.5, 4] }}
            errorFallback={<div />}
            gl={{
              alpha: true,
              antialias: true,
              toneMapping: 4,
              toneMappingExposure: 1.0,
            }}
            style={{ background: "transparent" }}
            tempus
          >
            <TempleScene />
          </ExperimentCanvas>
        </div>

        <div className="blueprint-title">
          <h2>{BLUEPRINT_CONTENT.sectionTitle}</h2>
          <h1>{BLUEPRINT_CONTENT.subtitle}</h1>
        </div>

        <div className="blueprint-panels">
          {BLUEPRINT_CONTENT.panels.map((panel, i) => (
            <div
              className={`blueprint-panel blueprint-panel--${i}`}
              key={panel.id}
            >
              <p className="blueprint-panel-label">{panel.label}</p>
              <p className="blueprint-panel-heading">{panel.heading}</p>
              <p className="blueprint-panel-text">{panel.text}</p>
            </div>
          ))}
        </div>

        <div className="blueprint-stats">
          {BLUEPRINT_CONTENT.stats.map((stat) => (
            <div className="blueprint-stat" key={stat.label}>
              <p className="blueprint-stat-value">{stat.value}</p>
              <p className="blueprint-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="blueprint-measures">
          {MEASURES.map((m) => (
            <span className="blueprint-measure" key={m}>
              {m}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
