"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll";
import { createUnifiedScroll } from "@/lib/toolkit/scroll";
import type { AirplaneScene } from "./hooks/useAirplaneScene";
import { useAirplaneScene } from "./hooks/useAirplaneScene";
import { BlueprintSection } from "./sections/BlueprintSection";
import { EndSection } from "./sections/EndSection";
import { HeroSection } from "./sections/HeroSection";
import { NarrativeSection } from "./sections/NarrativeSection";
import "./styles.css";
import { buildFlightTimeline } from "./timeline";

gsap.registerPlugin(ScrollTrigger);

export default function Airplanes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<UnifiedScrollHandle | null>(null);
  const [scene, setScene] = useState<AirplaneScene | null>(null);
  const { init } = useAirplaneScene();

  useEffect(() => {
    scrollRef.current = createUnifiedScroll();
    ScrollTrigger.refresh();
    return () => scrollRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    let cancelled = false;
    const container = containerRef.current;

    init(container).then((s) => {
      if (!cancelled && s) {
        setScene(s);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [init]);

  useGSAP(
    () => {
      if (scene) {
        buildFlightTimeline(scene);
      }
    },
    { scope: containerRef, dependencies: [scene] }
  );

  return (
    <div className="airplanes-root" ref={containerRef}>
      <div className="airplanes-loading">Loading</div>
      <div className="airplanes-content">
        <HeroSection />
        <NarrativeSection />
        <BlueprintSection />
        <EndSection />
      </div>
    </div>
  );
}
