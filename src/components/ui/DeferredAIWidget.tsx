"use client";

import type React from "react";
import { useEffect, useState } from "react";

type AIWidgetComponent = React.ComponentType;

function runWhenIdle(cb: () => void) {
  if (typeof window === "undefined") {
    return;
  }

  // Prefer requestIdleCallback; fallback to a small delay.
  if ("requestIdleCallback" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).requestIdleCallback(cb, { timeout: 1500 });
    return;
  }

  setTimeout(cb, 800);
}

/**
 * Loads the heavy AI widget after LCP/idle.
 * Keeps initial JS on `/` smaller on Mobile.
 */
export function DeferredAIWidget() {
  const [Widget, setWidget] = useState<AIWidgetComponent | null>(null);

  useEffect(() => {
    runWhenIdle(() => {
      import("./AIWidget")
        .then((m) => setWidget(() => m.AIWidget))
        .catch(() => {});
    });
  }, []);

  if (!Widget) {
    return null;
  }

  return <Widget />;
}
