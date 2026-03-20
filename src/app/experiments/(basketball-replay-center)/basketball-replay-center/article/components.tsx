"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Checkbox, ControlGroup, Range } from "@/components/mdx/controls";

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function CRTEffectDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanlineIntensity, setScanlineIntensity] = useState(0.06);
  const [noiseAmount, setNoiseAmount] = useState(0.08);
  const [vignetteStrength, setVignetteStrength] = useState(0.3);
  const [showPhosphor, setShowPhosphor] = useState(true);
  const rafRef = useRef<number>(0);
  const imgDataRef = useRef<ImageData | null>(null);

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

    const baseColor = [20, 38, 64];

    if (
      !imgDataRef.current ||
      imgDataRef.current.width !== w ||
      imgDataRef.current.height !== h
    ) {
      imgDataRef.current = ctx.createImageData(w, h);
    }
    const imageData = imgDataRef.current;
    const data = imageData.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const uvX = x / w;
        const uvY = y / h;

        let r = baseColor[0] / 255;
        let g = baseColor[1] / 255;
        let b = baseColor[2] / 255;

        const scanline = Math.sin(uvY * 300 + time * 3) * scanlineIntensity;
        r += scanline;
        g += scanline * 0.7;

        const seed =
          Math.sin(
            (uvX * 0.5 + time * 0.7) * 12.9898 +
              (uvY * 0.5 + time * 0.7) * 78.233
          ) * 43_758.5453;
        const noise = (seed - Math.floor(seed)) * noiseAmount;
        r += noise * 0.6;
        g += noise * 0.4;
        b += noise * 0.5;

        const rollPos = (time * 0.15) % 1;
        const roll =
          (smoothstep(rollPos - 0.04, rollPos, uvY) -
            smoothstep(rollPos, rollPos + 0.04, uvY)) *
          0.15;
        b += roll;

        if (showPhosphor) {
          const dot = Math.sin(uvX * 400) * Math.sin(uvY * 400) * 0.03 + 1;
          r *= dot;
          g *= dot;
          b *= dot;
        }

        const edgeX = Math.abs(uvX - 0.5) * 2;
        const edgeY = Math.abs(uvY - 0.5) * 2;
        const vignette = 1 - (edgeX * edgeX + edgeY * edgeY) * vignetteStrength;
        r *= vignette;
        g *= vignette;
        b *= vignette;

        data[i] = Math.min(255, Math.max(0, r * 255));
        data[i + 1] = Math.min(255, Math.max(0, g * 255));
        data[i + 2] = Math.min(255, Math.max(0, b * 255));
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    rafRef.current = requestAnimationFrame(draw);
  }, [scanlineIntensity, noiseAmount, vignetteStrength, showPhosphor]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className="space-y-4">
      <canvas
        className="w-full rounded border border-border"
        height={180}
        ref={canvasRef}
        width={400}
      />
      <ControlGroup columns={2}>
        <Range
          formatValue={(v) => v.toFixed(2)}
          label="Scanlines"
          max={0.2}
          min={0}
          onChange={setScanlineIntensity}
          step={0.01}
          value={scanlineIntensity}
        />
        <Range
          formatValue={(v) => v.toFixed(2)}
          label="Noise"
          max={0.3}
          min={0}
          onChange={setNoiseAmount}
          step={0.01}
          value={noiseAmount}
        />
        <Range
          formatValue={(v) => v.toFixed(2)}
          label="Vignette"
          max={0.8}
          min={0}
          onChange={setVignetteStrength}
          step={0.05}
          value={vignetteStrength}
        />
        <Checkbox
          checked={showPhosphor}
          label="Phosphor dots"
          onChange={setShowPhosphor}
        />
      </ControlGroup>
    </div>
  );
}

function createGridTile(): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = 80;
  tile.height = 80;
  const ctx = tile.getContext("2d")!;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 80, 80);
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.beginPath();
  ctx.moveTo(40, 0);
  ctx.lineTo(40, 80);
  ctx.moveTo(0, 40);
  ctx.lineTo(80, 40);
  ctx.stroke();
  return tile;
}

export function BarrelDistortionDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [distortion, setDistortion] = useState(0.35);
  const [chromaticAberration, setChromaticAberration] = useState(0.003);
  const imgDataRef = useRef<ImageData | null>(null);
  const gridPatternRef = useRef<ImageData | null>(null);

  useEffect(() => {
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

    // Optimization: Reuse ImageData buffer instead of reallocating on every render loop
    if (
      !imgDataRef.current ||
      imgDataRef.current.width !== w ||
      imgDataRef.current.height !== h
    ) {
      imgDataRef.current = ctx.createImageData(w, h);
    }
    const imageData = imgDataRef.current;
    const data = imageData.data;

    // Optimization: Cache the grid pattern ImageData
    if (
      !gridPatternRef.current ||
      gridPatternRef.current.width !== w ||
      gridPatternRef.current.height !== h
    ) {
      const tile = createGridTile();
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = w;
      tmpCanvas.height = h;
      const tmpCtx = tmpCanvas.getContext("2d");
      if (tmpCtx) {
        const pat = tmpCtx.createPattern(tile, "repeat");
        if (pat) {
          tmpCtx.fillStyle = pat;
          tmpCtx.fillRect(0, 0, w, h);
          gridPatternRef.current = tmpCtx.getImageData(0, 0, w, h);
        }
      }
    }
    const gridPattern = gridPatternRef.current;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const uvX = x / w;
        const uvY = y / h;

        const shiftedX = 2.0 * (uvX - 0.5);
        const shiftedY = 2.0 * (uvY - 0.5);
        const r2 = shiftedX * shiftedX + shiftedY * shiftedY;
        const scale = 0.88 + distortion * r2;

        const distUvX = shiftedX * scale * 0.5 + 0.5;
        const distUvY = shiftedY * scale * 0.5 + 0.5;

        if (distUvX < 0 || distUvX > 1 || distUvY < 0 || distUvY > 1) {
          data[i] = 12;
          data[i + 1] = 12;
          data[i + 2] = 18;
          data[i + 3] = 255;
          continue;
        }

        const srcX = Math.floor(distUvX * w);
        const srcY = Math.floor(distUvY * h);
        const ca = chromaticAberration * (1 + distortion * 0.5);
        const dirX = (uvX - 0.5) * ca;
        const dirY = (uvY - 0.5) * ca;

        const rUvX = Math.min(1, Math.max(0, distUvX + dirX));
        const rUvY = Math.min(1, Math.max(0, distUvY + dirY));
        const bUvX = Math.min(1, Math.max(0, distUvX - dirX));
        const bUvY = Math.min(1, Math.max(0, distUvY - dirY));

        if (gridPattern) {
          const rSrcI = (Math.floor(rUvY * h) * w + Math.floor(rUvX * w)) * 4;
          const gSrcI = (srcY * w + srcX) * 4;
          const bSrcI = (Math.floor(bUvY * h) * w + Math.floor(bUvX * w)) * 4;

          data[i] = gridPattern.data[rSrcI] || 20;
          data[i + 1] = gridPattern.data[gSrcI + 1] || 20;
          data[i + 2] = gridPattern.data[bSrcI + 2] || 30;
        } else {
          const gridVal = srcX % 80 < 1 || srcY % 80 < 1 ? 60 : 20;
          data[i] = gridVal + (ca > 0 ? 15 : 0);
          data[i + 1] = gridVal;
          data[i + 2] = gridVal + (ca > 0 ? 20 : 0);
        }
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [distortion, chromaticAberration]);

  return (
    <div className="space-y-4">
      <canvas
        className="w-full rounded border border-border"
        height={220}
        ref={canvasRef}
        width={400}
      />
      <ControlGroup columns={2}>
        <Range
          formatValue={(v) => v.toFixed(2)}
          label="Distortion"
          max={1.0}
          min={0}
          onChange={setDistortion}
          step={0.01}
          value={distortion}
        />
        <Range
          formatValue={(v) => v.toFixed(3)}
          label="Chromatic aberration"
          max={0.02}
          min={0}
          onChange={setChromaticAberration}
          step={0.001}
          value={chromaticAberration}
        />
      </ControlGroup>
    </div>
  );
}
