"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { runWhenIdle } from "@/lib/idle";

type LocationStatusComponent = React.ComponentType;

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
