"use client";

import { useEffect, useRef } from "react";
import { CANVAS_SIZE, progressToIndex } from "./data";

interface MorphCanvasProps {
  images: HTMLImageElement[];
  progressRef: React.RefObject<number>;
  resolution?: number;
  showFrameIndex?: boolean;
  debug?: boolean;
}

export function MorphCanvas({
  images,
  progressRef,
  resolution = CANVAS_SIZE,
  showFrameIndex = false,
  debug = false,
}: MorphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentIndexRef = useRef(-1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = resolution * dpr;
    canvas.height = resolution * dpr;
    canvas.style.width = `${resolution}px`;
    canvas.style.height = `${resolution}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.scale(dpr, dpr);

    function render() {
      const index = progressToIndex(progressRef.current);

      if (index !== currentIndexRef.current) {
        currentIndexRef.current = index;
        const img = images[index];

        if (ctx && img?.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, 0, 0, resolution, resolution);
        }

        if (showFrameIndex && ctx) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(0, 0, 60, 28);
          ctx.fillStyle = "#fff";
          ctx.font = "14px monospace";
          ctx.fillText(`#${index}`, 8, 20);
        }

        if (debug) {
          console.log(
            `[luma-morphing] frame: ${index}, progress: ${progressRef.current.toFixed(3)}`
          );
        }
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [images, progressRef, resolution, showFrameIndex, debug]);

  return (
    <canvas
      ref={canvasRef}
      className="luma-morphing-canvas"
      aria-label="Morphing image sequence canvas"
    />
  );
}
