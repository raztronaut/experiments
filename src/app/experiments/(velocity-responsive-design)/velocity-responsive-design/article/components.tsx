"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ControlGroup, Range } from "@/components/mdx/controls";

// ---------------------------------------------------------------------------
// ScrollDensityDemo — concept demo
// Slider controls "scroll speed"; text morphs between detailed and summary.
// ---------------------------------------------------------------------------

const DETAILED_TEXT =
  "Velocity-Responsive Design is a paradigm shift in how we think about content layout. Traditionally, responsive design has been synonymous with screen size adaptation — moving from a three-column desktop layout to a single-column mobile stack. VRD introduces a third dimension: kinetic intent. It acknowledges that a user's attention span and information needs are directly proportional to their physical interaction with the device.";

const SUMMARY_TEXT =
  "VRD adapts UI density based on kinetic intent and scroll velocity.";

export function ScrollDensityDemo() {
  const [speed, setSpeed] = useState(0);
  const isSkim = speed > 60;

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-lg border border-border bg-background p-6">
        <div
          className="transition-all duration-500 ease-out"
          style={{
            fontSize: isSkim ? "1.35rem" : "1rem",
            fontWeight: isSkim ? 800 : 400,
            lineHeight: isSkim ? 1.25 : 1.7,
            color: isSkim
              ? "var(--color-foreground)"
              : "color-mix(in srgb, var(--color-foreground) 60%, transparent)",
            letterSpacing: isSkim ? "-0.02em" : "0",
          }}
        >
          {isSkim ? SUMMARY_TEXT : DETAILED_TEXT}
        </div>

        <div
          className="pointer-events-none absolute inset-0 rounded-lg border-2 transition-colors duration-300"
          style={{
            borderColor: isSkim
              ? "hsl(45 100% 60% / 0.4)"
              : "hsl(210 100% 60% / 0.2)",
          }}
        />

        <div className="mt-4 flex items-center justify-between font-mono text-xs">
          <span
            className="rounded-full px-2.5 py-0.5 font-semibold uppercase tracking-wider transition-colors duration-300"
            style={{
              backgroundColor: isSkim
                ? "hsl(45 100% 60% / 0.15)"
                : "hsl(210 100% 60% / 0.1)",
              color: isSkim ? "hsl(45 100% 60%)" : "hsl(210 100% 60%)",
            }}
          >
            {isSkim ? "Skim" : "Detailed"}
          </span>
          <span className="text-muted-foreground">
            {Math.round(speed * 30)} px/s
          </span>
        </div>
      </div>

      <Range
        formatValue={(v) => `${v}%`}
        label="Scroll speed"
        max={100}
        min={0}
        onChange={setSpeed}
        value={speed}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// HysteresisDemo — implementation demo
// Canvas-based state machine visualization with animated velocity signal.
// ---------------------------------------------------------------------------

const HYS_PADDING = { top: 20, right: 16, bottom: 30, left: 70 };

export function HysteresisDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enterThreshold, setEnterThreshold] = useState(500);
  const [exitThreshold, setExitThreshold] = useState(400);
  const [exitDelay, setExitDelay] = useState(2500);
  const [isPlaying, setIsPlaying] = useState(true);
  const rafRef = useRef(0);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);
    const time = timeRef.current;
    const maxV = 800;

    const plotX = (t: number) =>
      HYS_PADDING.left + (t / 10) * (w - HYS_PADDING.left - HYS_PADDING.right);
    const plotY = (v: number) =>
      HYS_PADDING.top +
      (1 - v / maxV) * (h - HYS_PADDING.top - HYS_PADDING.bottom);

    const velocityAt = (t: number) => {
      const cycle = t % 10;
      if (cycle < 2) {
        return 100 + cycle * 200;
      }
      if (cycle < 3.5) {
        return 500 + (cycle - 2) * 100;
      }
      if (cycle < 5) {
        return 650 - ((cycle - 3.5) / 1.5) * 200;
      }
      if (cycle < 6.5) {
        return 450 + Math.sin(((cycle - 5) * 2 * Math.PI) / 1.5) * 40;
      }
      if (cycle < 7.5) {
        return 450 + (cycle - 6.5) * 200;
      }
      if (cycle < 9) {
        return 650 - ((cycle - 7.5) / 1.5) * 450;
      }
      return 200 - (cycle - 9) * 100;
    };

    // Background
    ctx.fillStyle = "color-mix(in srgb, var(--color-muted) 30%, transparent)";
    ctx.fillRect(
      HYS_PADDING.left,
      HYS_PADDING.top,
      w - HYS_PADDING.left - HYS_PADDING.right,
      h - HYS_PADDING.top - HYS_PADDING.bottom
    );

    // Dead zone fill
    const deadTop = plotY(enterThreshold);
    const deadBottom = plotY(exitThreshold);
    ctx.fillStyle = "hsl(45 100% 50% / 0.08)";
    ctx.fillRect(
      HYS_PADDING.left,
      deadTop,
      w - HYS_PADDING.left - HYS_PADDING.right,
      deadBottom - deadTop
    );

    // Threshold lines
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1;

    ctx.strokeStyle = "hsl(0 80% 60% / 0.7)";
    ctx.beginPath();
    ctx.moveTo(HYS_PADDING.left, plotY(enterThreshold));
    ctx.lineTo(w - HYS_PADDING.right, plotY(enterThreshold));
    ctx.stroke();

    ctx.strokeStyle = "hsl(210 80% 60% / 0.7)";
    ctx.beginPath();
    ctx.moveTo(HYS_PADDING.left, plotY(exitThreshold));
    ctx.lineTo(w - HYS_PADDING.right, plotY(exitThreshold));
    ctx.stroke();

    ctx.setLineDash([]);

    // State coloring along the waveform
    const samples = 200;
    const stepSize = 10 / samples;
    const playheadT = time % 10;
    let currentState: "detailed" | "skim" = "detailed";
    let timer = 0;
    let playheadState: "detailed" | "skim" = "detailed";

    for (let i = 0; i < samples; i++) {
      const sampleT = (i / samples) * 10;
      const v = velocityAt(sampleT);

      if (v > enterThreshold) {
        currentState = "skim";
        timer = 0;
      } else if (v < exitThreshold && currentState === "skim") {
        timer += stepSize * 1000;
        if (timer > exitDelay) {
          currentState = "detailed";
          timer = 0;
        }
      } else if (currentState === "skim") {
        timer = 0;
      }

      const nextSampleT = ((i + 1) / samples) * 10;
      if (sampleT <= playheadT && playheadT < nextSampleT) {
        playheadState = currentState;
      }

      const x1 = plotX(sampleT);
      const x2 = plotX(nextSampleT);
      ctx.fillStyle =
        currentState === "skim"
          ? "hsl(45 100% 50% / 0.15)"
          : "hsl(210 100% 60% / 0.08)";
      ctx.fillRect(
        x1,
        HYS_PADDING.top,
        x2 - x1,
        h - HYS_PADDING.top - HYS_PADDING.bottom
      );
    }

    // Re-draw waveform on top of state fill
    ctx.strokeStyle =
      "color-mix(in srgb, var(--color-foreground) 80%, transparent)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const sampleT = (i / samples) * 10;
      const v = velocityAt(sampleT);
      const x = plotX(sampleT);
      const y = plotY(Math.min(v, maxV));
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Playhead
    const playheadX = plotX(time % 10);
    ctx.strokeStyle = "var(--color-foreground)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(playheadX, HYS_PADDING.top);
    ctx.lineTo(playheadX, h - HYS_PADDING.bottom);
    ctx.stroke();

    const currentV = velocityAt(time % 10);
    ctx.fillStyle = "var(--color-foreground)";
    ctx.beginPath();
    ctx.arc(playheadX, plotY(Math.min(currentV, maxV)), 4, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.font = "11px ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.fillStyle =
      "color-mix(in srgb, var(--color-foreground) 50%, transparent)";
    ctx.fillText("800", HYS_PADDING.left - 6, plotY(800) + 4);
    ctx.fillText("0", HYS_PADDING.left - 6, plotY(0) + 4);

    ctx.fillStyle = "hsl(0 80% 60% / 0.8)";
    ctx.fillText(
      `enter ${enterThreshold}`,
      HYS_PADDING.left - 6,
      plotY(enterThreshold) + 4
    );
    ctx.fillStyle = "hsl(210 80% 60% / 0.8)";
    ctx.fillText(
      `exit ${exitThreshold}`,
      HYS_PADDING.left - 6,
      plotY(exitThreshold) + 4
    );

    ctx.textAlign = "center";
    ctx.fillStyle = "hsl(45 100% 50% / 0.5)";
    const deadCenterY = (deadTop + deadBottom) / 2;
    ctx.fillText("dead zone", w / 2, deadCenterY + 4);

    const stateColor =
      playheadState === "skim" ? "hsl(45 100% 50%)" : "hsl(210 80% 60%)";
    ctx.fillStyle = stateColor;
    ctx.font = "bold 11px ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.fillText(
      `${Math.round(currentV)} px/s`,
      w - HYS_PADDING.right,
      HYS_PADDING.top - 6
    );
  }, [enterThreshold, exitThreshold, exitDelay]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const tick = () => {
      timeRef.current += 0.03;
      draw();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, draw]);

  useEffect(() => {
    if (!isPlaying) {
      draw();
    }
  }, [isPlaying, draw]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <canvas
          className="w-full rounded border border-border"
          ref={canvasRef}
          style={{ height: 200 }}
        />
        <button
          className="absolute right-2 bottom-2 rounded bg-muted/80 px-2 py-0.5 font-mono text-muted-foreground text-xs backdrop-blur-sm hover:bg-muted"
          onClick={() => setIsPlaying((p) => !p)}
          type="button"
        >
          {isPlaying ? "pause" : "play"}
        </button>
      </div>
      <ControlGroup columns={3}>
        <Range
          label="Enter threshold"
          max={700}
          min={Math.max(200, exitThreshold + 50)}
          onChange={setEnterThreshold}
          step={50}
          value={enterThreshold}
        />
        <Range
          label="Exit threshold"
          max={Math.min(600, enterThreshold - 50)}
          min={100}
          onChange={setExitThreshold}
          step={50}
          value={exitThreshold}
        />
        <Range
          formatValue={(v) => `${v}ms`}
          label="Exit delay"
          max={5000}
          min={500}
          onChange={setExitDelay}
          step={250}
          value={exitDelay}
        />
      </ControlGroup>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VelocityTrackingDemo — implementation demo
// Oscilloscope-style display showing velocity normalization and thresholds.
// ---------------------------------------------------------------------------

const SCOPE_HISTORY = 120;

export function VelocityTrackingDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inputVelocity, setInputVelocity] = useState(0);
  const historyRef = useRef<number[]>(new Array(SCOPE_HISTORY).fill(0));
  const rafRef = useRef(0);
  const velocityRef = useRef(0);
  const normMax = 3000;
  const skimEnter = 500;
  const skimExit = 400;

  useEffect(() => {
    velocityRef.current = inputVelocity;
  }, [inputVelocity]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    const history = historyRef.current;
    history.push(velocityRef.current);
    if (history.length > SCOPE_HISTORY) {
      history.shift();
    }

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "color-mix(in srgb, var(--color-muted) 30%, transparent)";
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle =
      "color-mix(in srgb, var(--color-foreground) 8%, transparent)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const toY = (v: number) => h - (v / normMax) * h;

    // Normalization ceiling
    ctx.strokeStyle =
      "color-mix(in srgb, var(--color-foreground) 20%, transparent)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.stroke();

    // Skim enter threshold
    ctx.strokeStyle = "hsl(0 80% 60% / 0.5)";
    ctx.beginPath();
    ctx.moveTo(0, toY(skimEnter));
    ctx.lineTo(w, toY(skimEnter));
    ctx.stroke();

    // Skim exit threshold
    ctx.strokeStyle = "hsl(210 80% 60% / 0.5)";
    ctx.beginPath();
    ctx.moveTo(0, toY(skimExit));
    ctx.lineTo(w, toY(skimExit));
    ctx.stroke();

    ctx.setLineDash([]);

    // Waveform fill
    ctx.fillStyle =
      "color-mix(in srgb, var(--color-foreground) 6%, transparent)";
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < history.length; i++) {
      const x = (i / (SCOPE_HISTORY - 1)) * w;
      const y = toY(Math.min(history[i], normMax));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Waveform stroke
    ctx.strokeStyle =
      "color-mix(in srgb, var(--color-foreground) 70%, transparent)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const x = (i / (SCOPE_HISTORY - 1)) * w;
      const y = toY(Math.min(history[i], normMax));
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Current value dot
    const lastV = history.at(-1) ?? 0;
    const dotY = toY(Math.min(lastV, normMax));
    ctx.fillStyle = "var(--color-foreground)";
    ctx.beginPath();
    ctx.arc(w, dotY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Labels
    ctx.font = "10px ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.fillStyle =
      "color-mix(in srgb, var(--color-foreground) 40%, transparent)";
    ctx.fillText(`${normMax} (max)`, 4, 12);
    ctx.fillText("0", 4, h - 4);

    ctx.fillStyle = "hsl(0 80% 60% / 0.7)";
    ctx.fillText("enter 500", 4, toY(skimEnter) - 4);
    ctx.fillStyle = "hsl(210 80% 60% / 0.7)";
    ctx.fillText("exit 400", 4, toY(skimExit) + 14);

    // Normalized value readout
    const norm = Math.min(lastV / normMax, 1);
    ctx.textAlign = "right";
    ctx.font = "bold 12px ui-monospace, monospace";
    ctx.fillStyle = "var(--color-foreground)";
    ctx.fillText(`norm: ${norm.toFixed(2)}`, w - 4, 16);
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillStyle =
      "color-mix(in srgb, var(--color-foreground) 60%, transparent)";
    ctx.fillText(`${Math.round(lastV)} px/s`, w - 4, 30);

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div className="space-y-4">
      <canvas
        className="w-full rounded border border-border"
        ref={canvasRef}
        style={{ height: 180 }}
      />
      <Range
        formatValue={(v) => `${v} px/s`}
        label="Velocity"
        max={normMax}
        min={0}
        onChange={setInputVelocity}
        step={10}
        value={inputVelocity}
      />
    </div>
  );
}
