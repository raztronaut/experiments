"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export function CRTEffectDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanlineIntensity, setScanlineIntensity] = useState(0.06);
  const [noiseAmount, setNoiseAmount] = useState(0.08);
  const [vignetteStrength, setVignetteStrength] = useState(0.3);
  const [showPhosphor, setShowPhosphor] = useState(true);
  const rafRef = useRef<number>(0);

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
    const imageData = ctx.createImageData(w, h);
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
        const rollDist = Math.abs(uvY - rollPos);
        if (rollDist < 0.04) {
          const roll = (1 - rollDist / 0.04) * 0.15;
          b += roll;
        }

        if (showPhosphor) {
          const dot = Math.sin(uvX * 200) * Math.sin(uvY * 200) * 0.03 + 1;
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

  const onRange =
    (setter: (v: number) => void) => (e: ChangeEvent<HTMLInputElement>) =>
      setter(Number(e.target.value));

  return (
    <div className="space-y-4">
      <canvas
        className="w-full rounded border border-border"
        height={180}
        ref={canvasRef}
        width={400}
      />
      <div className="grid grid-cols-2 gap-4 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">
            Scanlines: {scanlineIntensity.toFixed(2)}
          </span>
          <input
            className="w-full"
            max="0.2"
            min="0"
            onChange={onRange(setScanlineIntensity)}
            step="0.01"
            type="range"
            value={scanlineIntensity}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">
            Noise: {noiseAmount.toFixed(2)}
          </span>
          <input
            className="w-full"
            max="0.3"
            min="0"
            onChange={onRange(setNoiseAmount)}
            step="0.01"
            type="range"
            value={noiseAmount}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">
            Vignette: {vignetteStrength.toFixed(2)}
          </span>
          <input
            className="w-full"
            max="0.8"
            min="0"
            onChange={onRange(setVignetteStrength)}
            step="0.05"
            type="range"
            value={vignetteStrength}
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            checked={showPhosphor}
            onChange={(e) => setShowPhosphor(e.target.checked)}
            type="checkbox"
          />
          <span className="text-muted-foreground">Phosphor dots</span>
        </label>
      </div>
    </div>
  );
}

const GRID_SRC = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1"/><line x1="40" y1="0" x2="40" y2="80" stroke="rgba(255,255,255,0.06)" stroke-width="1"/><line x1="0" y1="40" x2="80" y2="40" stroke="rgba(255,255,255,0.06)" stroke-width="1"/></svg>')}`;

export function BarrelDistortionDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [distortion, setDistortion] = useState(0.35);
  const [chromaticAberration, setChromaticAberration] = useState(0.003);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = GRID_SRC;
    img.onload = () => {
      imgRef.current = img;
    };
  }, []);

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
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    let gridPattern: ImageData | null = null;
    if (imgRef.current) {
      const tmpCanvas = document.createElement("canvas");
      tmpCanvas.width = w;
      tmpCanvas.height = h;
      const tmpCtx = tmpCanvas.getContext("2d");
      if (tmpCtx) {
        const pat = tmpCtx.createPattern(imgRef.current, "repeat");
        if (pat) {
          tmpCtx.fillStyle = pat;
          tmpCtx.fillRect(0, 0, w, h);
          gridPattern = tmpCtx.getImageData(0, 0, w, h);
        }
      }
    }

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

  const onRange =
    (setter: (v: number) => void) => (e: ChangeEvent<HTMLInputElement>) =>
      setter(Number(e.target.value));

  return (
    <div className="space-y-4">
      <canvas
        className="w-full rounded border border-border"
        height={220}
        ref={canvasRef}
        width={400}
      />
      <div className="grid grid-cols-2 gap-4 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">
            Distortion: {distortion.toFixed(2)}
          </span>
          <input
            className="w-full"
            max="1.0"
            min="0"
            onChange={onRange(setDistortion)}
            step="0.01"
            type="range"
            value={distortion}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-muted-foreground">
            Chromatic aberration: {chromaticAberration.toFixed(3)}
          </span>
          <input
            className="w-full"
            max="0.02"
            min="0"
            onChange={onRange(setChromaticAberration)}
            step="0.001"
            type="range"
            value={chromaticAberration}
          />
        </label>
      </div>
    </div>
  );
}
