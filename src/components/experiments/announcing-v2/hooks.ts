import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export function useDeviceCapabilities() {
  const [caps, setCaps] = useState({
    isMobile: false,
    isReducedMotion: false,
    supportsWebGL2: true,
  });

  useEffect(() => {
    setCaps({
      isMobile:
        window.matchMedia("(pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0,
      isReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches,
      supportsWebGL2: !!document.createElement("canvas").getContext("webgl2"),
    });
  }, []);

  return caps;
}
