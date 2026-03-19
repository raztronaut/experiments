"use client";

import { type RefObject, useEffect } from "react";

/**
 * Observes canvas size and runs draw() on resize, deferred via requestAnimationFrame
 * so it doesn't run during View Transitions API navigation (avoids InvalidStateError).
 */
export function useCanvasResize(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  draw: () => void
): void {
  // biome-ignore lint/correctness/useExhaustiveDependencies: canvasRef is stable; re-run only when draw changes
  useEffect(() => {
    let rafId: number | undefined;
    const scheduleDraw = () => {
      rafId = requestAnimationFrame(() => draw());
    };
    scheduleDraw();
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ro = new ResizeObserver(scheduleDraw);
    ro.observe(canvas);
    return () => {
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
      ro.disconnect();
    };
  }, [draw]);
}
