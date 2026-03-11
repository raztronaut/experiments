"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import "./styles.css";

gsap.registerPlugin(SplitText);

export interface ClipPathRevealProps {
  className?: string;
  footerDescription?: string;
  footerHeading?: string;
  headerText?: string;
  heroImage?: string;
  logoText?: string;
  onComplete?: () => void;
  preloaderFooterText?: string;
}

export function ClipPathReveal({
  logoText = "Obsidian",
  heroImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80",
  headerText = "Obsidian",
  footerHeading = "Spaces defined through light and silence.",
  footerDescription = "Geometry and balance converge, creating environments that breathe with ease.",
  preloaderFooterText = "Spaces unfold in light and shadow, where structure finds its quiet rhythm, and time align in harmony.",
  onComplete,
  className,
}: ClipPathRevealProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = container.current!;
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced) {
        gsap.set(".cpr-preloader-progress", { autoAlpha: 0 });
        gsap.set(".cpr-preloader-mask", { autoAlpha: 0 });
        gsap.set(".cpr-hero-img", { scale: 1 });
        onComplete?.();
        return;
      }

      const logoEl = scope.querySelector<HTMLElement>(".cpr-preloader-logo h1");
      const preFooterEl = scope.querySelector<HTMLElement>(
        ".cpr-preloader-footer p"
      );
      const headerEl = scope.querySelector<HTMLElement>(".cpr-header h1");
      const footerH3 = scope.querySelector<HTMLElement>(".cpr-hero-footer h3");
      const footerP = scope.querySelector<HTMLElement>(".cpr-hero-footer p");

      if (!(logoEl && preFooterEl && headerEl && footerH3 && footerP)) {
        return;
      }

      const logoSplit = SplitText.create(logoEl, {
        type: "chars",
        charsClass: "cpr-char",
        mask: "chars",
      });
      const preFooterSplit = SplitText.create(preFooterEl, {
        type: "lines",
        linesClass: "cpr-line",
        mask: "lines",
      });
      const headerSplit = SplitText.create(headerEl, {
        type: "chars",
        charsClass: "cpr-char",
        mask: "chars",
      });
      const footerH3Split = SplitText.create(footerH3, {
        type: "lines",
        linesClass: "cpr-line",
        mask: "lines",
      });
      const footerPSplit = SplitText.create(footerP, {
        type: "lines",
        linesClass: "cpr-line",
        mask: "lines",
      });

      gsap.set(logoSplit.chars, { x: "100%" });
      gsap.set(
        [
          preFooterSplit.lines,
          headerSplit.chars,
          footerH3Split.lines,
          footerPSplit.lines,
        ],
        { y: "100%" }
      );

      function animateProgress(duration = 4) {
        const progressTl = gsap.timeline();
        let currentProgress = 0;
        const steps = 5;

        for (let i = 0; i < steps; i++) {
          const isFinal = i === steps - 1;
          const target = isFinal
            ? 1
            : Math.min(currentProgress + Math.random() * 0.3 + 0.1, 0.9);
          currentProgress = target;

          progressTl.to(".cpr-progress-bar", {
            scaleX: target,
            duration: duration / steps,
            ease: "power2.out",
          });
        }
        return progressTl;
      }

      const tl = gsap.timeline({ delay: 0.5, onComplete });

      tl.to(logoSplit.chars, {
        x: "0%",
        stagger: 0.05,
        duration: 1,
        ease: "power4.inOut",
      })
        .to(
          preFooterSplit.lines,
          { y: "0%", stagger: 0.1, duration: 1, ease: "power4.inOut" },
          "0.25"
        )
        .add(animateProgress(), "<")
        .set(".cpr-preloader-progress", { backgroundColor: "#fff" })
        .to(
          logoSplit.chars,
          {
            x: "-100%",
            stagger: 0.05,
            duration: 1,
            ease: "power4.inOut",
          },
          "-=0.5"
        )
        .to(
          preFooterSplit.lines,
          { y: "-100%", stagger: 0.1, duration: 1, ease: "power4.inOut" },
          "<"
        )
        .to(
          ".cpr-preloader-progress",
          { opacity: 0, duration: 0.5, ease: "power3.out" },
          "-=0.25"
        )
        .to(
          ".cpr-preloader-mask",
          { scale: 6, duration: 2.5, ease: "power3.out" },
          "<"
        )
        .to(
          ".cpr-hero-img",
          { scale: 1, duration: 1.5, ease: "power3.out" },
          "<"
        )
        .to(headerSplit.chars, {
          y: 0,
          stagger: 0.05,
          duration: 1,
          ease: "power4.out",
          delay: -2,
        })
        .to(
          [footerH3Split.lines, footerPSplit.lines],
          { y: 0, stagger: 0.1, duration: 1, ease: "power4.out" },
          "-=1.5"
        );
    },
    { scope: container }
  );

  return (
    <div className={`cpr-container ${className ?? ""}`.trim()} ref={container}>
      <div className="cpr-preloader-progress">
        <div className="cpr-progress-bar" />
        <div className="cpr-preloader-logo">
          <h1>{logoText}</h1>
        </div>
      </div>

      <div className="cpr-preloader-mask" />

      <div className="cpr-preloader-content">
        <div className="cpr-preloader-footer">
          <p>{preloaderFooterText}</p>
        </div>
      </div>

      <section className="cpr-hero">
        <div className="cpr-hero-inner">
          <div className="cpr-hero-img">
            <img alt="" src={heroImage} />
          </div>
          <div className="cpr-hero-content">
            <div className="cpr-header">
              <h1>{headerText}</h1>
            </div>
            <div className="cpr-hero-footer">
              <h3>{footerHeading}</h3>
              <p>{footerDescription}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ClipPathReveal;
