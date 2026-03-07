"use client";

import dynamic from "next/dynamic";

const ExperimentDevMetrics =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("./ExperimentDevMetrics").then((m) => ({
          default: m.ExperimentDevMetrics,
        }))
      )
    : () => null;

export function DevToolsInjector() {
  return <ExperimentDevMetrics />;
}
