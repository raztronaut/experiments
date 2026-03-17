"use client";

import type React from "react";
import { useEffect, useState } from "react";

type LocationStatusComponent = React.ComponentType;

function runWhenIdle(cb: () => void) {
  if (typeof window === "undefined") {
    return;
  }
  if ("requestIdleCallback" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).requestIdleCallback(cb, { timeout: 1500 });
    return;
  }
  setTimeout(cb, 800);
}

export function LocationStatusEnhancer({
  staticElementId = "location-status-static",
}: {
  staticElementId?: string;
}) {
  const [Comp, setComp] = useState<LocationStatusComponent | null>(null);

  useEffect(() => {
    runWhenIdle(() => {
      import("./LocationStatus")
        .then((m) => {
          // Hide the server placeholder to avoid double content.
          document
            .getElementById(staticElementId)
            ?.setAttribute("hidden", "true");
          setComp(() => m.LocationStatus);
        })
        .catch(() => {});
    });
  }, [staticElementId]);

  if (!Comp) {
    return null;
  }

  return <Comp />;
}
