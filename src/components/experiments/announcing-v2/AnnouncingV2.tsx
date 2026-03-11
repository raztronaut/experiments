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
import { useDeviceCapabilities } from "./hooks";
import { FiddleHoverSection } from "./sections/FiddleHoverSection";
import { InversaSection } from "./sections/InversaSection";
import { JeskoJetsSection } from "./sections/JeskoJetsSection";
import { PreloaderSection } from "./sections/PreloaderSection";
import { ShowcaseSection } from "./sections/ShowcaseSection";

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
    <main>
      <PreloaderSection
        onComplete={
          isReducedMotion
            ? () => setPreloaderDone(true)
            : handlePreloaderComplete
        }
      />
      {preloaderDone && (
        <>
          <InversaSection />
          <ShowcaseSection isMobile={isMobile} />
          <FiddleHoverSection />
          <JeskoJetsSection />
        </>
      )}
    </main>
  );
}
