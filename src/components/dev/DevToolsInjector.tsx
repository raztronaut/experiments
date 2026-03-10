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
  if (production) {
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
