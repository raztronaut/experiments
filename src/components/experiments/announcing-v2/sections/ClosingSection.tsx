"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export function ClosingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) {
        gsap.set(titleRef.current, { y: 0, opacity: 1 });
        return;
      }
      gsap.from(titleRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      className="closing-section flex min-h-screen flex-col items-center justify-center bg-[#050507] px-8 text-center"
      ref={sectionRef}
    >
      <h2
        className="max-w-4xl font-light font-serif text-6xl text-white tracking-tight md:text-8xl"
        ref={titleRef}
      >
        The Future is <span className="italic">Yours</span> to Build.
      </h2>
      <p className="mt-8 font-mono text-white/30 text-xs tracking-[0.3em]">
        RAZI'S EXPERIMENTS LAB © 2026
      </p>
    </section>
  );
}
