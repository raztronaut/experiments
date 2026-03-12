"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
// biome-ignore lint: GSAP Flip.d.ts casing conflict on case-insensitive macOS
// @ts-ignore
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import "./styles.css";

gsap.registerPlugin(Flip, SplitText);

export interface CounterFlipRevealProps {
  className?: string;
  description?: string;
  headerText?: string;
  images?: string[];
  onComplete?: () => void;
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
    }?w=400&q=80`
);

function buildDigitColumn(count: number): number[] {
  const digits: number[] = [];
  for (let i = 0; i < count; i++) {
    digits.push(i % 10);
  }
  digits.push(0);
  return digits;
}

export function CounterFlipReveal({
  images = DEFAULT_IMAGES,
  headerText = "Visual engineering for modern brands",
  description = "A design team focused on brands, websites, apps and products. Award-winning creative studio operating since 2019.",
  onComplete,
  className,
}: CounterFlipRevealProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = container.current!;
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced) {
        gsap.set(".cfr-bg", { scaleY: 1 });
        gsap.set(".cfr-img", { scale: 1 });
        gsap.set(".cfr-counter", { autoAlpha: 0 });
        onComplete?.();
        return;
      }

      const headerEl = scope.querySelector<HTMLElement>(".cfr-header h1");
      const descEl = scope.querySelector<HTMLElement>(".cfr-description p");
      if (!(headerEl && descEl)) {
        return;
      }

      const headerSplit = SplitText.create(headerEl, {
        type: "lines",
        linesClass: "cfr-line",
      });
      for (const line of headerSplit.lines) {
        const text = (line as HTMLElement).textContent;
        (line as HTMLElement).innerHTML = `<span>${text}</span>`;
      }

      const descSplit = SplitText.create(descEl, {
        type: "lines",
        linesClass: "cfr-line",
      });
      for (const line of descSplit.lines) {
        const text = (line as HTMLElement).textContent;
        (line as HTMLElement).innerHTML = `<span>${text}</span>`;
      }

      gsap.set(".cfr-line span", { y: "125%" });
      gsap.set(".cfr-img", { scale: 0 });

      const animateDigit = (selector: string, duration: number, delay = 0) => {
        const el = scope.querySelector(selector)!;
        const numH = el.querySelector<HTMLElement>(".cfr-num")!.clientHeight;
        const total = (el.querySelectorAll(".cfr-num").length - 1) * numH;
        gsap.to(el, { y: -total, duration, delay, ease: "power2.inOut" });
      };

      animateDigit(".cfr-counter-3", 2.5);
      animateDigit(".cfr-counter-2", 3);
      animateDigit(".cfr-counter-1", 2, 1.5);

      const tl = gsap.timeline({ onComplete });

      tl.to(".cfr-bg", {
        scaleY: 1,
        duration: 3,
        ease: "power2.inOut",
        delay: 0.25,
      });

      tl.to(
        ".cfr-img",
        { scale: 1, duration: 1, stagger: 0.125, ease: "power3.out" },
        "<"
      );

      tl.to(".cfr-counter", {
        opacity: 0,
        duration: 0.3,
        ease: "power3.out",
        delay: 0.3,
        onStart: () => {
          const imgEls = gsap.utils.toArray<HTMLElement>(".cfr-img", scope);
          imgEls.forEach((el) => el.classList.remove("cfr-img-end"));
          const state = Flip.getState(imgEls);
          imgEls.forEach((el) => el.classList.add("cfr-img-end"));

          const flipTl = Flip.from(state, {
            duration: 1,
            stagger: 0.1,
            ease: "power3.inOut",
          });

          imgEls.forEach((img, index) => {
            const scaleTl = gsap.timeline();
            scaleTl.to(img, {
              scale: 2.5,
              duration: 0.45,
              ease: "power3.in",
            });
            scaleTl.to(
              img,
              { scale: 1, duration: 0.45, ease: "power3.out" },
              0.5
            );
            flipTl.add(scaleTl, index * 0.1);
          });
        },
      });

      tl.to(".cfr-line span", {
        y: "0%",
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
        delay: 1.5,
      });
    },
    { scope: container }
  );

  const counter1 = [0, 1];
  const counter2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const counter3 = buildDigitColumn(30);

  return (
    <div className={`cfr-container ${className ?? ""}`.trim()} ref={container}>
      <div className="cfr-bg" />

      <div className="cfr-counter">
        <div className="cfr-digit cfr-counter-1">
          {counter1.map((n, i) => (
            <div
              className={`cfr-num ${n === 1 ? "cfr-num-offset" : ""}`.trim()}
              key={i}
            >
              {n}
            </div>
          ))}
        </div>
        <div className="cfr-digit cfr-counter-2">
          {counter2.map((n, i) => (
            <div className="cfr-num" key={i}>
              {n}
            </div>
          ))}
        </div>
        <div className="cfr-digit cfr-counter-3">
          {counter3.map((n, i) => (
            <div className="cfr-num" key={i}>
              {n}
            </div>
          ))}
        </div>
      </div>

      <div className="cfr-images">
        {images.map((img, i) => (
          <div className="cfr-img" key={i}>
            <img alt="" src={img} />
          </div>
        ))}
      </div>

      <div className="cfr-content">
        <div className="cfr-header">
          <h1>{headerText}</h1>
        </div>
        <div className="cfr-description">
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default CounterFlipReveal;
