"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { ExperimentCanvas } from "@/lib/toolkit/r3f";
import { VolumetricLightScene } from "../canvas/VolumetricLightScene";
import { PROCESS_CONTENT } from "../data";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useAnnouncingStore } from "../store";
import "./process-section.css";

gsap.registerPlugin(ScrollTrigger);

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [visiblePhases, setVisiblePhases] = useState<boolean[]>([
    false,
    false,
    false,
  ]);

  useEffect(() => {
    if (reducedMotion) {
      setVisiblePhases([true, true, true]);
    }
  }, [reducedMotion]);

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${window.innerHeight * 3}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          useAnnouncingStore.getState().setProcessProgress(p);
          setVisiblePhases([p > 0.25, p > 0.5, p > 0.75]);
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <section className="process-section" ref={sectionRef}>
        <span className="process-section-label">THE PROCESS</span>

        <div className="process-canvas-wrap">
          <ExperimentCanvas
            adaptive
            camera={{ fov: 45, near: 0.1, far: 50, position: [0, 1, 6] }}
            errorFallback={<div />}
            gl={{
              alpha: false,
              antialias: true,
              toneMapping: 0,
            }}
            style={{ background: "#050510" }}
            tempus
          >
            <VolumetricLightScene />
          </ExperimentCanvas>
        </div>

        <div className="process-content">
          <div className="process-phases">
            {PROCESS_CONTENT.phases.map((phase, i) => (
              <div
                className={[
                  "process-phase",
                  visiblePhases[i] && "process-phase--visible",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={phase.label}
              >
                <p className="process-phase-label">{phase.label}</p>
                <h2 className="process-phase-title">{phase.title}</h2>
                <p className="process-phase-text">{phase.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
