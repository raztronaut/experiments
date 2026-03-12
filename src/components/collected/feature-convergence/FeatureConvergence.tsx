"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

export interface FeatureItem {
  label: string;
  startLeft: number;
  startTop: number;
}

export interface FeatureConvergenceProps {
  className?: string;
  features?: FeatureItem[];
  headerDescription?: string;
  headerText?: string;
  searchPlaceholder?: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
  { label: "Flow", startTop: 25, startLeft: 15 },
  { label: "Knowledge Grid", startTop: 12.5, startLeft: 50 },
  { label: "Relay", startTop: 22.5, startLeft: 75 },
  { label: "Adaptive Layer", startTop: 30, startLeft: 82.5 },
  { label: "Signal", startTop: 50, startLeft: 20 },
  { label: "System Design", startTop: 80, startLeft: 20 },
  { label: "Archive", startTop: 75, startLeft: 75 },
];

export function FeatureConvergence({
  features = DEFAULT_FEATURES,
  headerText = "Find what matters through intelligent design",
  headerDescription = "Discover a system that adapts to the way you think, not the other way around.",
  searchPlaceholder = "Find the unseen link",
  className,
}: FeatureConvergenceProps) {
  const container = useRef<HTMLDivElement>(null);
  const [startDimensions, setStartDimensions] = useState<
    Array<{ width: number; height: number }>
  >([]);

  useEffect(() => {
    const scope = container.current;
    if (!scope) {
      return;
    }
    const bgs = scope.querySelectorAll<HTMLElement>(".fconv-feature-bg");
    const dims = Array.from(bgs).map((bg) => {
      const rect = bg.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    setStartDimensions(dims);
    // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure DOM when feature count changes
  }, [features.length]);

  useGSAP(
    () => {
      if (startDimensions.length === 0) {
        return;
      }

      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      if (prefersReduced) {
        return;
      }

      const scope = container.current!;
      const featureEls = gsap.utils.toArray<HTMLElement>(".fconv-feature");
      const featureBgs = gsap.utils.toArray<HTMLElement>(".fconv-feature-bg");

      featureEls.forEach((el, i) => {
        const f = features[i];
        if (f) {
          gsap.set(el, { top: `${f.startTop}%`, left: `${f.startLeft}%` });
        }
      });

      const rem = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      const targetSize = 3 * rem;
      const getSearchWidth = () => (window.innerWidth < 1000 ? 20 : 25);
      let searchBarWidth = getSearchWidth();

      const onResize = () => {
        searchBarWidth = getSearchWidth();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize);

      ScrollTrigger.create({
        trigger: ".fconv-spotlight",
        start: "top top",
        end: `+=${window.innerHeight * 3}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;

          if (p <= 0.3333) {
            gsap.set(".fconv-spotlight-content", {
              y: `${-100 * (p / 0.3333)}%`,
            });
          } else {
            gsap.set(".fconv-spotlight-content", { y: "-100%" });
          }

          if (p <= 0.5) {
            const fp = p / 0.5;
            featureEls.forEach((el, i) => {
              const f = features[i];
              if (!f) {
                return;
              }
              gsap.set(el, {
                top: `${f.startTop + (50 - f.startTop) * fp}%`,
                left: `${f.startLeft + (50 - f.startLeft) * fp}%`,
              });
            });

            featureBgs.forEach((bg, i) => {
              const dim = startDimensions[i];
              if (!dim) {
                return;
              }
              gsap.set(bg, {
                width: `${dim.width + (targetSize - dim.width) * fp}px`,
                height: `${dim.height + (targetSize - dim.height) * fp}px`,
                borderRadius: `${0.5 + (25 - 0.5) * fp}rem`,
                borderWidth: `${0.125 + (0.35 - 0.125) * fp}rem`,
              });
            });

            gsap.set(".fconv-feature-content", {
              opacity: p <= 0.1 ? 1 - p / 0.1 : 0,
            });
          }

          gsap.set(".fconv-features", { opacity: p >= 0.5 ? 0 : 1 });
          gsap.set(".fconv-search-bar", { opacity: p >= 0.5 ? 1 : 0 });

          if (p >= 0.5 && p <= 0.75) {
            const sp = (p - 0.5) / 0.25;
            gsap.set(".fconv-search-bar", {
              width: `${3 + (searchBarWidth - 3) * sp}rem`,
              height: `${3 + 2 * sp}rem`,
              transform: `translate(-50%, ${-50 + 250 * sp}%)`,
            });
            gsap.set(".fconv-search-bar p", { opacity: 0 });
          } else if (p > 0.75) {
            gsap.set(".fconv-search-bar", {
              width: `${searchBarWidth}rem`,
              height: "5rem",
              transform: "translate(-50%, 200%)",
            });
          }

          if (p >= 0.75) {
            const hp = (p - 0.75) / 0.25;
            gsap.set(".fconv-search-bar p", { opacity: hp });
            gsap.set(".fconv-header-content", {
              y: -50 + 50 * hp,
              opacity: hp,
            });
          } else {
            gsap.set(".fconv-search-bar p", { opacity: 0 });
            gsap.set(".fconv-header-content", { y: -50, opacity: 0 });
          }
        },
      });

      return () => {
        window.removeEventListener("resize", onResize);
      };
    },
    { scope: container, dependencies: [startDimensions] }
  );

  return (
    <div
      className={`fconv-container ${className ?? ""}`.trim()}
      ref={container}
    >
      <section className="fconv-spotlight">
        <div className="fconv-spotlight-content">
          <h1>Information flows best through intentional design</h1>
        </div>

        <div className="fconv-header">
          <div className="fconv-header-content">
            <h1>{headerText}</h1>
            <p>{headerDescription}</p>
          </div>
        </div>

        <div className="fconv-features">
          {features.map((f, i) => (
            <div className="fconv-feature" key={i}>
              <div className="fconv-feature-bg" />
              <div className="fconv-feature-content">
                <p>{f.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="fconv-search-bar">
          <p>{searchPlaceholder}</p>
        </div>
      </section>
    </div>
  );
}

export default FeatureConvergence;
