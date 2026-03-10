"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useDevControls } from "@/hooks/useDevControls";
import { INVERSA_CONTENT } from "../data";
import { usePrefersReducedMotion } from "../hooks";

gsap.registerPlugin(ScrollTrigger);

const BLOCK_COUNT = 1 + INVERSA_CONTENT.blocks.length;

const ease = (x: number) => x * x * (3 - 2 * x);

export function InversaSection() {
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const heroImgElementRef = useRef<HTMLImageElement>(null);
  const heroMaskRef = useRef<HTMLDivElement>(null);
  const heroGridOverlayRef = useRef<HTMLDivElement>(null);
  const marker1Ref = useRef<HTMLDivElement>(null);
  const marker2Ref = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const scrollParams = useDevControls("Inversa Scroll", {
    maskScaleMax: { value: 2.5, min: 1, max: 5, step: 0.1 },
    maskScaleMin: { value: 1, min: 0.5, max: 3, step: 0.1 },
    desatStart: { value: 0.4, min: 0, max: 1, step: 0.01 },
    desatEnd: { value: 0.5, min: 0, max: 1, step: 0.01 },
    resatStart: { value: 0.75, min: 0, max: 1, step: 0.01 },
    resatEnd: { value: 0.85, min: 0, max: 1, step: 0.01 },
  });

  useGSAP(
    () => {
      const heroContent = heroContentRef.current;
      const heroImg = heroImgRef.current;
      const heroImgElement = heroImgElementRef.current;
      const heroMask = heroMaskRef.current;
      const heroGridOverlay = heroGridOverlayRef.current;
      const marker1 = marker1Ref.current;
      const marker2 = marker2Ref.current;
      const progressBar = progressBarRef.current;

      if (
        !(
          heroContent &&
          heroImg &&
          heroImgElement &&
          heroMask &&
          heroGridOverlay &&
          marker1 &&
          marker2 &&
          progressBar
        )
      ) {
        return;
      }

      const heroContentHeight = heroContent.offsetHeight;
      const viewportHeight = window.innerHeight;
      const heroContentMoveDistance = heroContentHeight - viewportHeight;

      const heroImgHeight = heroImg.offsetHeight;
      const heroImgMoveDistance = heroImgHeight - viewportHeight;

      if (reducedMotion) {
        gsap.set(heroMask, { scale: 2.5 });
        gsap.set(heroImgElement, { filter: "saturate(1)" });
        gsap.set(heroImg, { "--overlay-opacity": 0.35 });
        gsap.set(heroGridOverlay, { opacity: 0 });
        gsap.set(marker1, { opacity: 0 });
        gsap.set(marker2, { opacity: 0 });
        return;
      }

      ScrollTrigger.create({
        trigger: ".inversa-hero",
        start: "top top",
        end: `+=${window.innerHeight * BLOCK_COUNT}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          gsap.set(progressBar, { "--progress": self.progress });

          gsap.set(heroContent, {
            y: -self.progress * heroContentMoveDistance,
          });

          let heroImgProgress: number;
          if (self.progress <= 0.45) {
            heroImgProgress = ease(self.progress / 0.45) * 0.65;
          } else if (self.progress <= 0.75) {
            heroImgProgress = 0.65;
          } else {
            heroImgProgress = 0.65 + ease((self.progress - 0.75) / 0.25) * 0.35;
          }

          gsap.set(heroImg, { y: heroImgProgress * heroImgMoveDistance });

          let heroMaskScale: number;
          let heroImgSaturation: number;
          let heroImgOverlayOpacity: number;

          const {
            maskScaleMax,
            maskScaleMin,
            desatStart,
            desatEnd,
            resatStart,
            resatEnd,
          } = scrollParams;
          const scaleDelta = maskScaleMax - maskScaleMin;
          const desatDuration = desatEnd - desatStart;
          const resatDuration = resatEnd - resatStart;

          if (self.progress <= desatStart) {
            heroMaskScale = maskScaleMax;
            heroImgSaturation = 1;
            heroImgOverlayOpacity = 0.35;
          } else if (self.progress <= desatEnd) {
            const phaseProgress = ease(
              (self.progress - desatStart) / desatDuration
            );
            heroMaskScale = maskScaleMax - phaseProgress * scaleDelta;
            heroImgSaturation = 1 - phaseProgress;
            heroImgOverlayOpacity = 0.35 + phaseProgress * 0.35;
          } else if (self.progress <= resatStart) {
            heroMaskScale = maskScaleMin;
            heroImgSaturation = 0;
            heroImgOverlayOpacity = 0.7;
          } else if (self.progress <= resatEnd) {
            const phaseProgress = ease(
              (self.progress - resatStart) / resatDuration
            );
            heroMaskScale = maskScaleMin + phaseProgress * scaleDelta;
            heroImgSaturation = phaseProgress;
            heroImgOverlayOpacity = 0.7 - phaseProgress * 0.35;
          } else {
            heroMaskScale = maskScaleMax;
            heroImgSaturation = 1;
            heroImgOverlayOpacity = 0.35;
          }

          gsap.set(heroMask, { scale: heroMaskScale });
          gsap.set(heroImgElement, {
            filter: `saturate(${heroImgSaturation})`,
          });
          gsap.set(heroImg, { "--overlay-opacity": heroImgOverlayOpacity });

          let heroGridOpacity: number;
          if (self.progress <= 0.475) {
            heroGridOpacity = 0;
          } else if (self.progress <= 0.5) {
            heroGridOpacity = ease((self.progress - 0.475) / 0.025);
          } else if (self.progress <= 0.75) {
            heroGridOpacity = 1;
          } else if (self.progress <= 0.775) {
            heroGridOpacity = 1 - ease((self.progress - 0.75) / 0.025);
          } else {
            heroGridOpacity = 0;
          }

          gsap.set(heroGridOverlay, { opacity: heroGridOpacity });

          let marker1Opacity: number;
          if (self.progress <= 0.5) {
            marker1Opacity = 0;
          } else if (self.progress <= 0.525) {
            marker1Opacity = ease((self.progress - 0.5) / 0.025);
          } else if (self.progress <= 0.7) {
            marker1Opacity = 1;
          } else if (self.progress <= 0.75) {
            marker1Opacity = 1 - ease((self.progress - 0.7) / 0.05);
          } else {
            marker1Opacity = 0;
          }

          gsap.set(marker1, { opacity: marker1Opacity });

          let marker2Opacity: number;
          if (self.progress <= 0.55) {
            marker2Opacity = 0;
          } else if (self.progress <= 0.575) {
            marker2Opacity = ease((self.progress - 0.55) / 0.025);
          } else if (self.progress <= 0.7) {
            marker2Opacity = 1;
          } else if (self.progress <= 0.75) {
            marker2Opacity = 1 - ease((self.progress - 0.7) / 0.05);
          } else {
            marker2Opacity = 0;
          }

          gsap.set(marker2, { opacity: marker2Opacity });
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <section className="inversa-hero">
        <div className="inversa-hero-img" ref={heroImgRef}>
          <img
            alt=""
            ref={heroImgElementRef}
            src="/experiments/announcing-v2/inversa-hero-img.jpg"
          />
        </div>

        <div className="inversa-hero-mask" ref={heroMaskRef} />

        <div className="inversa-hero-grid-overlay" ref={heroGridOverlayRef}>
          <img alt="" src="/experiments/announcing-v2/grid-overlay.svg" />
        </div>

        <div className="inversa-marker inversa-marker-1" ref={marker1Ref}>
          <span className="inversa-marker-icon" />
          <p className="inversa-marker-label">
            {INVERSA_CONTENT.markers[0].label}
          </p>
        </div>

        <div className="inversa-marker inversa-marker-2" ref={marker2Ref}>
          <span className="inversa-marker-icon" />
          <p className="inversa-marker-label">
            {INVERSA_CONTENT.markers[1].label}
          </p>
        </div>

        <div className="inversa-hero-content" ref={heroContentRef}>
          <div className="inversa-hero-content-block">
            <div className="inversa-hero-content-copy">
              <h1>{INVERSA_CONTENT.title}</h1>
            </div>
          </div>
          {INVERSA_CONTENT.blocks.map((block, i) => (
            <div className="inversa-hero-content-block" key={i}>
              <div className="inversa-hero-content-copy">
                <h2>{block.heading}</h2>
                <p>{block.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="inversa-hero-scroll-progress-bar"
          ref={progressBarRef}
        />
      </section>

      <section className="inversa-outro">
        <p>{INVERSA_CONTENT.outroText}</p>
      </section>

      <style>{`
        .inversa-hero {
          position: relative;
          width: 100%;
          height: 100svh;
          background-color: #141414;
          overflow: hidden;
        }

        .inversa-hero-img {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 200svh;
          --overlay-opacity: 0.35;
          will-change: transform;
        }
        .inversa-hero-img::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #141414;
          opacity: var(--overlay-opacity);
          will-change: opacity;
        }
        .inversa-hero-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: filter;
        }

        .inversa-hero-mask {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100svh;
          background-color: #141414;
          mask: linear-gradient(#fff, #fff),
            url("/experiments/announcing-v2/mask.svg") center/50% no-repeat;
          -webkit-mask: linear-gradient(#fff, #fff),
            url("/experiments/announcing-v2/mask.svg") center/50% no-repeat;
          mask-composite: subtract;
          -webkit-mask-composite: subtract;
          will-change: transform;
          pointer-events: none;
        }

        .inversa-hero-grid-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 55%;
          will-change: opacity;
        }
        .inversa-hero-grid-overlay img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.25;
        }

        .inversa-marker {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          gap: 1rem;
          will-change: opacity;
        }
        .inversa-marker-1 {
          top: 50svh;
          left: 50vw;
        }
        .inversa-marker-2 {
          top: 35svh;
          left: 60vw;
        }

        .inversa-marker-label {
          text-transform: uppercase;
          font-family: "DM Mono", "IBM Plex Mono", monospace;
          font-size: 0.7rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }
        .inversa-marker-icon {
          position: relative;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 2rem;
        }
        .inversa-marker-icon::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10rem;
          height: 10rem;
          border-radius: 100%;
          animation: inversa-pulse 1.5s cubic-bezier(0.2, 0.6, 0.35, 1) infinite;
        }

        .inversa-marker-1 .inversa-marker-icon,
        .inversa-marker-1 .inversa-marker-icon::before,
        .inversa-marker-1 .inversa-marker-label {
          background-color: #dc5935;
          color: #fff;
        }
        .inversa-marker-2 .inversa-marker-icon,
        .inversa-marker-2 .inversa-marker-icon::before,
        .inversa-marker-2 .inversa-marker-label {
          background-color: #d3ef76;
          color: #141414;
        }

        @keyframes inversa-pulse {
          0% { transform: translate(-50%, -50%) scale(0.25); }
          80%, 100% { opacity: 0; }
        }

        .inversa-hero-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: ${BLOCK_COUNT * 100}svh;
          display: flex;
          flex-direction: column;
          will-change: transform;
        }
        .inversa-hero-content-block {
          width: 100%;
          height: 100svh;
          padding: 4rem;
          display: flex;
        }
        .inversa-hero-content-copy {
          width: 35%;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          color: #fff;
        }
        .inversa-hero-content-copy h1 {
          font-family: "DM Sans", sans-serif;
          font-size: clamp(3rem, 4vw, 5rem);
          font-weight: 400;
          line-height: 1.1;
        }
        .inversa-hero-content-copy h2 {
          font-family: "DM Sans", sans-serif;
          font-size: clamp(1.5rem, 2.25vw, 3rem);
          font-weight: 400;
          line-height: 1.1;
        }
        .inversa-hero-content-copy p {
          font-family: "DM Sans", sans-serif;
          font-size: 1.125rem;
          font-weight: 400;
          line-height: 1.4;
        }

        .inversa-hero-content-block:nth-child(1) {
          align-items: flex-end;
        }
        .inversa-hero-content-block:nth-child(2),
        .inversa-hero-content-block:nth-child(4) {
          justify-content: flex-end;
          align-items: center;
        }
        .inversa-hero-content-block:nth-child(3),
        .inversa-hero-content-block:nth-child(5) {
          align-items: center;
        }

        .inversa-hero-scroll-progress-bar {
          position: absolute;
          top: 50%;
          right: 2rem;
          transform: translateY(-50%);
          width: 0.1rem;
          height: 10rem;
          background-color: rgba(255, 255, 255, 0.2);
          --progress: 0;
        }
        .inversa-hero-scroll-progress-bar::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #fff;
          transform-origin: top;
          transform: scaleY(var(--progress));
          will-change: transform;
        }

        .inversa-outro {
          position: relative;
          width: 100%;
          height: 100svh;
          background-color: #141414;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          font-family: "DM Sans", sans-serif;
          font-size: 1.125rem;
        }

        @media (max-width: 800px) {
          .inversa-hero-mask {
            mask: linear-gradient(#fff, #fff),
              url("/experiments/announcing-v2/mask.svg") center/75% no-repeat;
            -webkit-mask: linear-gradient(#fff, #fff),
              url("/experiments/announcing-v2/mask.svg") center/75% no-repeat;
            mask-composite: subtract;
            -webkit-mask-composite: subtract;
          }
          .inversa-hero-grid-overlay {
            width: 100%;
          }
          .inversa-marker-1 {
            top: 52.5svh;
            left: 50vw;
          }
          .inversa-marker-2 {
            top: 45svh;
            left: 70vw;
          }
          .inversa-hero-content-block {
            padding: 1.5rem;
          }
          .inversa-hero-content-copy {
            width: 75%;
          }
          .inversa-hero-scroll-progress-bar {
            right: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
