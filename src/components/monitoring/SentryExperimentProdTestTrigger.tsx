"use client";

import { useEffect, useRef } from "react";
import { captureExperimentError, isSentryEnabled } from "@/lib/sentry";

const EXPERIMENT_TEST_PARAM = "sentry_test";
const EXPERIMENT_TEST_VALUE = "experiment-verify";
const EXPERIMENT_SLUG = "bugged-out-game-of-life-shader-experiment";

/**
 * One-time trigger: visiting any page with ?sentry_test=experiment-verify sends a
 * test error to Sentry with route=experiment and slug tags (when DSN is set).
 * Used to verify experiment error boundary tagging. Removes the param after firing.
 */
export function SentryExperimentProdTestTrigger() {
  const fired = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || fired.current || !isSentryEnabled()) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get(EXPERIMENT_TEST_PARAM) !== EXPERIMENT_TEST_VALUE) {
      return;
    }
    fired.current = true;
    captureExperimentError(new Error("Sentry experiment test"), undefined, {
      source: "prod-query-param",
      test: "true",
      route: "experiment",
      slug: EXPERIMENT_SLUG,
    });
    params.delete(EXPERIMENT_TEST_PARAM);
    const newSearch = params.toString();
    const newUrl = newSearch
      ? `${window.location.pathname}?${newSearch}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, []);

  return null;
}
