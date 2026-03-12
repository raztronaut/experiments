"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

export interface SpotlightImageStackProps {
  className?: string;
  finalPositions?: [number, number][];
  headerText?: string;
  images?: string[];
}

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
  "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=800&q=80",
];

const DEFAULT_FINAL_POSITIONS: [number, number][] = [
  [-140, -140],
  [40, -130],
  [-160, 40],
  [20, 30],
];

export function SpotlightImageStack({
  images = DEFAULT_IMAGES,
  headerText = "Time stretches differently inside this frame.",
  finalPositions = DEFAULT_FINAL_POSITIONS,
  className,
}: SpotlightImageStackProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const imgEls = gsap.utils.toArray<HTMLElement>(".sis-img");

      if (prefersReduced) {
        imgEls.forEach((img, i) => {
          const [fx, fy] = finalPositions[i] ?? [0, 0];
          gsap.set(img, {
            transform: `translate(${fx}%, ${fy}%) rotate(0deg)`,
          });
        });
        return;
      }

      const initialRotations = [5, -3, 3.5, -1];
      const phase1Offsets = [0, 0.1, 0.2, 0.3];
      const phase2Offsets = [0.5, 0.55, 0.6, 0.65];

      ScrollTrigger.create({
        trigger: ".sis-spotlight",
        start: "top top",
        end: `+=${window.innerHeight * 6}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;

          imgEls.forEach((img, index) => {
            const initRot = initialRotations[index] ?? 0;
            const p1Start = phase1Offsets[index] ?? 0;
            const p1End = Math.min(p1Start + (0.45 - p1Start) * 0.9, 0.45);

            let x = -50;
            let y: number;
            let rotation: number;

            if (progress < p1Start) {
              y = 200;
              rotation = initRot;
            } else if (progress <= 0.45) {
              const p1Progress =
                progress >= p1End
                  ? 1
                  : 1 - (1 - (progress - p1Start) / (p1End - p1Start)) ** 3;
              y = 200 - p1Progress * 250;
              rotation = initRot;
            } else {
              y = -50;
              rotation = initRot;
            }

            const p2Start = phase2Offsets[index] ?? 0.5;
            const p2End = Math.min(p2Start + (0.95 - p2Start) * 0.9, 0.95);
            const [finalX, finalY] = finalPositions[index] ?? [0, 0];

            if (progress >= p2Start && progress <= 0.95) {
              const p2Progress =
                progress >= p2End
                  ? 1
                  : 1 - (1 - (progress - p2Start) / (p2End - p2Start)) ** 3;
              x = -50 + (finalX + 50) * p2Progress;
              y = -50 + (finalY + 50) * p2Progress;
              rotation = initRot * (1 - p2Progress);
            } else if (progress > 0.95) {
              x = finalX;
              y = finalY;
              rotation = 0;
            }

            gsap.set(img, {
              transform: `translate(${x}%, ${y}%) rotate(${rotation}deg)`,
            });
          });
        },
      });
    },
    { scope: container }
  );

  return (
    <div className={`sis-container ${className ?? ""}`.trim()} ref={container}>
      <section className="sis-spotlight">
        <div className="sis-spotlight-header">
          <h1>{headerText}</h1>
        </div>
        <div className="sis-spotlight-images">
          {images.map((img, i) => (
            <div className="sis-img" key={i}>
              <img alt="" src={img} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SpotlightImageStack;
