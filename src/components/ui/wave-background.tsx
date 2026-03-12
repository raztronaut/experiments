"use client";
import type * as React from "react";
import { useEffect, useRef } from "react";
import { createNoise2D } from "simplex-noise";

interface Point {
  cursor: {
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
  wave: { x: number; y: number };
  x: number;
  y: number;
}

interface WavesProps {
  backgroundColor?: string;
  className?: string;
  pointerSize?: number;
  strokeColor?: string;
}

export function Waves({
  className = "",
  strokeColor = "#ffffff",
  backgroundColor = "transparent",
  pointerSize = 0.5,
}: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
  });
  const linesRef = useRef<Point[][]>([]);
  const noiseRef = useRef<((x: number, y: number) => number) | null>(null);
  const rafRef = useRef<number | null>(null);
  const boundingRef = useRef<DOMRect | null>(null);
  const isVisibleRef = useRef(true);
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const strokeColorRef = useRef(strokeColor);
  const reducedMotionRef = useRef(false);
  const dprRef = useRef(1);

  strokeColorRef.current = strokeColor;

  const setupCanvas = () => {
    if (!(containerRef.current && canvasRef.current)) {
      return;
    }

    boundingRef.current = containerRef.current.getBoundingClientRect();
    const { width, height } = boundingRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;

    const canvas = canvasRef.current;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  };

  const buildLines = () => {
    if (!boundingRef.current) {
      return;
    }

    const { width, height } = boundingRef.current;
    linesRef.current = [];

    const xGap = 8;
    const yGap = 8;

    const oWidth = width + 200;
    const oHeight = height + 30;

    const totalLines = Math.ceil(oWidth / xGap);
    const totalPoints = Math.ceil(oHeight / yGap);

    const xStart = (width - xGap * totalLines) / 2;
    const yStart = (height - yGap * totalPoints) / 2;

    for (let i = 0; i < totalLines; i++) {
      const points: Point[] = [];
      for (let j = 0; j < totalPoints; j++) {
        points.push({
          x: xStart + xGap * i,
          y: yStart + yGap * j,
          wave: { x: 0, y: 0 },
          cursor: { x: 0, y: 0, vx: 0, vy: 0 },
        });
      }
      linesRef.current.push(points);
    }
  };

  const onResize = () => {
    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current);
    }
    resizeTimerRef.current = setTimeout(() => {
      setupCanvas();
      buildLines();
    }, 150);
  };

  const updateMousePosition = (x: number, y: number) => {
    if (!boundingRef.current) {
      return;
    }

    const mouse = mouseRef.current;
    mouse.x = x - boundingRef.current.left;
    mouse.y = y - boundingRef.current.top + window.scrollY;

    if (!mouse.set) {
      mouse.sx = mouse.x;
      mouse.sy = mouse.y;
      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      mouse.set = true;
    }

    if (containerRef.current) {
      containerRef.current.style.setProperty("--x", `${mouse.sx}px`);
      containerRef.current.style.setProperty("--y", `${mouse.sy}px`);
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    updateMousePosition(e.pageX, e.pageY);
  };

  const onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    updateMousePosition(touch.clientX, touch.clientY);
  };

  const movePoints = (time: number) => {
    const lines = linesRef.current;
    const mouse = mouseRef.current;
    const noise = noiseRef.current;
    if (!noise) {
      return;
    }

    for (const points of lines) {
      for (const p of points) {
        const move =
          noise((p.x + time * 0.008) * 0.003, (p.y + time * 0.003) * 0.002) * 8;

        p.wave.x = Math.cos(move) * 12;
        p.wave.y = Math.sin(move) * 6;

        const dx = p.x - mouse.sx;
        const dy = p.y - mouse.sy;
        const d = Math.hypot(dx, dy);
        const radius = Math.max(175, mouse.vs);

        if (d < radius) {
          const s = 1 - d / radius;
          const f = Math.cos(d * 0.001) * s;

          p.cursor.vx += Math.cos(mouse.a) * f * radius * mouse.vs * 0.000_35;
          p.cursor.vy += Math.sin(mouse.a) * f * radius * mouse.vs * 0.000_35;
        }

        p.cursor.vx += (0 - p.cursor.x) * 0.01;
        p.cursor.vy += (0 - p.cursor.y) * 0.01;

        p.cursor.vx *= 0.95;
        p.cursor.vy *= 0.95;

        p.cursor.x += p.cursor.vx;
        p.cursor.y += p.cursor.vy;

        p.cursor.x = Math.min(50, Math.max(-50, p.cursor.x));
        p.cursor.y = Math.min(50, Math.max(-50, p.cursor.y));
      }
    }
  };

  const drawLines = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = dprRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = strokeColorRef.current;
    ctx.lineWidth = dpr;

    for (const points of linesRef.current) {
      if (points.length < 2) {
        continue;
      }

      ctx.beginPath();

      const first = points[0];
      ctx.moveTo(
        (first.x + first.wave.x) * dpr,
        (first.y + first.wave.y) * dpr
      );

      for (const p of points.slice(1)) {
        ctx.lineTo(
          (p.x + p.wave.x + p.cursor.x) * dpr,
          (p.y + p.wave.y + p.cursor.y) * dpr
        );
      }

      ctx.stroke();
    }
  };

  const tick = (time: number) => {
    if (!isVisibleRef.current || reducedMotionRef.current) {
      return;
    }

    const mouse = mouseRef.current;

    mouse.sx += (mouse.x - mouse.sx) * 0.1;
    mouse.sy += (mouse.y - mouse.sy) * 0.1;

    const dx = mouse.x - mouse.lx;
    const dy = mouse.y - mouse.ly;
    const d = Math.hypot(dx, dy);

    mouse.v = d;
    mouse.vs += (d - mouse.vs) * 0.1;
    mouse.vs = Math.min(100, mouse.vs);

    mouse.lx = mouse.x;
    mouse.ly = mouse.y;
    mouse.a = Math.atan2(dy, dx);

    if (containerRef.current) {
      containerRef.current.style.setProperty("--x", `${mouse.sx}px`);
      containerRef.current.style.setProperty("--y", `${mouse.sy}px`);
    }

    movePoints(time);
    drawLines();

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!(container && canvasRef.current)) {
      return;
    }

    noiseRef.current = createNoise2D();

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mql.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      if (e.matches) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = null;
      } else if (isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    mql.addEventListener("change", onMotionChange);

    setupCanvas();
    buildLines();

    if (reducedMotionRef.current) {
      movePoints(0);
      drawLines();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisibleRef.current;
        isVisibleRef.current = entry.isIntersecting;

        if (entry.isIntersecting && !wasVisible && !reducedMotionRef.current) {
          window.addEventListener("mousemove", onMouseMove);
          container.addEventListener("touchmove", onTouchMove, {
            passive: true,
          });
          rafRef.current = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && wasVisible) {
          window.removeEventListener("mousemove", onMouseMove);
          container.removeEventListener("touchmove", onTouchMove);
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
          }
        }
      },
      { threshold: 0 }
    );
    observer.observe(container);

    window.addEventListener("resize", onResize);

    if (isVisibleRef.current && !reducedMotionRef.current) {
      window.addEventListener("mousemove", onMouseMove);
      container.addEventListener("touchmove", onTouchMove, { passive: true });
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      container?.removeEventListener("touchmove", onTouchMove);
      observer.disconnect();
      mql.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div
      className={`waves-component ${className}`}
      ref={containerRef}
      style={
        {
          backgroundColor,
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          "--x": "-0.5rem",
          "--y": "50%",
        } as React.CSSProperties
      }
    >
      <canvas className="block h-full w-full" ref={canvasRef} />
      <div
        className="pointer-dot"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${pointerSize}rem`,
          height: `${pointerSize}rem`,
          background: strokeColor,
          borderRadius: "50%",
          transform:
            "translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0)",
          willChange: "transform",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
