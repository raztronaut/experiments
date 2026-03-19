"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LifeSimulationProps {
  className?: string;
}

/**
 * CELL_SIZE defines the resolution of our "pixel art" simulation.
 * 8px gives a chunky, retro feel while being performant enough for large screens.
 * Smaller values (e.g., 4) would be sharper but more CPU intensive.
 */
const CELL_SIZE = 8;

/**
 * LifeSimulation Component
 *
 * This component renders the Game of Life simulation on top of the Gradient background.
 *
 * VISUAL TECHNIQUE: "Inverse Masking"
 * -----------------------------------
 * instead of drawing the cells as colored squares, we treat this canvas as a "Mask".
 * 1. The Canvas covers the entire screen.
 * 2. We fill the Canvas with OPAQUE BLACK. This hides the colorful gradient behind it.
 * 3. Where a cell is ALIVE, we clear the black pixel (make it TRANSPARENT).
 * 4. This reveals the gradient *through* the living cell window.
 *
 * This guarantees that the cells always perfectly match the complex, shifting colors
 * of the underlying shader, because they technically ARE the shader.
 */
export function LifeSimulation({ className }: LifeSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker>(null);

  // We store the calculated grid resolution here (Screen Size / CELL_SIZE)
  const [resolution, setResolution] = useState({ w: 0, h: 0 });

  /**
   * WORKER INITIALIZATION
   * We use a Web Worker to run the heavy simulation loop off the main thread.
   * This ensures the UI remains buttery smooth (60fps) even if the math gets heavy.
   */
  useEffect(() => {
    // Initialize the dedicated simulation worker
    workerRef.current = new Worker(
      new URL("./simulation.worker.ts", import.meta.url)
    );

    const handleResize = () => {
      if (!containerRef.current) {
        return;
      }
      const { clientWidth, clientHeight } = containerRef.current;

      // Calculate how many cells fit on screen
      const w = Math.ceil(clientWidth / CELL_SIZE);
      const h = Math.ceil(clientHeight / CELL_SIZE);

      setResolution({ w, h });

      // Tell the worker to resize its grid
      workerRef.current?.postMessage({
        type: "INIT",
        width: w,
        height: h,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial setup

    return () => {
      window.removeEventListener("resize", handleResize);
      workerRef.current?.terminate();
    };
  }, []);

  /**
   * RENDER LOOP
   * This loop receives grid data from the worker and paints it to the canvas.
   */
  useEffect(() => {
    if (!(canvasRef.current && workerRef.current) || resolution.w === 0) {
      return;
    }

    const canvas = canvasRef.current;
    // Optimization: explicit alpha: true is default, but good to be explicit for our masking trick
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      return;
    }

    // Set internal canvas resolution to match the simulation grid (e.g., 200x100)
    // CSS will scale this up to cover the full 1920x1080 screen
    canvas.width = resolution.w;
    canvas.height = resolution.h;

    // CRITICAL: Disable anti-aliasing to keep the pixels crisp and square
    ctx.imageSmoothingEnabled = false;

    let animateId: number;
    let lastGrid: Uint8Array | null = null;

    // Create the ImageData buffer once per resolution change, rather than every frame
    const imgData = ctx.createImageData(resolution.w, resolution.h);
    const data = imgData.data;

    // Listen for updates from the Worker
    workerRef.current.onmessage = (e) => {
      if (e.data.type === "UPDATE") {
        // We just store the grid reference; we don't draw immediately.
        // We draw in the requestAnimationFrame loop to stay synced with screen refresh.
        lastGrid = e.data.grid;
      }
    };

    const render = () => {
      // 1. Kick off the math for the *next* frame immediately
      workerRef.current?.postMessage({ type: "TICK" });

      // 2. Draw the *current* frame if we have data
      if (lastGrid && ctx) {
        // We reuse the imgData buffer to avoid GC overhead

        for (let i = 0; i < lastGrid.length; i++) {
          const stride = i * 4;
          const val = lastGrid[i]; // Value is 0 (Dead) to 255 (Alive)

          /**
           * PIXEL SHADER LOGIC (The "Inverse Mask")
           *
           * We calculate Alpha (Transparency) based on the cell's "Life Value".
           *
           * - If val is 0 (Absolute Death), alpha is high. The pixel is black. Hides gradient.
           * - If val is 255 (Full Life), alpha is 0. The pixel is transparent. Reveals gradient.
           * - If val is 100 (Dying/Trailing), alpha is partial. Creates a dimming effect.
           *
           * The `0.5` factor means the "Darkness" is only 50% opaque max.
           * This allows the gradient to faintly shine through even the dead areas,
           * creating a unified atmospheric glow rather than pitch black void.
           */
          const alpha = (255 - val) * 0.5;

          data[stride] = 0; // R (Black)
          data[stride + 1] = 0; // G (Black)
          data[stride + 2] = 0; // B (Black)
          data[stride + 3] = alpha; // A (Opacity)
        }

        ctx.putImageData(imgData, 0, 0);
      }

      animateId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animateId);
    };
  }, [resolution]);

  // INTERACTION HANDLERS //////////////////////////////////////////////////

  // Draw life when mouse moves
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!(containerRef.current && workerRef.current)) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    // Convert screen coordinates to grid coordinates
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    workerRef.current.postMessage({
      type: "SPLAT",
      x,
      y,
      radius: 3, // Brush size
    });
  };

  // Reset on click
  const handlePointerDown = () => {
    workerRef.current?.postMessage({ type: "RESET" });
  };

  return (
    <div
      className={cn("absolute inset-0 z-0", className)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      ref={containerRef}
      // `pointerEvents: auto` enables the mouse interactions on this layer
      // `touchAction: none` prevents scrolling on mobile while painting life
      style={{ touchAction: "none", pointerEvents: "auto" }}
    >
      <canvas
        className="rendering-pixelated block h-full w-full"
        ref={canvasRef}
        style={{
          // Use 'normal' blending because we are manually handling the transparency
          // in the pixel loop above.
          mixBlendMode: "normal",
          // CSS property to keep the pixels chunky when scaled up
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
