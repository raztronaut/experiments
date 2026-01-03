import { useMemo, useCallback } from 'react';
import { Delaunay } from 'd3-delaunay';

export interface Point {
    x: number;
    y: number;
    id: string;
    label: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    color?: string;
    value?: string;
}

// Helper to check for collisions
const validatePoints = (points: Point[]) => {
    if (process.env.NODE_ENV !== 'development') return;

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const p1 = points[i];
            const p2 = points[j];
            const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

            // Threshold for overlap warning (e.g. 1% of normalized space)
            if (dist < 0.05) {
                console.warn(
                    `[Voronoi] Potential overlap detected between "${p1.label}" (${p1.x.toFixed(2)},${p1.y.toFixed(2)}) and "${p2.label}" (${p2.x.toFixed(2)},${p2.y.toFixed(2)}). Distance: ${dist.toFixed(3)}`
                );
            }
        }
    }
};

export function useVoronoi(points: Point[], width: number, height: number) {
    // 0. Safety Check
    useMemo(() => {
        validatePoints(points);
    }, [points]);

    // 1. Calculate Delaunay triangulation from points
    // We flatten points to [x, y, x, y...] format or simple array of [x,y] for D3
    const delaunay = useMemo(() => {
        if (width === 0 || height === 0) return null;
        const formattedPoints = points.map(p => [p.x, p.y] as [number, number]);
        return Delaunay.from(formattedPoints);
    }, [points, width, height]);

    // 2. Generate Voronoi diagram bounded by screen dimensions
    const voronoi = useMemo(() => {
        if (!delaunay) return null;
        return delaunay.voronoi([0, 0, width, height]);
    }, [delaunay, width, height]);

    // 3. Fast "Nearest Neighbor" lookup
    // d3-delaunay provides a simple .find(x, y) method which is O(1) after initialization
    const findNearest = useCallback((x: number, y: number) => {
        if (!delaunay) return null;
        return delaunay.find(x, y); // Returns index of the point
    }, [delaunay]);

    return {
        delaunay,
        voronoi,
        findNearest
    };
}
