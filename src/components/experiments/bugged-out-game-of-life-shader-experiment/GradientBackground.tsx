"use client";

import { GrainGradient } from "@paper-design/shaders-react";

interface GradientBackgroundProps {
  intensity?: number;
  noise?: number;
  offsetX?: number;
  offsetY?: number;
  softness?: number;
  speed?: number;
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
  offsetY = 0,
}: GradientBackgroundProps) {
  return (
    <div className="absolute inset-0 -z-10">
      <GrainGradient
        colorBack="hsl(14, 100%, 57%)"
        // Use the primary orange as background so cells in the "center" are always visible
        colors={[
          "hsl(14, 100%, 57%)",
          "hsl(45, 100%, 51%)",
          "hsl(340, 82%, 52%)",
        ]}
        intensity={intensity}
        noise={noise}
        offsetX={offsetX}
        offsetY={offsetY} // Wave provides better overall texture than blob or corners
        rotation={0}
        scale={1.4}
        shape="wave" // Increase scale to ensure full coverage
        softness={softness}
        speed={speed}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
