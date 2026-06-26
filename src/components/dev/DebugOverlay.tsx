"use client";

import type { GSDevTools } from "gsap/GSDevTools";
import { Leva } from "leva";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useDebug } from "@/hooks/useDebug";

function DeviceInfo() {
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    setInfo(
      [
        `${window.innerWidth}×${window.innerHeight}`,
        `DPR ${window.devicePixelRatio}`,
        navigator.hardwareConcurrency
          ? `${navigator.hardwareConcurrency} cores`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    );
  }, []);

  if (!info) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        padding: "4px 8px",
        background: "rgba(0,0,0,0.75)",
        color: "#0f0",
        fontFamily: "monospace",
        fontSize: 11,
        borderRadius: 4,
        zIndex: 99_999,
        pointerEvents: "none",
      }}
    >
      {info}
    </div>
  );
}

/**
 * Dynamically loads GSDevTools when ?debug is active and GSAP is available.
 * Falls back to global timeline. Experiments can use useGSAPDebug() to link
 * to specific timelines with ids for scene jumping.
 */
function GsapDebugTools() {
  const instanceRef = useRef<GSDevTools | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const gsapMod = await import("gsap");
        const gsap = gsapMod.default || gsapMod.gsap;
        if (!gsap || cancelled) {
          return;
        }

        const { GSDevTools } = await import("gsap/GSDevTools");
        if (cancelled) {
          return;
        }

        gsap.registerPlugin(GSDevTools);
        instanceRef.current = GSDevTools.create({ minimal: true });
      } catch {
        // GSDevTools not available or GSAP not loaded
      }
    }

    init();

    return () => {
      cancelled = true;
      if (instanceRef.current) {
        instanceRef.current.kill();
        instanceRef.current = null;
      }
    };
  }, []);

  return null;
}

/**
 * Debug overlay activated by ?debug URL param.
 * Keyboard shortcuts (basement.studio Daylight pattern):
 *   D = device info
 *   L = toggle leva panel
 *   H = hide GSDevTools (GSAP native)
 */
function DebugOverlayInner() {
  const isDebug = useDebug();
  const [showDevice, setShowDevice] = useState(false);
  const [showLeva, setShowLeva] = useState(true);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!isDebug) {
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "d":
          setShowDevice((v) => !v);
          break;
        case "l":
          setShowLeva((v) => !v);
          break;
      }
    },
    [isDebug]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  if (!isDebug) {
    return null;
  }

  return (
    <>
      {showDevice && <DeviceInfo />}
      <Leva collapsed hidden={!showLeva} />
      <GsapDebugTools />
    </>
  );
}

/**
 * When ?debug is NOT active, hide the leva root entirely so experiments
 * using useControls don't show a floating panel in normal mode.
 */
function LevaHider() {
  const isDebug = useDebug();
  if (isDebug) {
    return null;
  }
  return <Leva hidden />;
}

export function DebugOverlay() {
  return (
    <Suspense fallback={null}>
      <LevaHider />
      <DebugOverlayInner />
    </Suspense>
  );
}
