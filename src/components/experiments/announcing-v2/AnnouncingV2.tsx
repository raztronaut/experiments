"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll";
import { createUnifiedScroll } from "@/lib/toolkit/scroll";
import { usePrefersReducedMotion } from "./hooks";
import { AIBridgeSection } from "./sections/AIBridgeSection";
import { ArchitectureSection } from "./sections/ArchitectureSection";
import { ClosingSection } from "./sections/ClosingSection";
import { HeroSection } from "./sections/HeroSection";
import { ManifestoSection } from "./sections/ManifestoSection";
import { PublishingSection } from "./sections/PublishingSection";
import { ToolkitSection } from "./sections/ToolkitSection";

gsap.registerPlugin(ScrollTrigger);

import { GlobalCanvas } from "./components/GlobalCanvas";

export default function AnnouncingV2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<UnifiedScrollHandle | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const isDebug = window.location.search.includes("debug");
    scrollRef.current = createUnifiedScroll({
      debug: isDebug,
      lenisOptions: prefersReducedMotion
        ? { lerp: 1, smoothWheel: false, syncTouch: false }
        : undefined,
    });
    ScrollTrigger.refresh();
    return () => scrollRef.current?.destroy();
  }, [prefersReducedMotion]);

  return (
    <div
      className="relative bg-[#0a0a0c] antialiased selection:bg-white/10"
      ref={containerRef}
    >
      <GlobalCanvas />

      {/* Global Noise Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-32 pb-32 text-white">
        <HeroSection />
        <ManifestoSection />
        <ToolkitSection />
        <AIBridgeSection />
        <ArchitectureSection />
        <PublishingSection />
        <ClosingSection />
      </div>
    </div>
  );
}
