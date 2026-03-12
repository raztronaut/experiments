"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ExperimentDevMetrics =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("./ExperimentDevMetrics").then((m) => ({
          default: m.ExperimentDevMetrics,
        }))
      )
    : () => null;

const DebugOverlay =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("./DebugOverlay").then((m) => ({
            default: m.DebugOverlay,
          })),
        { ssr: false }
      )
    : () => null;

const ExperimentDevMetricsProd = dynamic(() =>
  import("./ExperimentDevMetrics").then((m) => ({
    default: m.ExperimentDevMetrics,
  }))
);

const DebugOverlayProd = dynamic(
  () =>
    import("./DebugOverlay").then((m) => ({
      default: m.DebugOverlay,
    })),
  { ssr: false }
);

interface DevToolsInjectorProps {
  production?: boolean;
}

export function DevToolsInjector({ production }: DevToolsInjectorProps = {}) {
  const [isDebug, setIsDebug] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("debug")) {
      setIsDebug(true);
    }
  }, []);

  if (production || isDebug) {
    return (
      <>
        <ExperimentDevMetricsProd />
        <DebugOverlayProd />
      </>
    );
  }

  return (
    <>
      <ExperimentDevMetrics />
      <DebugOverlay />
    </>
  );
}
