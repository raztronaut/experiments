"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useRef } from "react";
import { useDevControls } from "@/hooks/useDevControls";
import { JESKOJETS_CONTENT } from "../data";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import "./jesko-jets-section.css";

gsap.registerPlugin(ScrollTrigger);

export function JeskoJetsSection() {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const scrollParams = useDevControls("JeskoJets Scroll", {
    windowScaleThreshold: { value: 0.5, min: 0.1, max: 0.9, step: 0.01 },
    maxWindowScale: { value: 4, min: 1, max: 10, step: 0.5 },
    copyRevealStart: { value: 0.66, min: 0.3, max: 0.95, step: 0.01 },
    zDepth: { value: 500, min: 0, max: 1500, step: 50 },
  });

  useGSAP(
    () => {
      const skyContainer = skyRef.current;
      const heroCopy = copyRef.current;
      const windowContainer = windowRef.current;
      const heroHeader = headerRef.current;

      if (!(skyContainer && heroCopy && windowContainer && heroHeader)) {
        return;
      }

      const skyContainerHeight = skyContainer.offsetHeight;
      const viewportHeight = window.innerHeight;
      const skyMoveDistance = skyContainerHeight - viewportHeight;

      if (reducedMotion) {
        gsap.set(windowContainer, { scale: 1 });
        gsap.set(heroHeader, { scale: 1, z: 0 });
        gsap.set(heroCopy, { yPercent: 0 });
        return;
      }

      gsap.set(heroCopy, { yPercent: 100 });

      ScrollTrigger.create({
        trigger: ".jesko-hero",
        start: "top top",
        end: `+=${window.innerHeight * 3}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const {
            windowScaleThreshold,
            maxWindowScale,
            copyRevealStart,
            zDepth,
          } = scrollParams;

          let windowScale: number;
          if (progress <= windowScaleThreshold) {
            windowScale =
              1 + (progress / windowScaleThreshold) * (maxWindowScale - 1);
          } else {
            windowScale = maxWindowScale;
          }
          gsap.set(windowContainer, { scale: windowScale });
          gsap.set(heroHeader, { scale: windowScale, z: progress * zDepth });

          gsap.set(skyContainer, { y: -progress * skyMoveDistance });

          const copyRevealDuration = 1 - copyRevealStart;
          let heroCopyY: number;
          if (progress <= copyRevealStart) {
            heroCopyY = 100;
          } else if (progress >= 1) {
            heroCopyY = 0;
          } else {
            heroCopyY =
              100 * (1 - (progress - copyRevealStart) / copyRevealDuration);
          }
          gsap.set(heroCopy, { yPercent: heroCopyY });
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <section className="jesko-hero">
        <div className="jesko-sky-container" ref={skyRef}>
          <Image
            alt=""
            fill
            sizes="100vw"
            src="/experiments/announcing-v2/sky.jpg"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="jesko-hero-copy" ref={copyRef}>
          <h1>{JESKOJETS_CONTENT.copy}</h1>
        </div>
        <div className="jesko-window-container" ref={windowRef}>
          <Image
            alt=""
            fill
            sizes="100vw"
            src="/experiments/announcing-v2/window.png"
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="jesko-hero-header" ref={headerRef}>
          <div className="jesko-col">
            <h1>{JESKOJETS_CONTENT.headerLeft.title}</h1>
            <p>{JESKOJETS_CONTENT.headerLeft.description}</p>
          </div>
          <div className="jesko-col">
            <p>{JESKOJETS_CONTENT.headerRight.label}</p>
            <h1>{JESKOJETS_CONTENT.headerRight.title}</h1>
          </div>
        </div>
      </section>

      <section className="jesko-outro">
        <h1>{JESKOJETS_CONTENT.outroText}</h1>
      </section>
    </div>
  );
}
