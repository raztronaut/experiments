"use client";

import { useEffect, useRef } from "react";

const REPORT_INTERVAL_MS = 2000;

interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * Logs FPS, JS heap, and CLS to the console every 2 seconds.
 * Designed for AI agents to read from the dev server terminal.
 * Include in experiment layouts in dev mode only.
 */
export function ExperimentDevMetrics() {
  const frameTimesRef = useRef<number[]>([]);
  const lastReportRef = useRef(performance.now());
  const clsRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // CLS observer
    let clsObserver: PerformanceObserver | undefined;
    try {
      clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsRef.current += (entry as any).value ?? 0;
          }
        }
      });
      clsObserver.observe({ type: "layout-shift", buffered: true });
    } catch {
      // PerformanceObserver for layout-shift not supported
    }

    let lastFrameTime = performance.now();

    const tick = () => {
      const now = performance.now();
      frameTimesRef.current.push(now - lastFrameTime);
      lastFrameTime = now;

      if (now - lastReportRef.current >= REPORT_INTERVAL_MS) {
        const frameTimes = frameTimesRef.current;
        if (frameTimes.length > 0) {
          const avgFrameTime =
            frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const maxFrameTime = Math.max(...frameTimes);
          const fps = Math.round((1000 / avgFrameTime) * 10) / 10;
          const fpsMin = Math.round((1000 / maxFrameTime) * 10) / 10;

          const mem = (performance as any).memory as
            | PerformanceMemory
            | undefined;
          const heap = mem ? formatBytes(mem.usedJSHeapSize) : "n/a";
          const cls = Math.round(clsRef.current * 1000) / 1000;

          console.log(
            `[DevMetrics] fps=${fps} fps_min=${fpsMin} heap=${heap} cls=${cls}`
          );
        }

        frameTimesRef.current = [];
        lastReportRef.current = now;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clsObserver?.disconnect();
    };
  }, []);

  return null;
}
