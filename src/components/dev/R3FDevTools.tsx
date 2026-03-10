"use client";

import { useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { useDebug } from "@/hooks/useDebug";
import { R3FSceneInspector } from "./R3FSceneInspector";

const REPORT_INTERVAL_MS = 2000;

function R3FMetricsPiper() {
  const { gl } = useThree();
  const isDebug = useDebug();

  useEffect(() => {
    if (!isDebug) {
      return;
    }

    const interval = setInterval(() => {
      const info = gl.info;
      const render = info.render;
      const memory = info.memory;

      const r3f = {
        calls: render.calls,
        triangles: render.triangles,
        geometries: memory.geometries,
        textures: memory.textures,
      };

      console.warn(
        `[R3FMetrics] calls=${r3f.calls} triangles=${r3f.triangles}` +
          ` geometries=${r3f.geometries} textures=${r3f.textures}`
      );

      if (window.__experimentMetrics) {
        window.__experimentMetrics.r3f = r3f;
        window.__experimentMetrics.timestamp = Date.now();
      }
    }, REPORT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [gl, isDebug]);

  return null;
}

function DebugPerfPanel() {
  const isDebug = useDebug();
  if (!isDebug) {
    return null;
  }
  return <PerfPanelLazy />;
}

function PerfPanelLazy() {
  const PerfRef = useRef<typeof import("r3f-perf").Perf | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("r3f-perf")
      .then((mod) => {
        PerfRef.current = mod.Perf;
        setLoaded(true);
      })
      .catch(() => {});
  }, []);

  if (!(loaded && PerfRef.current)) {
    return null;
  }

  const Perf = PerfRef.current;
  return <Perf position="top-left" />;
}

function DebugSceneInspector() {
  const isDebug = useDebug();
  if (!isDebug) {
    return null;
  }
  return <R3FSceneInspector />;
}

export function R3FDevTools() {
  return (
    <Suspense fallback={null}>
      <R3FMetricsPiper />
      <DebugSceneInspector />
      <DebugPerfPanel />
      <DebugCameraLoader />
    </Suspense>
  );
}

function DebugCameraLoader() {
  const isDebug = useDebug();
  if (!isDebug) {
    return null;
  }
  return <DebugCameraLazy />;
}

function DebugCameraLazy() {
  const CamRef = useRef<typeof import("./DebugCamera").DebugCamera | null>(
    null
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("./DebugCamera")
      .then((mod) => {
        CamRef.current = mod.DebugCamera;
        setLoaded(true);
      })
      .catch(() => {});
  }, []);

  if (!(loaded && CamRef.current)) {
    return null;
  }

  const Cam = CamRef.current;
  return <Cam />;
}
