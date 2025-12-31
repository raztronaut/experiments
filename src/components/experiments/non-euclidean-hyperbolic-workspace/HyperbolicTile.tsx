import React, { useMemo } from 'react';
import { Complex, mobiusTransform, poincareToScreen } from './HyperbolicMath';
import { cn } from '@/lib/utils';

// Constants for visual logic
const TILE_BASE_SIZE = 100; // base size in pixels at the center

interface HyperbolicTileProps {
    /** The logical center of this tile in the Poincaré disk (before any view panning) */
    logicalPosition: Complex;
    /** The current "view" center (the point in the Poincaré disk that is currently at the screen center) */
    viewCenter: Complex;
    /** Radius of the viewport in pixels, used for converting unit coords to screen pixels */
    viewportRadius: number;
    /** Optional content/label */
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function HyperbolicTile({
    logicalPosition,
    viewCenter,
    viewportRadius,
    children,
    className,
    onClick
}: HyperbolicTileProps) {
    // 1. Apply the view transformation: move 'viewCenter' to origin
    // The transformation M(z) = (z - a) / (1 - conj(a)*z) maps 'a' to 0.
    const visualPositionComplex = useMemo(() => {
        return mobiusTransform(logicalPosition, viewCenter);
    }, [logicalPosition, viewCenter]);

    // 2. Convert to screen coordinates (unit disk [-1, 1])
    const { x: unitX, y: unitY } = poincareToScreen(visualPositionComplex);

    // 3. Calculate distance from center to determine scale
    // In the Poincaré disk, Euclidean size shrinks as we get closer to the edge.
    // A simple approximation is scaling by (1 - r^2) or similar metric, 
    // but strictly speaking, we want conformal scaling.
    // The derivative of the Möbius transform gives the local scaling factor.
    // |M'(z)| = (1 - |a|^2) / |1 - conj(a)z|^2
    // However, for "visual shrinking" towards the edge of the disk (which represents infinity),
    // we can use a scaling factor proportional to the Euclidean metric distortion:
    // scale ~ 1 - r^2  (at r=0 scale=1, at r=1 scale=0)
    const rSquared = unitX * unitX + unitY * unitY;
    const scale = Math.max(0, 1 - rSquared);

    // If tile is too small, don't render it to save performance/visual noise
    if (scale < 0.05) return null;

    // 4. Map unit coordinates to pixel coordinates relative to container center
    const pixelX = unitX * viewportRadius;
    const pixelY = unitY * viewportRadius;

    return (
        <div
            role="button"
            aria-label={`Navigate to ${typeof children === 'string' ? children : 'node'}`}
            onClick={onClick}
            className={cn(
                "absolute flex items-center justify-center rounded-xl transition-all duration-300 ease-out cursor-pointer select-none",
                // Remove default strong gradient, rely on passed className for coloring
                "text-white font-bold",
                "hover:scale-110 hover:z-50 hover:brightness-125",
                className
            )}
            style={{
                width: `${TILE_BASE_SIZE}px`,
                height: `${TILE_BASE_SIZE}px`,
                willChange: 'transform',
                // Use fixed precision to avoid hydration mismatches between server (node) and client (browser) floating point stringification
                transform: `translate3d(${pixelX.toFixed(4)}px, ${pixelY.toFixed(4)}px, 0px) scale(${scale.toFixed(6)})`,
                // Center the element at non-transformed origin so translation works from center
                marginLeft: `-${TILE_BASE_SIZE / 2}px`,
                marginTop: `-${TILE_BASE_SIZE / 2}px`,
                left: '50%',
                top: '50%',
                zIndex: Math.floor(scale * 100), // Larger items on top
            }}
        >
            <div className="text-center overflow-hidden p-2 text-xs">
                {children || "Tile"}
            </div>
        </div>
    );
}

// Optimization: Memoize tile to prevent re-renders if pos/viewCenter are stable (though they change every frame during drag)
export const HyperbolicTileMemo = React.memo(HyperbolicTile);
