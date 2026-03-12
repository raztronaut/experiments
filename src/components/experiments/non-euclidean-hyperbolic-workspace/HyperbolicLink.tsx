import React, { useMemo } from "react";
import {
  type Complex,
  getGeodesicPath,
  mobiusTransform,
} from "./HyperbolicMath";

interface HyperbolicLinkProps {
  end: Complex;
  start: Complex;
  viewCenter: Complex;
  viewportRadius: number;
}

export const HyperbolicLink = React.memo(function HyperbolicLink({
  start,
  end,
  viewCenter,
  viewportRadius,
}: HyperbolicLinkProps) {
  const pathD = useMemo(() => {
    const vStart = mobiusTransform(start, viewCenter);
    const vEnd = mobiusTransform(end, viewCenter);
    return getGeodesicPath(vStart, vEnd, viewportRadius);
  }, [start, end, viewCenter, viewportRadius]);

  return (
    <path
      d={pathD}
      fill="none"
      opacity="0.6"
      pointerEvents="none"
      stroke="url(#link-gradient)"
      strokeWidth="1.5"
    />
  );
});
