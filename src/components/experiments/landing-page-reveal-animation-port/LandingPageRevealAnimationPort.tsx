"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useEffect, useRef, useState } from "react";
import {
  BRAND,
  CLIP_PATHS,
  FOOTER_WORDS,
  HOP_EASE,
  NAV_LINKS,
  TIMING,
} from "./data";
import "./styles.css";

gsap.registerPlugin(CustomEase, SplitText);
CustomEase.create("hop", HOP_EASE);

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export default function LandingPageRevealAnimationPort() {
  const containerRef = useRef<HTMLDivElement>(null);
  const counterContainerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLHeadingElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const headerH1Ref = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const heroFooterRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setReady(true));
  }, []);

  useGSAP(
    () => {
      if (!ready) {
        return;
      }

      const counterEl = counterRef.current;
      const counterContainer = counterContainerRef.current;
      const heroBg = heroBgRef.current;
      const heroImg = heroImgRef.current;
      const progressBar = progressBarRef.current;
      const progressFill = progressFillRef.current;
      const headerH1 = headerH1Ref.current;
      const nav = navRef.current;
      const heroFooter = heroFooterRef.current;

      if (
        !(
          counterEl &&
          counterContainer &&
          heroBg &&
          heroImg &&
          progressBar &&
          progressFill &&
          headerH1 &&
          nav &&
          heroFooter
        )
      ) {
        return;
      }

      const headerSplit = SplitText.create(headerH1, {
        type: "chars",
        charsClass: "char",
        mask: "chars",
      });

      const navSplit = SplitText.create(nav.querySelectorAll("a"), {
        type: "words",
        wordsClass: "word",
        mask: "words",
      });

      const footerSplit = SplitText.create(heroFooter.querySelectorAll("p"), {
        type: "words",
        wordsClass: "word",
        mask: "words",
      });

      if (prefersReducedMotion) {
        gsap.set(counterContainer, { display: "none" });
        gsap.set(heroBg, { clipPath: CLIP_PATHS.open });
        gsap.set(heroImg, { scale: 1 });
        gsap.set(progressBar, { scaleX: 1 });
        gsap.set(progressFill, { scaleX: 1 });
        gsap.set(headerSplit.chars, { x: "0%" });
        gsap.set([...navSplit.words, ...footerSplit.words], { y: "0%" });
        return;
      }

      const counter = { value: 0 };
      const tl = gsap.timeline();

      tl.to(counter, {
        value: 100,
        duration: TIMING.counterDuration,
        ease: "power3.out",
        onUpdate: () => {
          counterEl.textContent = String(Math.floor(counter.value));
        },
        onComplete: () => {
          const digitSplit = SplitText.create(counterEl, {
            type: "chars",
            charsClass: "digit",
            mask: "chars",
          });
          gsap.to(digitSplit.chars, {
            x: "-100%",
            duration: TIMING.counterDigitSlideDuration,
            ease: "power3.out",
            stagger: TIMING.counterDigitStagger,
            delay: TIMING.counterDigitSlideDelay,
            onComplete: () => {
              gsap.set(counterContainer, { display: "none" });
            },
          });
        },
      });

      tl.to(
        counterContainer,
        {
          scale: 1,
          duration: TIMING.counterScaleDuration,
          ease: "power3.out",
        },
        "<"
      );

      tl.to(
        progressBar,
        {
          scaleX: 1,
          duration: TIMING.progressBarDuration,
          ease: "power3.out",
        },
        "<"
      );

      tl.to(
        heroBg,
        {
          clipPath: CLIP_PATHS.partial,
          duration: TIMING.clipReveal1Duration,
          ease: "hop",
        },
        TIMING.clipReveal1Start
      );

      tl.to(
        heroImg,
        { scale: 1.5, duration: TIMING.clipReveal1Duration, ease: "hop" },
        "<"
      );

      tl.to(
        heroBg,
        {
          clipPath: CLIP_PATHS.open,
          duration: TIMING.clipReveal2Duration,
          ease: "hop",
        },
        TIMING.clipReveal2Start
      );

      tl.to(
        heroImg,
        { scale: 1, duration: TIMING.clipReveal2Duration, ease: "hop" },
        TIMING.clipReveal2Start
      );

      tl.to(
        progressFill,
        { scaleX: 1, duration: TIMING.progressRevealDuration, ease: "hop" },
        TIMING.clipReveal2Start
      );

      tl.to(
        headerSplit.chars,
        {
          x: "0%",
          duration: TIMING.charRevealDuration,
          ease: "power4.out",
          stagger: TIMING.charStagger,
        },
        TIMING.charRevealStart
      );

      tl.to(
        navSplit.words,
        {
          y: "0%",
          duration: TIMING.wordRevealDuration,
          ease: "power4.out",
          stagger: TIMING.wordStagger,
        },
        TIMING.wordRevealStart
      );

      tl.to(
        footerSplit.words,
        {
          y: "0%",
          duration: TIMING.wordRevealDuration,
          ease: "power4.out",
          stagger: TIMING.wordStagger,
        },
        TIMING.wordRevealStart
      );
    },
    { scope: containerRef, dependencies: [ready, prefersReducedMotion] }
  );

  return (
    <div className="lp-reveal-root" ref={containerRef}>
      <div className="lp-reveal-preloader-counter" ref={counterContainerRef}>
        <h1 ref={counterRef}>0</h1>
      </div>

      <nav className="lp-reveal-nav" ref={navRef}>
        <div className="lp-reveal-nav-logo">
          <a href="/">{BRAND.logo}</a>
        </div>
        <div className="lp-reveal-nav-links">
          {NAV_LINKS.map((link) => (
            <a href="/" key={link}>
              {link}
            </a>
          ))}
        </div>
      </nav>

      <section aria-label="Hero" className="lp-reveal-hero">
        <div className="lp-reveal-hero-bg" ref={heroBgRef}>
          <img
            alt=""
            ref={heroImgRef}
            src="/experiments/landing-page-reveal-animation-port/hero.jpg"
          />
        </div>

        <div className="lp-reveal-header">
          <h1 ref={headerH1Ref}>{BRAND.heading}</h1>
        </div>

        <div className="lp-reveal-hero-footer" ref={heroFooterRef}>
          {FOOTER_WORDS.map((word) => (
            <p key={word}>{word}</p>
          ))}
        </div>

        <div className="lp-reveal-progress-bar" ref={progressBarRef}>
          <div className="lp-reveal-progress" ref={progressFillRef} />
        </div>
      </section>
    </div>
  );
}
