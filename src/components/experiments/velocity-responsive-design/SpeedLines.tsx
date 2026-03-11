"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTempus } from "tempus/react";
import { useVelocityState } from "./VelocityContext";

interface Particle {
  length: number;
  speed: number;
  x: number;
  y: number;
}

const PARTICLE_COUNT = 40;

export function SpeedLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { normalizedVelocity, reducedMotion } = useVelocityState();
  const velocityRef = useRef(normalizedVelocity);
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    velocityRef.current = normalizedVelocity;
  }, [normalizedVelocity]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;
    }

    sizeRef.current = { w, h };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    resize();

    if (particlesRef.current.length === 0) {
      const { w, h } = sizeRef.current;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          length: Math.random() * 100 + 50,
          speed: Math.random() * 5 + 2,
        });
      }
    }

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [reducedMotion, resize]);

  useTempus(
    () => {
      if (reducedMotion) {
        return;
      }

      const ctx = ctxRef.current;
      if (!ctx) {
        return;
      }

      const { w, h } = sizeRef.current;
      const v = velocityRef.current;
      ctx.clearRect(0, 0, w, h);

      if (v < 0.1) {
        return;
      }

      const centerX = w / 2;
      const centerY = h / 2;
      const halfW = w / 2;

      for (const p of particlesRef.current) {
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const distRatio = distance / halfW;

        ctx.strokeStyle = `rgba(255, 255, 255, ${v * 0.5 * distRatio})`;
        ctx.lineWidth = 0.5 + v * 1.5;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);

        const lineLength = p.length * v * distRatio;
        ctx.lineTo(
          p.x + Math.cos(angle) * lineLength,
          p.y + Math.sin(angle) * lineLength
        );
        ctx.stroke();

        const speed = p.speed * v * 20;
        p.x += Math.cos(angle) * speed;
        p.y += Math.sin(angle) * speed;

        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          const startAngle = Math.random() * Math.PI * 2;
          const startDistance = Math.random() * 200;
          p.x = centerX + Math.cos(startAngle) * startDistance;
          p.y = centerY + Math.sin(startAngle) * startDistance;
          p.length = Math.random() * 80 + 20;
        }
      }
    },
    { priority: 2 }
  );

  return (
    <canvas
      className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-screen"
      ref={canvasRef}
    />
  );
}
