import { type RefObject, useEffect, useState } from "react";

export function useViewportRadius(
  containerRef: RefObject<HTMLDivElement | null>
) {
  const [viewportRadius, setViewportRadius] = useState(300);

  useEffect(() => {
    const updateRadius = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewportRadius(Math.min(rect.width, rect.height) / 2);
      }
    };

    updateRadius();

    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, [containerRef]);

  return viewportRadius;
}
