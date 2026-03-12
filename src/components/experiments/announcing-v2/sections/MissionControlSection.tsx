"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { MISSION_CONTROL_CONTENT } from "../data";
import "./mission-control-section.css";

gsap.registerPlugin(ScrollTrigger);

const MAX_VALUES: Record<string, number> = {
  "EXPERIMENTS SHIPPED": 25,
  "CUSTOM SHADERS": 10,
  TECHNOLOGIES: 20,
  "COMPONENTS BUILT": 60,
  UPTIME: 100,
};

export function MissionControlSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        once: true,
        onEnter: () => setRevealed(true),
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <section
        className={`${revealed ? "mission-control-reveal" : ""} mission-control-section`}
        ref={sectionRef}
      >
        <div className="mission-control-header">
          <p className="mission-control-station-label">
            {MISSION_CONTROL_CONTENT.stationLabel}
          </p>
          <h2 className="mission-control-title">System Diagnostics</h2>
        </div>

        <div className="mission-control-gauges">
          {MISSION_CONTROL_CONTENT.stats.map((stat) => (
            <div className="mission-control-gauge" key={stat.label}>
              <p className="mission-control-gauge-value">
                {stat.value}
                {stat.unit}
              </p>
              <p className="mission-control-gauge-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
