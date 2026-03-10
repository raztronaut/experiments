"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

interface KineticTitleProps {
  className?: string;
  text: string;
  version: string;
}

export function KineticTitle({ text, version, className }: KineticTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useGSAP(
    () => {
      if (!containerRef.current) {
        return;
      }
      const chars = charsRef.current.filter(Boolean);
      const versionEl = containerRef.current.querySelector(".version-badge");

      gsap.set(chars, { opacity: 0, y: 80, rotateX: -90 });
      gsap.set(versionEl, { opacity: 0, scale: 0, rotateZ: -15 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.3,
      });

      tl.to(chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: { amount: 0.6, from: "random" },
      }).to(
        versionEl,
        {
          opacity: 1,
          scale: 1,
          rotateZ: 0,
          duration: 0.6,
          ease: "back.out(2)",
        },
        "-=0.3"
      );
    },
    { scope: containerRef }
  );

  const words = text.split(" ");

  return (
    <div className={className} ref={containerRef}>
      <h1 className="font-canvas font-extrabold text-[clamp(4rem,14vw,14rem)] text-white uppercase leading-[0.8] tracking-[-0.04em] mix-blend-difference">
        {words.map((word, wi) => (
          <span className="mr-[0.25em] inline-block" key={wi}>
            {word.split("").map((char, ci) => {
              const globalIndex = words.slice(0, wi).join("").length + ci + wi;
              return (
                <span
                  className="inline-block"
                  key={`${wi}-${ci}`}
                  ref={(el) => {
                    if (el) {
                      charsRef.current[globalIndex] = el;
                    }
                  }}
                  style={{ willChange: "transform, opacity" }}
                >
                  {char}
                </span>
              );
            })}
          </span>
        ))}
      </h1>
      <div className="version-badge mt-6 inline-block rounded-full border border-white/20 bg-white/5 px-6 py-2 font-canvas font-medium text-[clamp(1rem,2vw,1.5rem)] text-white/80 tracking-widest backdrop-blur-sm">
        {version}
      </div>
    </div>
  );
}
