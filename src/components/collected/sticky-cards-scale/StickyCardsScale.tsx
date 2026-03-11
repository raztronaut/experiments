"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

export interface StickyCardsScaleCard {
  image: string;
  tag: string;
}

export interface StickyCardsScaleProps {
  cards?: StickyCardsScaleCard[];
  className?: string;
}

const DEFAULT_CARDS: StickyCardsScaleCard[] = [
  {
    tag: "Raw Emotion",
    image:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
  },
  {
    tag: "Inner Conflict",
    image:
      "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
  },
  {
    tag: "Fury & Flow",
    image:
      "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&q=80",
  },
  {
    tag: "Rebellion",
    image:
      "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&q=80",
  },
  {
    tag: "Liberation",
    image:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80",
  },
];

export function StickyCardsScale({
  cards = DEFAULT_CARDS,
  className,
}: StickyCardsScaleProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const cardEls = gsap.utils.toArray<HTMLElement>(
        ".scs-card",
        container.current!
      );
      const imageEls = gsap.utils.toArray<HTMLElement>(
        ".scs-card img",
        container.current!
      );
      const totalCards = cardEls.length;

      gsap.set(cardEls[0], { y: "0%", scale: 1, rotation: 0 });
      gsap.set(imageEls[0], { scale: 1 });

      for (let i = 1; i < totalCards; i++) {
        gsap.set(cardEls[i], { y: "100%", scale: 1, rotation: 0 });
        gsap.set(imageEls[i], { scale: 1 });
      }

      if (prefersReduced) {
        cardEls.forEach((card) => gsap.set(card, { y: "0%" }));
        return;
      }

      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: container.current!.querySelector(".scs-sticky-section"),
          start: "top top",
          end: `+=${window.innerHeight * (totalCards - 1)}`,
          pin: true,
          scrub: 0.5,
        },
      });

      for (let i = 0; i < totalCards - 1; i++) {
        const position = i;

        scrollTimeline.to(
          cardEls[i],
          { scale: 0.5, rotation: 10, duration: 1, ease: "none" },
          position
        );
        scrollTimeline.to(
          imageEls[i],
          { scale: 1.5, duration: 1, ease: "none" },
          position
        );
        scrollTimeline.to(
          cardEls[i + 1],
          { y: "0%", duration: 1, ease: "none" },
          position
        );
      }

      return () => {
        scrollTimeline.kill();
      };
    },
    { scope: container }
  );

  return (
    <div className={`scs-container ${className ?? ""}`.trim()} ref={container}>
      <section className="scs-sticky-section">
        <div className="scs-cards-container">
          {cards.map((card, index) => (
            <div className="scs-card" key={index}>
              <div className="scs-tag">
                <p>{card.tag}</p>
              </div>
              <img alt={card.tag} src={card.image} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default StickyCardsScale;
