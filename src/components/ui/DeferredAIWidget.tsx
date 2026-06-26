"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { runWhenIdle } from "@/lib/idle";

type AIWidgetComponent = React.ComponentType;

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
