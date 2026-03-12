"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef } from "react";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

const DEMO_FRAMES = Array.from(
  { length: 60 },
  (_, i) =>
    `https://picsum.photos/seed/frame${String(i).padStart(3, "0")}/1920/1080`
);

export interface ScrollFrameCanvasProps {
  className?: string;
  dashboardImage?: string;
  frameUrls?: string[];
  headerText?: string;
}

export function ScrollFrameCanvas({
  frameUrls = DEMO_FRAMES,
  headerText = "One unified workspace to build, test, and ship AI faster",
  dashboardImage,
  className,
}: ScrollFrameCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef({ frame: 0 });
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!(ctx && canvas)) {
      return;
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const img = imagesRef.current[frameRef.current.frame];
    if (!(img?.complete && img.naturalWidth > 0)) {
      return;
    }

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = w / h;
    let dw: number;
    let dh: number;
    let dx: number;
    let dy: number;

    if (imgAspect > canvasAspect) {
      dh = h;
      dw = dh * imgAspect;
      dx = (w - dw) / 2;
      dy = 0;
    } else {
      dw = w;
      dh = dw / imgAspect;
      dx = 0;
      dy = (h - dh) / 2;
    }

    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctxRef.current = ctx;
    }

    let loaded = 0;
    const total = frameUrls.length;
    imagesRef.current = frameUrls.map((url) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === total) {
          render();
        }
      };
      img.onerror = () => {
        loaded++;
      };
      img.src = url;
      return img;
    });

    const onResize = () => {
      const r = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * r;
      canvas.height = window.innerHeight * r;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const c = canvas.getContext("2d");
      if (c) {
        c.scale(r, r);
        ctxRef.current = c;
      }
      render();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [frameUrls, render]);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        return;
      }

      const frameCount = frameUrls.length;

      ScrollTrigger.create({
        trigger: ".sfc-hero",
        start: "top top",
        end: `+=${window.innerHeight * 7}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const animProgress = Math.min(progress / 0.9, 1);
          frameRef.current.frame = Math.round(animProgress * (frameCount - 1));
          render();

          if (progress <= 0.25) {
            const zProg = progress / 0.25;
            const tz = zProg * -500;
            let opacity = 1;
            if (progress >= 0.2) {
              opacity = 1 - Math.min((progress - 0.2) / 0.05, 1);
            }
            gsap.set(".sfc-header", {
              transform: `translate(-50%, -50%) translateZ(${tz}px)`,
              opacity,
            });
          } else {
            gsap.set(".sfc-header", { opacity: 0 });
          }

          if (dashboardImage) {
            if (progress < 0.6) {
              gsap.set(".sfc-hero-img", {
                transform: "translateZ(1000px)",
                opacity: 0,
              });
            } else if (progress <= 0.9) {
              const ip = (progress - 0.6) / 0.3;
              const tz = 1000 - ip * 1000;
              const op = progress <= 0.8 ? (progress - 0.6) / 0.2 : 1;
              gsap.set(".sfc-hero-img", {
                transform: `translateZ(${tz}px)`,
                opacity: op,
              });
            } else {
              gsap.set(".sfc-hero-img", {
                transform: "translateZ(0px)",
                opacity: 1,
              });
            }
          }
        },
      });
    },
    { scope: container, dependencies: [frameUrls.length, dashboardImage] }
  );

  return (
    <div className={`sfc-container ${className ?? ""}`.trim()} ref={container}>
      <section className="sfc-hero">
        <canvas className="sfc-canvas" ref={canvasRef} />

        <div className="sfc-hero-content">
          <div className="sfc-header">
            <h1>{headerText}</h1>
          </div>
        </div>

        {dashboardImage && (
          <div className="sfc-hero-img-container">
            <div className="sfc-hero-img">
              <img alt="" src={dashboardImage} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default ScrollFrameCanvas;
