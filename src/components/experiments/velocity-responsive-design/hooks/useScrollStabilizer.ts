"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

interface ScrollAnchor {
  index: number;
  viewportOffset: number;
}

const CORRECTION_FRAMES = 36; // ~600ms at 60fps, matches spring animation duration

/**
 * Tracks a visual anchor element and compensates for layout shifts
 * when the reading state changes (content morphs between detailed/skim).
 */
export function useScrollStabilizer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  readingState: string,
  lockVelocity: () => void
) {
  const lastAnchorRef = useRef<ScrollAnchor | null>(null);

  useEffect(() => {
    const updateAnchor = () => {
      if (!containerRef.current) {
        return;
      }

      const children = containerRef.current.children;
      const viewportTarget = window.innerHeight * 0.4;

      let closestIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < children.length; i++) {
        const distance = Math.abs(
          children[i].getBoundingClientRect().top - viewportTarget
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      const el = children[closestIndex];
      if (el) {
        lastAnchorRef.current = {
          index: closestIndex,
          viewportOffset: el.getBoundingClientRect().top,
        };
      }
    };

    window.addEventListener("scroll", updateAnchor, { passive: true });
    updateAnchor();
    return () => window.removeEventListener("scroll", updateAnchor);
  }, [containerRef]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: readingState is a trigger -- the effect compensates for layout shifts caused by state change
  useLayoutEffect(() => {
    if (!(lastAnchorRef.current && containerRef.current)) {
      return;
    }

    const anchor = lastAnchorRef.current;
    const target = containerRef.current.children[anchor.index] as HTMLElement;
    if (!target) {
      return;
    }

    lockVelocity();

    const initialDelta =
      target.getBoundingClientRect().top - anchor.viewportOffset;
    if (Math.abs(initialDelta) > 0.5) {
      window.scrollBy({
        top: initialDelta,
        behavior: "instant" as ScrollBehavior,
      });
    }

    let frame = 0;
    let correctionRaf = 0;
    const correct = () => {
      const delta = target.getBoundingClientRect().top - anchor.viewportOffset;
      if (Math.abs(delta) > 0.5) {
        window.scrollBy({ top: delta, behavior: "instant" as ScrollBehavior });
      }
      frame++;
      if (frame < CORRECTION_FRAMES) {
        correctionRaf = requestAnimationFrame(correct);
      }
    };
    correctionRaf = requestAnimationFrame(correct);

    return () => cancelAnimationFrame(correctionRaf);
  }, [readingState, lockVelocity, containerRef]);
}
