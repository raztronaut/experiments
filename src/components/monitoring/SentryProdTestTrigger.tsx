"use client";

import { useEffect, useRef } from "react";
import { captureExperimentError, isSentryEnabled } from "@/lib/sentry";

const PROD_TEST_PARAM = "sentry_test";
const PROD_TEST_VALUE = "prod-verify";

/**
 * One-time trigger: visiting any page with ?sentry_test=prod-verify sends a
 * test error to Sentry (when DSN is set). Works in prod where /dev is disabled.
 * Removes the param from the URL after firing so the address bar is clean.
 */
export function SentryProdTestTrigger() {
  const fired = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || fired.current || !isSentryEnabled()) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get(PROD_TEST_PARAM) !== PROD_TEST_VALUE) {
      return;
    }
    fired.current = true;
    captureExperimentError(new Error("Sentry prod test"), undefined, {
      source: "prod-query-param",
      test: "true",
    });
    params.delete(PROD_TEST_PARAM);
    const newSearch = params.toString();
    const newUrl = newSearch
      ? `${window.location.pathname}?${newSearch}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, []);

  return null;
}
