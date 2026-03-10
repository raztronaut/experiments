"use client";

import { useEffect, useState } from "react";
import type { ExperimentMetrics } from "@/components/dev/ExperimentDevMetrics";

const METRICS_POLL_MS = 500;

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}

export function useExperimentMetrics() {
  const [metrics, setMetrics] = useState<ExperimentMetrics | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(window.__experimentMetrics ?? null);
    };

    updateMetrics();

    const intervalId = window.setInterval(updateMetrics, METRICS_POLL_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return metrics;
}
