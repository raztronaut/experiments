"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useRef } from "react";
import { isSentryEnabled } from "@/lib/sentry";

const HEALTHCHECK_PARAM = "sentry_test";
const HEALTHCHECK_VALUE = "healthcheck";

/**
 * One-time trigger: visiting any page with ?sentry_test=healthcheck emits a
 * deterministic Sentry signal:
 * - a message event (for Issues)
 * - a tiny traced span/transaction (for Performance)
 * - and, when profiling is enabled + supported, a profile attached to the trace
 *
 * Works in prod where /dev is disabled. Removes the param after firing.
 */
export function SentryHealthcheckTrigger() {
  const fired = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || fired.current || !isSentryEnabled()) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get(HEALTHCHECK_PARAM) !== HEALTHCHECK_VALUE) {
      return;
    }

    fired.current = true;

    Sentry.setTag("source", "prod-query-param");
    Sentry.setTag("test", "true");
    Sentry.captureMessage("Sentry healthcheck");

    // Keep it tiny and deterministic. With profileLifecycle: "trace", this should
    // attach a profile to the trace in supported environments.
    Sentry.startSpan(
      {
        op: "healthcheck",
        name: "Sentry healthcheck span",
        attributes: { "sentry.healthcheck": true },
      },
      () => {}
    );

    params.delete(HEALTHCHECK_PARAM);
    const newSearch = params.toString();
    const newUrl = newSearch
      ? `${window.location.pathname}?${newSearch}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, []);

  return null;
}
