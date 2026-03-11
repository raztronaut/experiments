"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";

interface ParticleState {
  rotation: number;
  rotationSpeed: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

export interface ImageExplosionProps {
  className?: string;
  friction?: number;
  gravity?: number;
  horizontalForce?: number;
  imageSize?: number;
  images?: string[];
  rotationSpeed?: number;
  trigger?: "scroll" | "click";
  verticalForce?: number;
}

const DEFAULT_IMAGES = Array.from(
  { length: 15 },
  (_, i) =>
    `https://images.unsplash.com/photo-${
      [
        "1618005182384-a83a8bd57fbe",
        "1614850523459-c2f4c699c52e",
        "1558591710-4b4a1ae0f04d",
        "1579547945413-497e1b99dac0",
        "1541961017774-22349e4a1262",
        "1578301978693-85fa9c0320b9",
        "1549490349-8643362247b5",
        "1604871000636-074fa5117945",
        "1618005198919-d3d4b5a92ead",
        "1635070041078-e363dbe005cb",
        "1557672172-298e090bd0f1",
        "1560762484-813fc97650a0",
        "1567095761054-7a02e69e5b2b",
        "1551376347-075b0121a65b",
        "1506905925346-21bda4d32df4",
      ][i % 15]
    }?w=300&q=80`
);

export function ImageExplosion({
  images = DEFAULT_IMAGES,
  imageSize = 150,
  gravity = 0.25,
  friction = 0.99,
  horizontalForce = 20,
  verticalForce = 15,
  rotationSpeed = 10,
  trigger = "scroll",
  className,
}: ImageExplosionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<HTMLImageElement[]>([]);
  const particleStates = useRef<ParticleState[]>([]);
  const animFrameRef = useRef<number>(0);
  const [triggered, setTriggered] = useState(false);

  const initParticle = useCallback(
    (): ParticleState => ({
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * horizontalForce,
      vy: -verticalForce - Math.random() * 10,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * rotationSpeed,
    }),
    [horizontalForce, verticalForce, rotationSpeed]
  );

  const explode = useCallback(() => {
    if (triggered) {
      return;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      return;
    }

    setTriggered(true);

    particleStates.current = images.map(() => initParticle());

    const animate = () => {
      let allDone = true;

      for (let i = 0; i < particleStates.current.length; i++) {
        const ps = particleStates.current[i];
        const el = particleRefs.current[i];
        if (!(ps && el)) {
          continue;
        }

        ps.vy += gravity;
        ps.vx *= friction;
        ps.vy *= friction;
        ps.rotationSpeed *= friction;
        ps.x += ps.vx;
        ps.y += ps.vy;
        ps.rotation += ps.rotationSpeed;

        el.style.transform = `translate(${ps.x}px, ${ps.y}px) rotate(${ps.rotation}deg)`;

        const container = containerRef.current;
        if (container && ps.y < container.offsetHeight / 2) {
          allDone = false;
        }
      }

      if (allDone) {
        setTimeout(() => setTriggered(false), 500);
        return;
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [triggered, images, initParticle, gravity, friction]);

  useEffect(() => {
    if (trigger !== "scroll") {
      return;
    }

    const container = containerRef.current?.parentElement;
    if (!container) {
      return;
    }

    let checkTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(checkTimeout);
      checkTimeout = setTimeout(() => {
        const rect = container.getBoundingClientRect();
        const vh = window.innerHeight;
        if (!triggered && rect.top <= vh - rect.height * 0.5) {
          explode();
        }
      }, 10);
    };

    window.addEventListener("scroll", handleScroll);
    setTimeout(handleScroll, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(checkTimeout);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [trigger, triggered, explode]);

  const handleClick = () => {
    if (trigger === "click") {
      explode();
    }
  };

  return (
    <div
      className={`iex-container ${className ?? ""}`.trim()}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" && trigger === "click") {
          explode();
        }
      }}
      ref={containerRef}
      role={trigger === "click" ? "button" : undefined}
      tabIndex={trigger === "click" ? 0 : undefined}
    >
      {images.map((src, i) => (
        <img
          alt=""
          className="iex-particle"
          key={i}
          ref={(el) => {
            if (el) {
              particleRefs.current[i] = el;
            }
          }}
          src={src}
          style={{ width: `${imageSize}px` }}
        />
      ))}
    </div>
  );
}

export default ImageExplosion;
