"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { useExperimentMetrics, usePrefersReducedMotion } from "../hooks";

interface MetricCard {
  label: string;
  status: string;
  value: string;
}

function formatMetricCards(
  hasMetrics: boolean,
  metrics: ReturnType<typeof useExperimentMetrics>
): MetricCard[] {
  if (!metrics) {
    return [
      { label: "FPS", value: "Waiting", status: "debug only" },
      { label: "Heap", value: "Waiting", status: "dev metrics" },
      { label: "CLS", value: "Waiting", status: "session data" },
      { label: "GSAP Tweens", value: "Waiting", status: "runtime scan" },
    ];
  }

  return [
    {
      label: "FPS",
      value: String(metrics.fps),
      status: hasMetrics ? "live" : "debug only",
    },
    {
      label: "Heap",
      value: metrics.heap,
      status: hasMetrics ? "live" : "dev metrics",
    },
    {
      label: "CLS",
      value: metrics.cls.toFixed(3),
      status: hasMetrics ? "live" : "session data",
    },
    {
      label: "GSAP Tweens",
      value: metrics.gsapTweens === null ? "n/a" : String(metrics.gsapTweens),
      status: hasMetrics ? "live" : "runtime scan",
    },
  ];
}

export function MetricsVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const metrics = useExperimentMetrics();
  const prefersReducedMotion = usePrefersReducedMotion();
  const cards = formatMetricCards(Boolean(metrics), metrics);

  useGSAP(
    () => {
      if (!containerRef.current) {
        return;
      }
      const metricCards =
        containerRef.current.querySelectorAll<HTMLElement>(".metric-card");

      if (prefersReducedMotion) {
        gsap.set(metricCards, { clearProps: "all", opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        metricCards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
        }
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4" ref={containerRef}>
      {cards.map((metric) => (
        <div
          className="metric-card rounded-xl border border-white/8 bg-white/[0.02] p-5"
          key={metric.label}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
              {metric.label}
            </span>
            <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
              {metric.status}
            </span>
          </div>
          <div className="mt-3">
            <span className="font-bold font-canvas text-3xl text-emerald-400/80">
              {metric.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
