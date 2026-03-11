"use client";

import { useRef } from "react";
import { useDevControls } from "@/hooks/useDevControls";
import { INVERSA_CONTENT } from "../data";
import { usePrefersReducedMotion } from "../hooks";
import { useInversaScroll } from "../hooks/useInversaScroll";
import "./inversa-section.css";

const BLOCK_COUNT = 1 + INVERSA_CONTENT.blocks.length;

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

  useInversaScroll(
    {
      container: containerRef,
      heroContent: heroContentRef,
      heroImg: heroImgRef,
      heroImgElement: heroImgElementRef,
      heroMask: heroMaskRef,
      heroGridOverlay: heroGridOverlayRef,
      marker1: marker1Ref,
      marker2: marker2Ref,
      progressBar: progressBarRef,
    },
    scrollParams,
    BLOCK_COUNT,
    reducedMotion
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

        <div
          className="inversa-hero-content"
          ref={heroContentRef}
          style={{ height: `${BLOCK_COUNT * 100}svh` }}
        >
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
    </div>
  );
}
