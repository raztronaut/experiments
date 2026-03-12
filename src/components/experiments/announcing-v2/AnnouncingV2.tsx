"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  startTransition,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { UnifiedScrollHandle } from "@/lib/toolkit/scroll";
import { createUnifiedScroll } from "@/lib/toolkit/scroll";
import { CRTMonitor } from "./canvas/CRTMonitor";
import { ExperimentCanvas } from "./canvas/ExperimentCanvas";
import { MissionControlCanvas } from "./canvas/MissionControlCanvas";
import { TempleScene } from "./canvas/TempleScene";
import { VolumetricLightScene } from "./canvas/VolumetricLightScene";
import { useDeviceCapabilities } from "./hooks/useDeviceCapabilities";
import { BlueprintSection } from "./sections/BlueprintSection";
import { ClosingSection } from "./sections/ClosingSection";
import { JeskoJetsSection } from "./sections/JeskoJetsSection";
import { MissionControlSection } from "./sections/MissionControlSection";
import { PreloaderSection } from "./sections/PreloaderSection";
import { ProcessSection } from "./sections/ProcessSection";
import { ShowcaseSection } from "./sections/ShowcaseSection";
import { ProgressIndicator } from "./ui/ProgressIndicator";

gsap.registerPlugin(ScrollTrigger);

export default function AnnouncingV2() {
  const scrollRef = useRef<UnifiedScrollHandle | null>(null);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const { isMobile, isReducedMotion } = useDeviceCapabilities();

  useLayoutEffect(() => {
    if (!preloaderDone) {
      document.body.style.overflow = "hidden";
      return;
    }

    document.body.style.overflow = "";

    const isDebug = new URLSearchParams(window.location.search).has("debug");
    scrollRef.current = createUnifiedScroll({ debug: isDebug });
    ScrollTrigger.refresh();

    return () => {
      scrollRef.current?.destroy();
      document.body.style.overflow = "";
    };
  }, [preloaderDone]);

  const handlePreloaderComplete = useCallback(() => {
    startTransition(() => setPreloaderDone(true));
  }, []);

  return (
    <div className="announcing-v2-container">
      <ProgressIndicator />
      <ExperimentCanvas>
        <VolumetricLightScene />
        <CRTMonitor />
        <TempleScene />
        <MissionControlCanvas />
      </ExperimentCanvas>

      <PreloaderSection
        onComplete={
          isReducedMotion
            ? () => setPreloaderDone(true)
            : handlePreloaderComplete
        }
      />

      {preloaderDone && (
        <>
          <BlueprintSection />
          <ProcessSection />
          <ShowcaseSection isMobile={isMobile} />
          <MissionControlSection />
          <ClosingSection />
          <JeskoJetsSection />
        </>
      )}
    </div>
  );
}
