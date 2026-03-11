"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

export interface StickyCardsFoldCard {
  accentColor?: string;
  description: string;
  image: string;
  info: string;
  title: string;
}

export interface StickyCardsFoldProps {
  cards?: StickyCardsFoldCard[];
  className?: string;
}

const DEFAULT_CARDS: StickyCardsFoldCard[] = [
  {
    info: "A surreal dive into neon hues and playful decay",
    title: "Reverie",
    description:
      "A psychedelic skull study exploring the tension between playfulness and decay. Bold candy tones, liquid forms, and crisp vectors bring a surreal, pop-art mood meant for covers and prints.",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    accentColor: "#b1c0ef",
  },
  {
    info: "A retro-futurist scene where nostalgia meets glitch",
    title: "Vaporwave",
    description:
      "An 80s-UI dreamscape: stacked windows, checkerboard floors, and a sunset gradient. Built to feel like a loading screen to another world — nostalgic, glossy, and a bit uncanny.",
    image:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80",
    accentColor: "#f2acac",
  },
  {
    info: "A kaleidoscope of folk motifs reimagined in digital form",
    title: "Kaleido",
    description:
      "Ornamental symmetry inspired by folk motifs and stained-glass glow. Designed as a seamless, tileable pattern for textiles, wallpapers, and rich UI backgrounds.",
    image:
      "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
    accentColor: "#fedd93",
  },
  {
    info: "A portrait framed by oddball creatures and doodles",
    title: "Menagerie",
    description:
      "A playful portrait surrounded by oddball companions — mascots, monsters, and midnight snacks. Loose linework meets pastel whimsy, perfect for merch, stickers, and editorial spots.",
    image:
      "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?w=800&q=80",
    accentColor: "#81b7bf",
  },
];

export function StickyCardsFold({
  cards = DEFAULT_CARDS,
  className,
}: StickyCardsFoldProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const cardEls = gsap.utils.toArray<HTMLElement>(
        ".scf-card",
        container.current!
      );

      if (prefersReduced) {
        cardEls.forEach((card) => {
          const inner = card.querySelector<HTMLElement>(".scf-card-inner");
          if (inner) {
            gsap.set(inner, { y: 0, z: 0, rotationX: 0, "--after-opacity": 0 });
          }
        });
        return;
      }

      cardEls.forEach((card, index) => {
        if (index < cardEls.length - 1) {
          const cardInner = card.querySelector(".scf-card-inner")!;

          gsap.fromTo(
            cardInner,
            { y: "0%", z: 0, rotationX: 0 },
            {
              y: "-50%",
              z: -250,
              rotationX: 45,
              scrollTrigger: {
                trigger: cardEls[index + 1],
                start: "top 85%",
                end: "top -75%",
                scrub: true,
                pin: card,
                pinSpacing: false,
              },
            }
          );

          gsap.to(cardInner, {
            "--after-opacity": 1,
            scrollTrigger: {
              trigger: cardEls[index + 1],
              start: "top 75%",
              end: "top -25%",
              scrub: true,
            },
          });
        }
      });
    },
    { scope: container }
  );

  return (
    <div
      className={`scf-sticky-cards ${className ?? ""}`.trim()}
      ref={container}
    >
      {cards.map((card, index) => (
        <div className="scf-card" key={index}>
          <div
            className="scf-card-inner"
            style={
              card.accentColor
                ? ({ "--scf-accent": card.accentColor } as React.CSSProperties)
                : undefined
            }
          >
            <div className="scf-card-info">
              <p>{card.info}</p>
            </div>
            <div className="scf-card-title">
              <h1>{card.title}</h1>
            </div>
            <div className="scf-card-description">
              <p>{card.description}</p>
            </div>
            <div className="scf-card-img">
              <img alt={card.title} src={card.image} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StickyCardsFold;
