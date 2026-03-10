"use client";

import { useEffect, useRef } from "react";

const REPORT_INTERVAL_MS = 2000;

interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

declare global {
  interface Window {
    __experimentMetrics?: ExperimentMetrics;
  }
}

export interface ExperimentMetrics {
  cls: number;
  fps: number;
  fpsMin: number;
  gsapTweens: number | null;
  heap: string;
  r3f?: {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
  };
  scene?: string;
  timestamp: number;
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getGsapTweenCount(): number | null {
  try {
    const gsap = (window as unknown as Record<string, unknown>).gsap as
      | {
          globalTimeline?: {
            getChildren: (
              a: boolean,
              b: boolean,
              c: boolean
            ) => { isActive: () => boolean }[];
          };
        }
      | undefined;
    if (!gsap?.globalTimeline) {
      return null;
    }
    return gsap.globalTimeline
      .getChildren(true, true, false)
      .filter((t) => t.isActive()).length;
  } catch {
    return null;
  }
}

function updateGlobalMetrics(partial: Partial<ExperimentMetrics>) {
  window.__experimentMetrics = {
    ...(window.__experimentMetrics ?? {
      timestamp: 0,
      fps: 0,
      fpsMin: 0,
      heap: "n/a",
      cls: 0,
      gsapTweens: null,
    }),
    ...partial,
    timestamp: Date.now(),
  };
}

/**
 * Logs FPS, JS heap, CLS, and GSAP tween count every 2 seconds.
 * Writes to both console (warn level for MCP visibility) and
 * window.__experimentMetrics for programmatic querying by AI agents.
 */
export function ExperimentDevMetrics() {
  const frameTimesRef = useRef<number[]>([]);
  const lastReportRef = useRef(performance.now());
  const clsRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let clsObserver: PerformanceObserver | undefined;
    try {
      clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!shift.hadRecentInput) {
            clsRef.current += shift.value ?? 0;
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

          const mem = (performance as unknown as { memory?: PerformanceMemory })
            .memory;
          const heap = mem ? formatBytes(mem.usedJSHeapSize) : "n/a";
          const cls = Math.round(clsRef.current * 1000) / 1000;

          const tweens = getGsapTweenCount();
          const gsapStr = tweens !== null ? ` gsap_tweens=${tweens}` : "";

          console.warn(
            `[DevMetrics] fps=${fps} fps_min=${fpsMin} heap=${heap} cls=${cls}${gsapStr}`
          );

          updateGlobalMetrics({ fps, fpsMin, heap, cls, gsapTweens: tweens });
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
