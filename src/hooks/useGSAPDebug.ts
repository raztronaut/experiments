"use client";

import type { GSDevTools } from "gsap/GSDevTools";
import { useEffect, useRef } from "react";
import { useDebug } from "./useDebug";

/**
 * Links a GSAP timeline to GSDevTools when ?debug is active.
 * Per the official docs, linking to a specific animation is the best practice
 * (avoids global timeline sync issues, enables scene jumping via id).
 *
 * Usage:
 * ```tsx
 * const tl = useRef<gsap.core.Timeline>(null);
 * useGSAP(() => {
 *   tl.current = gsap.timeline({ id: "hero" });
 *   tl.current.to(".box", { x: 100, id: "box-slide" });
 * }, { scope: containerRef });
 * useGSAPDebug(tl.current, "hero");
 * ```
 */
export function useGSAPDebug(
  timeline: gsap.core.Timeline | null | undefined,
  id: string
) {
  const isDebug = useDebug();
  const instanceRef = useRef<GSDevTools | null>(null);

  useEffect(() => {
    if (!(isDebug && timeline)) {
      return;
    }

    const activeTimeline = timeline;
    let cancelled = false;

    async function init() {
      try {
        const gsapMod = await import("gsap");
        const gsap = gsapMod.default || gsapMod.gsap;
        if (!gsap || cancelled) {
          return;
        }

        const { GSDevTools } = await import("gsap/GSDevTools");
        if (cancelled) {
          return;
        }

        gsap.registerPlugin(GSDevTools);

        instanceRef.current = GSDevTools.create({
          animation: activeTimeline,
          id,
          minimal: false,
        });
      } catch {
        // GSDevTools not available
      }
    }

    init();

    return () => {
      cancelled = true;
      if (instanceRef.current) {
        instanceRef.current.kill();
        instanceRef.current = null;
      }
    };
  }, [isDebug, timeline, id]);
}
