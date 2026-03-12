"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Checkbox,
  ControlGroup,
  Radio,
  Range,
} from "@/components/mdx/controls";

const PARCHMENT_COLORS = [
  "#E6DDB5",
  "#DCCCA3",
  "#E8DFC5",
  "#D4C596",
  "#A63D3A",
  "#C8B88A",
];

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function WaveDeformationDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [amplitude, setAmplitude] = useState(3.0);
  const [frequency, setFrequency] = useState(0.04);
  const [harmonics, setHarmonics] = useState(true);
  const [showShadow, setShowShadow] = useState(true);
  const rafRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    const time = performance.now() * 0.0005;

    ctx.fillStyle = "#fff9c4";
    ctx.fillRect(0, 0, w, h);

    const ribbonCount = 8;
    const ribbonH = h / (ribbonCount + 2);
    const startY = ribbonH * 1.5;

    for (let r = 0; r < ribbonCount; r++) {
      const baseY = startY + r * ribbonH;
      const color = PARCHMENT_COLORS[r % PARCHMENT_COLORS.length];
      const rgb = hexToRgb(color);
      const phaseOffset = r * 0.7;

      ctx.beginPath();
      const points: Array<{ x: number; y: number; indent: number }> = [];

      for (let x = 0; x <= w; x += 2) {
        const xPos = (x / w) * 20 * frequency + time + phaseOffset;

        let indent = Math.sin(xPos) * amplitude * 8;
        if (harmonics) {
          indent += Math.sin(xPos * 2.1 + 0.4) * amplitude * 8 * 0.3;
          indent += Math.sin(xPos * 4.4 + 1.2) * amplitude * 8 * 0.1;
        }

        const y = baseY + indent;
        points.push({ x, y, indent });

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      for (let i = points.length - 1; i >= 0; i--) {
        ctx.lineTo(points[i].x, points[i].y + ribbonH * 0.6);
      }

      ctx.closePath();

      if (showShadow) {
        const gradient = ctx.createLinearGradient(0, baseY - 30, 0, baseY + 30);
        gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
        gradient.addColorStop(
          0.5,
          `rgba(${Math.max(0, rgb[0] - 30)}, ${Math.max(0, rgb[1] - 30)}, ${Math.max(0, rgb[2] - 30)}, 1)`
        );
        gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();

      ctx.strokeStyle = "#be123c";
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const pt = points[Math.floor(x / 2)];
        if (!pt) {
          continue;
        }
        if (x === 0) {
          ctx.moveTo(x, pt.y + 2);
        } else {
          ctx.lineTo(x, pt.y + 2);
        }
      }
      ctx.stroke();
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const pt = points[Math.floor(x / 2)];
        if (!pt) {
          continue;
        }
        if (x === 0) {
          ctx.moveTo(x, pt.y + ribbonH * 0.6 - 2);
        } else {
          ctx.lineTo(x, pt.y + ribbonH * 0.6 - 2);
        }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [amplitude, frequency, harmonics, showShadow]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className="space-y-4">
      <canvas
        className="w-full rounded border border-border"
        height={240}
        ref={canvasRef}
        width={500}
      />
      <ControlGroup columns={2}>
        <Range
          formatValue={(v) => v.toFixed(1)}
          label="Amplitude"
          max={6}
          min={0.5}
          onChange={setAmplitude}
          step={0.1}
          value={amplitude}
        />
        <Range
          formatValue={(v) => v.toFixed(3)}
          label="Frequency"
          max={0.1}
          min={0.01}
          onChange={setFrequency}
          step={0.005}
          value={frequency}
        />
        <Checkbox
          checked={harmonics}
          label="Harmonic layers"
          onChange={setHarmonics}
        />
        <Checkbox
          checked={showShadow}
          label="Valley shadows"
          onChange={setShowShadow}
        />
      </ControlGroup>
    </div>
  );
}

export function DualFaceTextureDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [face, setFace] = useState<"front" | "back">("front");
  const [scrollSpeed, setScrollSpeed] = useState(0.5);
  const rafRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    const time = performance.now() * 0.001;
    const ribbonH = h * 0.25;
    const baseColor = hexToRgb("#E6DDB5");

    ctx.fillStyle = "#fff9c4";
    ctx.fillRect(0, 0, w, h);

    for (let r = 0; r < 3; r++) {
      const y = 30 + r * (ribbonH + 16);
      const color = PARCHMENT_COLORS[r % PARCHMENT_COLORS.length];
      const rgb = hexToRgb(color);

      ctx.fillStyle = color;
      ctx.fillRect(0, y, w, ribbonH);

      ctx.strokeStyle = "#be123c";
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, y + ribbonH * 0.15);
      ctx.lineTo(w, y + ribbonH * 0.15);
      ctx.moveTo(0, y + ribbonH * 0.85);
      ctx.lineTo(w, y + ribbonH * 0.85);
      ctx.stroke();
      ctx.globalAlpha = 1;

      if (face === "front") {
        const texts = ["404 NOT FOUND", "PAGE NOT FOUND", "ERROR 404"];
        const text = texts[r % texts.length];
        const fontSize = ribbonH * 0.5;
        ctx.font = `900 ${fontSize}px "Inter", "Arial Black", sans-serif`;
        ctx.fillStyle = "#0c0c0c";
        ctx.textBaseline = "middle";

        const textW = ctx.measureText(text).width;
        const gap = 60;
        const totalUnit = textW + gap;
        const offset =
          (time * scrollSpeed * 60 * (r % 2 === 0 ? 1 : -1)) % totalUnit;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y, w, ribbonH);
        ctx.clip();

        for (
          let tx = -totalUnit + offset;
          tx < w + totalUnit;
          tx += totalUnit
        ) {
          ctx.fillText(text, tx, y + ribbonH * 0.52);
        }
        ctx.restore();
      } else {
        const text = "INSPIRED BY DAY JOB";
        const fontSize = ribbonH * 0.35;
        ctx.font = `italic 900 ${fontSize}px "Inter", "system-ui", sans-serif`;
        ctx.fillStyle = `rgba(${Math.max(0, rgb[0] - 60)}, ${Math.max(0, rgb[1] - 60)}, ${Math.max(0, rgb[2] - 60)}, 0.5)`;
        ctx.textBaseline = "middle";

        const textW = ctx.measureText(text).width;
        const gap = 80;
        const totalUnit = textW + gap;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, y, w, ribbonH);
        ctx.clip();

        for (let tx = -totalUnit; tx < w + totalUnit; tx += totalUnit) {
          ctx.fillText(text, tx, y + ribbonH * 0.52);
        }
        ctx.restore();
      }
    }

    ctx.fillStyle = "rgba(0,0,0,0.04)";
    ctx.font = "bold 120px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("404", w / 2, h / 2);
    ctx.textAlign = "start";

    rafRef.current = requestAnimationFrame(draw);
  }, [face, scrollSpeed]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className="space-y-4">
      <canvas
        className="w-full rounded border border-border"
        height={240}
        ref={canvasRef}
        width={500}
      />
      <ControlGroup columns={2}>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-muted-foreground text-xs tracking-tight">
            Face
          </span>
          <Radio.Group
            name="face"
            onChange={(val) => setFace(val as "front" | "back")}
          >
            <Radio.Item
              checked={face === "front"}
              label="Front (scrolling text)"
              value="front"
            />
            <Radio.Item
              checked={face === "back"}
              label="Back (italic tiled)"
              value="back"
            />
          </Radio.Group>
        </div>
        <Range
          disabled={face === "back"}
          formatValue={(v) => v.toFixed(2)}
          label="Text speed"
          max={2}
          min={0}
          onChange={setScrollSpeed}
          step={0.05}
          value={scrollSpeed}
        />
      </ControlGroup>
    </div>
  );
}

export function ScrollVelocityDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const velocityRef = useRef(0);
  const offsetRef = useRef(0);
  const [decayRate, setDecayRate] = useState(0.05);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocityRef.current += e.deltaY * 0.15;
      velocityRef.current = Math.max(-5, Math.min(5, velocityRef.current));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const now = performance.now();
    const delta = lastTimeRef.current
      ? (now - lastTimeRef.current) / 1000
      : 0.016;
    lastTimeRef.current = now;

    velocityRef.current += (0 - velocityRef.current) * decayRate;
    offsetRef.current += (1.0 + velocityRef.current * 2.0) * delta;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#fff9c4";
    ctx.fillRect(0, 0, w, h);

    const ribbonY = 40;
    const ribbonH = h * 0.35;

    ctx.fillStyle = "#E6DDB5";
    ctx.fillRect(0, ribbonY, w, ribbonH);

    ctx.strokeStyle = "#be123c";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, ribbonY + ribbonH * 0.15);
    ctx.lineTo(w, ribbonY + ribbonH * 0.15);
    ctx.moveTo(0, ribbonY + ribbonH * 0.85);
    ctx.lineTo(w, ribbonY + ribbonH * 0.85);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const text = "404 NOT FOUND";
    const fontSize = ribbonH * 0.5;
    ctx.font = `900 ${fontSize}px "Inter", "Arial Black", sans-serif`;
    ctx.fillStyle = "#0c0c0c";
    ctx.textBaseline = "middle";

    const textW = ctx.measureText(text).width;
    const gap = 60;
    const totalUnit = textW + gap;
    const offset = (offsetRef.current * 40) % totalUnit;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, ribbonY, w, ribbonH);
    ctx.clip();

    for (let tx = -totalUnit + offset; tx < w + totalUnit; tx += totalUnit) {
      ctx.fillText(text, tx, ribbonY + ribbonH * 0.52);
    }
    ctx.restore();

    const meterY = ribbonY + ribbonH + 30;
    const meterW = w - 60;
    const meterH = 20;
    const meterX = 30;

    ctx.fillStyle = "#e8e0c8";
    ctx.fillRect(meterX, meterY, meterW, meterH);

    ctx.fillStyle = "#0c0c0c";
    ctx.strokeStyle = "#0c0c0c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(meterX + meterW / 2, meterY - 2);
    ctx.lineTo(meterX + meterW / 2, meterY + meterH + 2);
    ctx.stroke();

    const normalizedVel = velocityRef.current / 5;
    const barW = Math.abs(normalizedVel) * (meterW / 2);
    const barX =
      normalizedVel >= 0 ? meterX + meterW / 2 : meterX + meterW / 2 - barW;

    ctx.fillStyle = Math.abs(velocityRef.current) > 2 ? "#A63D3A" : "#8B7355";
    ctx.fillRect(barX, meterY + 2, barW, meterH - 4);

    ctx.fillStyle = "#0c0c0c";
    ctx.font = "12px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(
      `velocity: ${velocityRef.current.toFixed(2)}`,
      w / 2,
      meterY + meterH + 8
    );
    ctx.textAlign = "start";

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.font = "11px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("scroll here to interact", w / 2, h - 14);
    ctx.textAlign = "start";

    rafRef.current = requestAnimationFrame(draw);
  }, [decayRate]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className="space-y-4" ref={containerRef}>
      <canvas
        className="w-full rounded border border-border"
        height={220}
        ref={canvasRef}
        width={500}
      />
      <Range
        formatValue={(v) => v.toFixed(3)}
        label="Decay rate (lerp factor)"
        max={0.2}
        min={0.005}
        onChange={setDecayRate}
        step={0.005}
        value={decayRate}
      />
    </div>
  );
}
