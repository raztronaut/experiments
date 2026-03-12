import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export function useDeviceCapabilities() {
  const isReducedMotion = usePrefersReducedMotion();
  const [caps, setCaps] = useState({
    isMobile: false,
    supportsWebGL2: true,
  });

  useEffect(() => {
    setCaps({
      isMobile:
        window.matchMedia("(pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0,
      supportsWebGL2: !!document.createElement("canvas").getContext("webgl2"),
    });
  }, []);

  return { ...caps, isReducedMotion };
}
