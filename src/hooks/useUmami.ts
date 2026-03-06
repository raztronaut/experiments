"use client";

import { useCallback } from "react";

// Event categories for consistent naming
export const UmamiEvents = {
  // Navigation events
  EXPERIMENT_VIEW: "experiment_view",
  EXPERIMENT_OPEN_DRAWER: "experiment_open_drawer",
  EXPERIMENT_OPEN_FULL: "experiment_open_full",
  DRAWER_CLOSE: "drawer_close",
  BACK_BUTTON_CLICK: "back_button_click",

  // External links
  OUTBOUND_LINK: "outbound_link",
  GITHUB_CLICK: "github_click",
  SOCIAL_CLICK: "social_click",
} as const;

export type UmamiEventName = (typeof UmamiEvents)[keyof typeof UmamiEvents];

export function useUmami() {
  const track = useCallback(
    (event: string, data?: Record<string, string | number | boolean>) => {
      if (typeof window !== "undefined" && window.umami) {
        window.umami.track(event, data);
      }
    },
    []
  );

  const trackExperiment = useCallback(
    (
      action: string,
      experiment: {
        slug: string;
        title: string;
      }
    ) => {
      track(action, {
        experiment_slug: experiment.slug,
        experiment_title: experiment.title,
      });
    },
    [track]
  );

  const trackOutboundLink = useCallback(
    (url: string, label?: string) => {
      track(UmamiEvents.OUTBOUND_LINK, {
        url,
        label: label || url,
      });
    },
    [track]
  );

  return { track, trackExperiment, trackOutboundLink };
}
