"use client";

import { useCallback, useRef, useState } from "react";
import { ControlGroup, Switch } from "@/components/mdx/controls";
import { useCanvasResize } from "./useCanvasResize";
import {
  BG,
  C,
  CLAMP_BOUND,
  DISK_R,
  diskToCanvas,
  drawDiskBorder,
  EDGE_BOUND,
  mobius,
  setupCanvas,
} from "./utils";

export function MobiusTransformDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showAngles, setShowAngles] = useState(true);
  const [showBoundary, setShowBoundary] = useState(false);
  const viewRef = useRef(new C(0, 0));
  const draggingRef = useRef(false);
  const startRef = useRef({ px: 0, py: 0, center: new C(0, 0) });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const setup = setupCanvas(canvas);
    if (!setup) {
      return;
    }
    const { ctx, w, h } = setup;

    const r = Math.min(w, h) * DISK_R;
    const cx = w / 2;
    const cy = h / 2;

    drawDiskBorder(ctx, cx, cy, r);

    if (showBoundary) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(56,189,248,0.5)";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "rgba(56,189,248,0.35)";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("boundary is fixed", cx, cy - r - 8);
    }

    const a = viewRef.current;
    const gridSize = 7;
    const spacing = 0.25;

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const z = new C(i * spacing, j * spacing);
        if (z.abs() >= EDGE_BOUND) {
          continue;
        }
        const wz = mobius(z, a);
        if (wz.abs() >= EDGE_BOUND) {
          continue;
        }

        const [px, py] = diskToCanvas(wz, cx, cy, r);
        const scale = 1 - wz.abs() ** 2;
        const dotR = Math.max(2, 4 * scale);

        if (showAngles && scale > 0.08) {
          const sideLen = Math.max(6, 14 * scale);
          const alpha = 0.4 + 0.6 * scale;
          ctx.save();
          ctx.fillStyle = `rgba(168,85,247,${0.06 * alpha})`;
          ctx.fillRect(px - sideLen / 2, py - sideLen / 2, sideLen, sideLen);
          ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px - sideLen / 2, py - sideLen / 2, sideLen, sideLen);
          ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(px, py, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.15 + 0.6 * scale})`;
        ctx.fill();
      }
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56,189,248,0.6)";
    ctx.fill();
  }, [showAngles, showBoundary]);

  useCanvasResize(canvasRef, draw);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      canvas.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      startRef.current = {
        px: e.clientX,
        py: e.clientY,
        center: viewRef.current,
      };
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!draggingRef.current) {
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const r = Math.min(rect.width, rect.height) * DISK_R;
      const dx = -(e.clientX - startRef.current.px) / r;
      const dy = -(e.clientY - startRef.current.py) / r;
      const shift = new C(dx * 0.5, dy * 0.5);
      if (shift.abs() < CLAMP_BOUND) {
        viewRef.current = mobius(startRef.current.center, shift);
        if (viewRef.current.abs() > CLAMP_BOUND) {
          viewRef.current = viewRef.current.scale(
            CLAMP_BOUND / viewRef.current.abs()
          );
        }
        draw();
      }
    },
    [draw]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  return (
    <div className="space-y-4">
      <canvas
        className="h-[300px] w-full cursor-grab rounded border border-border active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={canvasRef}
        style={{ background: BG, touchAction: "none" }}
      />
      <ControlGroup columns={2}>
        <Switch
          label="Show angle preservation"
          onChange={setShowAngles}
          toggled={showAngles}
        />
        <Switch
          label="Highlight fixed boundary"
          onChange={setShowBoundary}
          toggled={showBoundary}
        />
      </ControlGroup>
    </div>
  );
}
