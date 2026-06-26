"use client";

import { useEffect } from "react";
import { UmamiEvents, useUmami } from "@/hooks/useUmami";

export function GlobalTracking() {
  const { track } = useUmami();

  useEffect(() => {
    const handleclick = (e: MouseEvent) => {
      // Use event delegation to handle clicks on elements inside an anchor tag (like icons)
      const anchor = (e.target as HTMLElement).closest("a");

      if (!anchor?.href) {
        return;
      }

      try {
        const url = new URL(anchor.href);
        const currentHostname = window.location.hostname;

        // Treat any non-empty foreign hostname as outbound; empty hostnames
        // (mailto:/tel:/local files) are skipped.
        if (url.hostname !== currentHostname && url.hostname !== "") {
          track(UmamiEvents.OUTBOUND_LINK, {
            url: anchor.href,
            hostname: url.hostname,
          });
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener("click", handleclick, { capture: true });

    return () => {
      document.removeEventListener("click", handleclick, { capture: true });
    };
  }, [track]);

  return null;
}
