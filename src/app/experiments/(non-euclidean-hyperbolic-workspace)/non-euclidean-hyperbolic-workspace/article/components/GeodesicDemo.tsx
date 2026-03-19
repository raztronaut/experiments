"use client";

import { useCallback, useRef, useState } from "react";
import { ControlGroup, Switch } from "@/components/mdx/controls";
import { useCanvasResize } from "./useCanvasResize";
import {
  BG,
  type C,
  CLAMP_BOUND,
  canvasToDisk,
  DISK_R,
  diskToCanvas,
  drawDiskBorder,
  geodesicArc,
  orthogonalCircle,
  setupCanvas,
} from "./utils";

export function GeodesicDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<C[]>([]);
  const [showConstruction, setShowConstruction] = useState(false);

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

    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "center";
    if (points.length === 0) {
      ctx.fillText("Click two points inside the disk", cx, cy);
    } else if (points.length === 1) {
      ctx.fillText("Click a second point", cx, cy - r - 10);
    }

    if (points.length === 2) {
      const [z1, z2] = points;
      const [x1, y1] = diskToCanvas(z1, cx, cy, r);
      const [x2, y2] = diskToCanvas(z2, cx, cy, r);

      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      geodesicArc(ctx, z1, z2, cx, cy, r, "rgba(56,189,248,0.8)");

      if (showConstruction) {
        const circle = orthogonalCircle(z1, z2);
        if (circle) {
          const [scx, scy] = diskToCanvas(circle.center, cx, cy, r);
          const sR = circle.radius * r;

          ctx.beginPath();
          ctx.arc(scx, scy, sR, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(168,85,247,0.3)";
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.beginPath();
          ctx.arc(scx, scy, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(168,85,247,0.6)";
          ctx.fill();

          const [ix, iy] = diskToCanvas(circle.inversion, cx, cy, r);
          ctx.beginPath();
          ctx.arc(ix, iy, 4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(245,158,11,0.7)";
          ctx.fill();
          ctx.fillStyle = "rgba(245,158,11,0.5)";
          ctx.font = "9px system-ui, sans-serif";
          ctx.textAlign = "left";
          ctx.fillText("1/z\u0304\u2081", ix + 6, iy + 3);
        }
      }
    }

    for (let i = 0; i < points.length; i++) {
      const [px, py] = diskToCanvas(points[i], cx, cy, r);
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "#f43f5e" : "#34d399";
      ctx.fill();
    }
  }, [points, showConstruction]);

  useCanvasResize(canvasRef, draw);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const r = Math.min(rect.width, rect.height) * DISK_R;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const z = canvasToDisk(
      e.clientX - rect.left,
      e.clientY - rect.top,
      cx,
      cy,
      r
    );
    if (z.abs() >= CLAMP_BOUND) {
      return;
    }
    setPoints((prev) => (prev.length >= 2 ? [z] : [...prev, z]));
  }, []);

  return (
    <div className="space-y-4">
      <canvas
        className="h-[300px] w-full cursor-crosshair rounded border border-border"
        onClick={handleClick}
        ref={canvasRef}
        style={{ background: BG }}
      />
      <ControlGroup columns={1}>
        <Switch
          label="Show orthogonal circle construction"
          onChange={setShowConstruction}
          toggled={showConstruction}
        />
      </ControlGroup>
    </div>
  );
}
