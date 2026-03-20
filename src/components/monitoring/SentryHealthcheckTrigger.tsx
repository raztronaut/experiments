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

    // Explicit root transaction + nested span so Sentry Performance shows the trace.
    // forceTransaction ensures a root transaction in the UI.
    Sentry.startSpan(
      {
        op: "healthcheck",
        name: "Sentry healthcheck",
        forceTransaction: true,
      },
      () => {
        Sentry.startSpan(
          {
            op: "healthcheck",
            name: "Sentry healthcheck span",
            attributes: { "sentry.healthcheck": true },
          },
          () => {}
        );
      }
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
