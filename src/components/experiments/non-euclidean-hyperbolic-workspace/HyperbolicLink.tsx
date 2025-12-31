import React, { useMemo } from 'react';
import { Complex, mobiusTransform, getGeodesicPath } from './HyperbolicMath';

interface HyperbolicLinkProps {
    start: Complex;
    end: Complex;
    viewCenter: Complex;
    viewportRadius: number;
}

export const HyperbolicLink = React.memo(function HyperbolicLink({
    start,
    end,
    viewCenter,
    viewportRadius
}: HyperbolicLinkProps) {
    // 1. Transform logical coordinates to visual coordinates based on current view
    // ViewCenter -> Origin
    const vStart = useMemo(() => mobiusTransform(start, viewCenter), [start, viewCenter]);
    const vEnd = useMemo(() => mobiusTransform(end, viewCenter), [end, viewCenter]);

    // 2. Generate SVG Path for the geodesic
    // We pass the viewport radius so the path string has pixel coordinates
    const pathD = useMemo(() => {
        return getGeodesicPath(vStart, vEnd, viewportRadius);
    }, [vStart, vEnd, viewportRadius]);

    return (
        <path
            d={pathD}
            stroke="url(#link-gradient)"
            strokeWidth="1.5"
            fill="none"
            pointerEvents="none"
            opacity="0.6"
            style={{ filter: 'url(#glow)' }}
        />
    );
});
