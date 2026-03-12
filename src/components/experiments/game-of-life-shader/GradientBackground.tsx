"use client";

import { GrainGradient } from "@paper-design/shaders-react";

/**
 * GradientBackground Component
 *
 * This component renders the underlying "Energy Field" for our Game of Life simulation.
 * It uses a WebGL fragment shader (GrainGradient) to create a high-quality, noisy,
 * shifting color landscape.
 *
 * THE VISUAL STACK:
 * 1. Bottom Layer: Only this GradientBackground. It fills the screen with color.
 * 2. Top Layer: The LifeSimulation canvas.
 *
 * The LifeSimulation canvas is mostly Opaque Black. It has small transparent "holes"
 * where the cells are alive. These holes reveal THIS gradient component underneath.
 * This creates the illusion that the cells are glowing with these colors.
 */
export function GradientBackground() {
  return (
    <div className="absolute inset-0">
      <GrainGradient
        colorBack="hsla(0, 0%, 0%, 1.00)"
        colors={[
          "hsl(14, 100%, 57%)", // Vibrant Orange
          "hsl(45, 100%, 51%)", // Golden Yellow
          "hsl(340, 82%, 52%)", // Deep Pink/Magenta
        ]} // Deep black base
        // Shader Parameters tuned for "Living" feel:
        intensity={1.2} // Harder edges than default for more defined "blobs"
        noise={0.1} // High intensity to punch through the small cell windows
        offsetX={0} // Subtle grain texture
        // Motion parameters
        offsetY={0} // Fast movement so the colors shift noticeably under stationary cells
        // The "Plasma" Palette
        rotation={0}
        // Unused parameters set to defaults
        scale={1}
        shape="corners"
        softness={0.5}
        speed={3}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
