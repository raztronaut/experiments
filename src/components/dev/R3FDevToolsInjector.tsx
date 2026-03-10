"use client";

import dynamic from "next/dynamic";

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
 * Tree-shakes to nothing in production unless production={true}.
 */
export function R3FDevToolsInjector({
  production,
}: R3FDevToolsInjectorProps = {}) {
  if (production) {
    return <R3FDevToolsProd />;
  }
  return <R3FDevTools />;
}
