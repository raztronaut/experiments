"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ControlGroup, Range } from "@/components/mdx/controls";
import { BG, drawDiskBorder, LABEL_ALPHA, setupCanvas } from "./utils";

export function ConformalScaleDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [radius, setRadius] = useState(0.3);

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

    const diskR = Math.min(w * 0.35, h * 0.4);
    const diskCx = w * 0.3;
    const diskCy = h * 0.5;

    drawDiskBorder(ctx, diskCx, diskCy, diskR);

    ctx.beginPath();
    ctx.moveTo(diskCx, diskCy);
    ctx.lineTo(diskCx + diskR, diskCy);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const px = diskCx + radius * diskR;
    ctx.beginPath();
    ctx.arc(px, diskCy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#f43f5e";
    ctx.fill();

    const scale = 1 - radius * radius;
    const tileSize = Math.max(4, 40 * scale);
    ctx.strokeStyle = `rgba(168,85,247,${0.3 + 0.7 * scale})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(
      px - tileSize / 2,
      diskCy - tileSize / 2 - 30,
      tileSize,
      tileSize
    );
    ctx.fillStyle = `rgba(168,85,247,${0.1 + 0.2 * scale})`;
    ctx.fillRect(
      px - tileSize / 2,
      diskCy - tileSize / 2 - 30,
      tileSize,
      tileSize
    );

    // ── Scale curve plot ──
    const plotX = w * 0.58;
    const plotW = w * 0.36;
    const plotY = h * 0.15;
    const plotH = h * 0.7;

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX, plotY);
    ctx.lineTo(plotX, plotY + plotH);
    ctx.lineTo(plotX + plotW, plotY + plotH);
    ctx.stroke();

    ctx.fillStyle = `rgba(255,255,255,${LABEL_ALPHA})`;
    ctx.font = "10px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("|w|", plotX + plotW / 2, plotY + plotH + 16);
    ctx.save();
    ctx.translate(plotX - 14, plotY + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("1 - |w|\u00B2", 0, 0);
    ctx.restore();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(56,189,248,0.6)";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const v = 1 - t * t;
      const x = plotX + t * plotW;
      const y = plotY + plotH - v * plotH;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    const markerX = plotX + radius * plotW;
    const markerY = plotY + plotH - scale * plotH;
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#f43f5e";
    ctx.fill();

    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(244,63,94,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(markerX, markerY);
    ctx.lineTo(markerX, plotY + plotH);
    ctx.moveTo(markerX, markerY);
    ctx.lineTo(plotX, markerY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(255,255,255,${LABEL_ALPHA})`;
    ctx.font = "11px system-ui, sans-serif";
    const scaleText = `scale = ${scale.toFixed(3)}`;
    const textMetrics = ctx.measureText(scaleText);
    const labelX = plotX + plotW + 8;
    if (labelX + textMetrics.width > w - 4) {
      ctx.textAlign = "right";
      ctx.fillText(scaleText, plotX + plotW - 4, markerY - 10);
    } else {
      ctx.textAlign = "left";
      ctx.fillText(scaleText, labelX, markerY + 4);
    }
  }, [radius]);

  useEffect(() => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div className="space-y-4">
      <canvas
        className="h-[240px] w-full rounded border border-border"
        ref={canvasRef}
        style={{ background: BG }}
      />
      <ControlGroup columns={1}>
        <Range
          formatValue={(v) => v.toFixed(2)}
          label="Distance from center (|w|)"
          max={0.98}
          min={0}
          onChange={setRadius}
          step={0.01}
          value={radius}
        />
      </ControlGroup>
    </div>
  );
}
