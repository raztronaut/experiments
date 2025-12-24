"use client"

import { GrainGradient } from "@paper-design/shaders-react"

interface GradientBackgroundProps {
    intensity?: number;
    speed?: number;
    noise?: number;
    softness?: number;
    offsetX?: number;
    offsetY?: number;
}

/**
 * GradientBackground Component
 * 
 * FIX: 'colorBack' set to Primary Orange to eliminate the "Black Hole".
 * FIX: 'shape' set to "wave" for better screen coverage.
 */
export function GradientBackground({
    intensity = 0.45,
    speed = 1,
    noise = 0,
    softness = 0.76,
    offsetX = 0,
    offsetY = 0
}: GradientBackgroundProps) {
    return (
        <div className="absolute inset-0 -z-10">
            <GrainGradient
                style={{ height: "100%", width: "100%" }}
                // Use the primary orange as background so cells in the "center" are always visible
                colorBack="hsl(14, 100%, 57%)"
                softness={softness}
                intensity={intensity}
                noise={noise}
                shape="wave" // Wave provides better overall texture than blob or corners
                offsetX={offsetX}
                offsetY={offsetY}
                scale={1.4} // Increase scale to ensure full coverage
                rotation={0}
                speed={speed}
                colors={["hsl(14, 100%, 57%)", "hsl(45, 100%, 51%)", "hsl(340, 82%, 52%)"]}
            />
        </div>
    )
}
