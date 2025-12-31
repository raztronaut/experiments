import React, { useMemo } from 'react';
import { Complex, mobiusTransform, getGeodesicPath } from './HyperbolicMath';

interface HyperbolicGridProps {
    viewCenter: Complex;
    viewportRadius: number;
}

export const HyperbolicGrid = React.memo(function HyperbolicGrid({
    viewCenter,
    viewportRadius
}: HyperbolicGridProps) {
    // Generate grid lines
    // 1. Radial geodesics (lines passing through origin)
    // In the Poincare disk, lines through the origin are straight lines.
    // However, when the view is transformed, they might curve.
    // A radial line at angle theta is a geodesic from 0 to e^(i*theta).
    // We want to draw these "grid lines" which are fixed in the "World".
    // So we define them in logical space, then transform them by viewCenter.

    const gridPaths = useMemo(() => {
        const paths: string[] = [];
        const step = 0.2; // Spacing for grid lines along the axes
        const limit = 0.95; // Don't go too close to edge

        // Helper to generate a geodesic arc orthogonal to an axis (Real or Imaginary)
        // For the Real axis (horizontal diameter), lines orthogonal to it are "vertical coordinate lines".
        // For a point x0 on Real axis, the geodesic orthogonal to Real axis at x0 is a circle.
        // Center C is on Real axis. Orthogonal to unit disk. Passes through x0.
        // C = (x0^2 + 1) / (2*x0). R = sqrt(C^2 - 1).

        // We generate lines for x0 in (-1, 1).
        // Exceptions: x0=0 -> The imaginary axis (straight line).

        const generateOrthogonalArcs = (isVerticalGrid: boolean) => {
            for (let t = -limit; t <= limit; t += step) {
                if (Math.abs(t) < 0.01) {
                    // Central line (Axis itself)
                    // If isVerticalGrid (lines cutting X axis), central one is the Y axis (Imaginary axis).
                    // Start (0, -1) to (0, 1).
                    // If isHorizontalGrid (lines cutting Y axis), central one is X axis.
                    // Start (-1, 0) to (1, 0).

                    const start = isVerticalGrid ? new Complex(0, -0.999) : new Complex(-0.999, 0);
                    const end = isVerticalGrid ? new Complex(0, 0.999) : new Complex(0.999, 0);

                    const vStart = mobiusTransform(start, viewCenter);
                    const vEnd = mobiusTransform(end, viewCenter);
                    paths.push(getGeodesicPath(vStart, vEnd, viewportRadius));
                    continue;
                }

                // General case: Circular arc
                // For vertical grid: intersects X axis at t. Center on X axis.
                // For horizontal grid: intersects Y axis at t. Center on Y axis.

                const val = t;
                const C_scalar = (val * val + 1) / (2 * val);

                // Construct the circle in Logical Space.
                // We need to sample it or find start/end points on the boundary to use getGeodesicPath?
                // getGeodesicPath connects two points inside the disk.
                // The grid line goes from boundary to boundary.
                // Intersection of Circle(C, R) with Unit circle?
                // Two points: z1, z2.
                // Since circle is orthogonal to unit disk, they intersect at 90 deg.

                // Let's find intersection points of Circle (x-C)^2 + y^2 = R^2 and x^2 + y^2 = 1.
                // (x-C)^2 + 1 - x^2 = R^2 => x^2 - 2xC + C^2 + 1 - x^2 = R^2
                // -2xC + C^2 + 1 = R^2
                // 2xC = C^2 + 1 - R^2.
                // Since R^2 = C^2 - 1, then R^2 - C^2 = -1.
                // 2xC = 1 - (-1) = 2 => xC = 1 => x = 1/C.
                // So the intersection x-coord is 1/C.
                // y = +/- sqrt(1 - x^2).

                const intersectX = 1 / C_scalar;
                const intersectY = Math.sqrt(Math.max(0, 1 - intersectX * intersectX));

                let p1, p2;
                if (isVerticalGrid) {
                    // Centers on X axis. Intersections have calc coordinates.
                    p1 = new Complex(intersectX, intersectY);
                    p2 = new Complex(intersectX, -intersectY);
                } else {
                    // Centers on Y axis. Swap X/Y.
                    // Circle is x^2 + (y-C)^2 = R^2.
                    // Intersection y = 1/C.
                    // x = +/- sqrt(1 - y^2).
                    p1 = new Complex(intersectY, intersectX); // swap x/y for result
                    p2 = new Complex(-intersectY, intersectX);
                }

                // Scale down slightly to 0.999 to hold numerical stability in transform
                p1 = p1.mul(new Complex(0.999, 0));
                p2 = p2.mul(new Complex(0.999, 0));

                const vStart = mobiusTransform(p1, viewCenter);
                const vEnd = mobiusTransform(p2, viewCenter);

                paths.push(getGeodesicPath(vStart, vEnd, viewportRadius));
            }
        };

        // 1. Vertical Grid Lines (Orthogonal to Real Axis)
        generateOrthogonalArcs(true);

        // 2. Horizontal Grid Lines (Orthogonal to Imaginary Axis)
        generateOrthogonalArcs(false);

        return { lines: paths, circles: [] }; // No circles array needed for this style
    }, [viewCenter, viewportRadius]);

    return (
        <g className="pointer-events-none fade-in-grid">
            {gridPaths.lines.map((d, i) => (
                <path
                    key={`l-${i}`}
                    d={d}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                    fill="none"
                />
            ))}
            {gridPaths.circles}
        </g>
    );
});
