"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

export interface StickyCardsTiltCard {
  description: string;
  image: string;
  index: string;
  subtitle?: string;
  title: string;
}

export interface StickyCardsTiltProps {
  cards?: StickyCardsTiltCard[];
  className?: string;
}

const DEFAULT_CARDS: StickyCardsTiltCard[] = [
  {
    index: "01",
    title: "Modularity",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    description:
      "Every element is built to snap into place. We design modular systems where clarity, structure, and reuse come first — no clutter, no excess.",
    subtitle: "About the state",
  },
  {
    index: "02",
    title: "Materials",
    image:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80",
    description:
      "From soft gradients to hard edges, our design language draws from real-world materials — elevating interfaces that feel both digital and tangible.",
    subtitle: "About the state",
  },
  {
    index: "03",
    title: "Precision",
    image:
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
    description:
      "Details matter. We work with intention — aligning pixels, calibrating contrast, and obsessing over every edge until it just feels right.",
    subtitle: "About the state",
  },
  {
    index: "04",
    title: "Character",
    image:
      "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=800&q=80",
    description:
      "Interfaces should have personality. We embed small moments of play and irregularity to bring warmth, charm, and a human feel to the digital.",
    subtitle: "About the state",
  },
];

export function StickyCardsTilt({
  cards = DEFAULT_CARDS,
  className,
}: StickyCardsTiltProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const cardEls = gsap.utils.toArray<HTMLElement>(
        ".sct-card",
        container.current!
      );

      if (prefersReduced) {
        cardEls.forEach((card) => {
          gsap.set(card, { scale: 1, rotation: 0, "--after-opacity": 0 });
        });
        return;
      }

      cardEls.forEach((card, index) => {
        if (index < cardEls.length - 1) {
          ScrollTrigger.create({
            trigger: card,
            start: "top top",
            endTrigger: cardEls.at(-1),
            end: "top top",
            pin: true,
            pinSpacing: false,
          });

          ScrollTrigger.create({
            trigger: cardEls[index + 1],
            start: "top bottom",
            end: "top top",
            onUpdate: (self) => {
              const progress = self.progress;
              gsap.set(card, {
                scale: 1 - progress * 0.25,
                rotation: (index % 2 === 0 ? 5 : -5) * progress,
                "--after-opacity": progress,
              });
            },
          });
        }
      });
    },
    { scope: container }
  );

  return (
    <div className={`sct-cards ${className ?? ""}`.trim()} ref={container}>
      {cards.map((cardData, index) => (
        <div className="sct-card" key={index}>
          <div className="sct-card-index">
            <h1>{cardData.index}</h1>
          </div>
          <div className="sct-card-content">
            <div className="sct-card-content-wrapper">
              <h1 className="sct-card-header">{cardData.title}</h1>
              <div className="sct-card-img">
                <img alt={cardData.title} src={cardData.image} />
              </div>
              <div className="sct-card-copy">
                <div className="sct-card-copy-title">
                  <p>({cardData.subtitle ?? "About the state"})</p>
                </div>
                <div className="sct-card-copy-description">
                  <p>{cardData.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StickyCardsTilt;
