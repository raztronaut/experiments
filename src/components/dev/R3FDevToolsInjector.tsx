"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const R3FDevTools =
  process.env.NODE_ENV === "development"
    ? dynamic(() =>
        import("./R3FDevTools").then((m) => ({ default: m.R3FDevTools }))
      )
    : () => null;

const R3FDevToolsProd = dynamic(() =>
  import("./R3FDevTools").then((m) => ({ default: m.R3FDevTools }))
);

interface R3FDevToolsInjectorProps {
  production?: boolean;
}

/**
 * Canvas-level dev tools injector. Place inside <Canvas>.
 * Mirrors DevToolsInjector (layout-level, outside Canvas) but for R3F internals.
 * Tree-shakes to nothing in production unless production={true} or ?debug is in the URL.
 */
export function R3FDevToolsInjector({
  production,
}: R3FDevToolsInjectorProps = {}) {
  const [isDebug, setIsDebug] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("debug")) {
      setIsDebug(true);
    }
  }, []);

  if (production || isDebug) {
    return <R3FDevToolsProd />;
  }
  return <R3FDevTools />;
}
