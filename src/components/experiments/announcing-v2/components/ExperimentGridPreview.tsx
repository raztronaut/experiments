"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { usePrefersReducedMotion } from "../hooks";

const PREVIEW_EXPERIMENTS = [
  {
    title: "404 Not Found",
    profile: "r3f-scene",
    tech: ["r3f", "glsl"],
  },
  {
    title: "Mountain Transition",
    profile: "r3f-shader",
    tech: ["r3f", "glsl", "gsap"],
  },
  {
    title: "Send Button",
    profile: "interaction",
    tech: ["motion"],
  },
  {
    title: "Basketball Replay",
    profile: "r3f-scene",
    tech: ["r3f", "gsap"],
  },
  {
    title: "Cursor Depth Explorer",
    profile: "r3f-shader",
    tech: ["r3f", "glsl"],
  },
  {
    title: "Velocity Responsive",
    profile: "scrollytelling",
    tech: ["gsap", "motion"],
  },
];

export function ExperimentGridPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!containerRef.current) {
        return;
      }
      const cards =
        containerRef.current.querySelectorAll<HTMLElement>(".preview-card");

      if (prefersReducedMotion) {
        gsap.set(cards, { clearProps: "all", opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(cards, { opacity: 0, y: 30, scale: 0.95 });

      ScrollTrigger.batch(cards, {
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.06,
          }),
        start: "top 90%",
      });
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      ref={containerRef}
    >
      {PREVIEW_EXPERIMENTS.map((exp) => (
        <div
          className="preview-card group rounded-xl border border-white/8 bg-white/[0.02] p-5 transition-colors hover:border-white/15"
          key={exp.title}
        >
          <span className="mb-2 block font-mono text-[9px] text-white/25 uppercase tracking-widest">
            {exp.profile}
          </span>
          <h4 className="font-canvas font-semibold text-base text-white/70 transition-colors group-hover:text-white/90">
            {exp.title}
          </h4>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {exp.tech.map((t) => (
              <span
                className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] text-white/30"
                key={t}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
