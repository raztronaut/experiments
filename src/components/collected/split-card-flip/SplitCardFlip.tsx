"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

export interface SplitCardFlipCard {
  backColor?: string;
  backIndex: string;
  backLabel: string;
  frontImage: string;
}

export interface SplitCardFlipProps {
  cards?: SplitCardFlipCard[];
  className?: string;
  stickyHeaderText?: string;
}

const DEFAULT_CARDS: SplitCardFlipCard[] = [
  {
    frontImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    backIndex: "( 01 )",
    backLabel: "Interactive Web Experiences",
    backColor: "#b2b2b2",
  },
  {
    frontImage:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80",
    backIndex: "( 02 )",
    backLabel: "Thoughtful Design Language",
    backColor: "#ce2017",
  },
  {
    frontImage:
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&q=80",
    backIndex: "( 03 )",
    backLabel: "Visual Design Systems",
    backColor: "#2f2f2f",
  },
];

export function SplitCardFlip({
  cards = DEFAULT_CARDS,
  stickyHeaderText = "Three pillars with one purpose",
  className,
}: SplitCardFlipProps) {
  const container = useRef<HTMLDivElement>(null);
  const gapDone = useRef(false);
  const flipDone = useRef(false);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1000px)", () => {
        const scope = container.current!;
        const cardContainer = scope.querySelector<HTMLElement>(
          ".spf-card-container"
        )!;
        const stickyHeader = scope.querySelector<HTMLElement>(
          ".spf-sticky-header h1"
        )!;

        gapDone.current = false;
        flipDone.current = false;

        ScrollTrigger.create({
          trigger: ".spf-sticky",
          start: "top top",
          end: `+=${window.innerHeight * 4}px`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          onUpdate: (self) => {
            const progress = self.progress;

            if (progress >= 0.1 && progress <= 0.25) {
              const hp = gsap.utils.mapRange(0.1, 0.25, 0, 1, progress);
              gsap.set(stickyHeader, {
                y: gsap.utils.mapRange(0, 1, 40, 0, hp),
                opacity: hp,
              });
            } else if (progress < 0.1) {
              gsap.set(stickyHeader, { y: 40, opacity: 0 });
            } else {
              gsap.set(stickyHeader, { y: 0, opacity: 1 });
            }

            gsap.set(cardContainer, {
              width: `${progress <= 0.25 ? gsap.utils.mapRange(0, 0.25, 75, 60, progress) : 60}%`,
            });

            if (progress >= 0.35 && !gapDone.current) {
              gsap.to(cardContainer, {
                gap: "20px",
                duration: 0.5,
                ease: "power3.out",
              });
              gsap.to(".spf-card", {
                borderRadius: "20px",
                duration: 0.5,
                ease: "power3.out",
              });
              gapDone.current = true;
            } else if (progress < 0.35 && gapDone.current) {
              gsap.to(cardContainer, {
                gap: "0px",
                duration: 0.5,
                ease: "power3.out",
              });
              const cardEls = gsap.utils.toArray<HTMLElement>(".spf-card");
              cardEls.forEach((card, i) => {
                const br =
                  i === 0
                    ? "20px 0 0 20px"
                    : i === cardEls.length - 1
                      ? "0 20px 20px 0"
                      : "0px";
                gsap.to(card, {
                  borderRadius: br,
                  duration: 0.5,
                  ease: "power3.out",
                });
              });
              gapDone.current = false;
            }

            if (progress >= 0.7 && !flipDone.current) {
              gsap.to(".spf-card", {
                rotationY: 180,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: 0.1,
              });
              const outerCards = [
                ".spf-card:first-child",
                ".spf-card:last-child",
              ];
              gsap.to(outerCards, {
                y: 30,
                rotationZ: (_i: number) => [-15, 15][_i],
                duration: 0.75,
                ease: "power3.inOut",
              });
              flipDone.current = true;
            } else if (progress < 0.7 && flipDone.current) {
              gsap.to(".spf-card", {
                rotationY: 0,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: -0.1,
              });
              gsap.to([".spf-card:first-child", ".spf-card:last-child"], {
                y: 0,
                rotationZ: 0,
                duration: 0.75,
                ease: "power3.inOut",
              });
              flipDone.current = false;
            }
          },
        });

        return () => {
          gapDone.current = false;
          flipDone.current = false;
        };
      });
    },
    { scope: container }
  );

  return (
    <div className={`spf-container ${className ?? ""}`.trim()} ref={container}>
      <section className="spf-sticky">
        <div className="spf-sticky-header">
          <h1>{stickyHeaderText}</h1>
        </div>
        <div className="spf-card-container">
          {cards.map((card, i) => (
            <div
              className="spf-card"
              key={i}
              style={
                card.backColor
                  ? ({
                      "--spf-back-color": card.backColor,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="spf-card-front">
                <img alt={card.backLabel} src={card.frontImage} />
              </div>
              <div className="spf-card-back">
                <span>{card.backIndex}</span>
                <p>{card.backLabel}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SplitCardFlip;
