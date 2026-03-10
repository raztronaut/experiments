"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { useGSAPDebug } from "@/hooks/useGSAPDebug";
import { PRELOADER_CONTENT } from "../data";
import { usePrefersReducedMotion } from "../hooks";

gsap.registerPlugin(CustomEase, SplitText);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

interface PreloaderSectionProps {
  onComplete: () => void;
}

export function PreloaderSection({ onComplete }: PreloaderSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const counterContainerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLHeadingElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAPDebug(tlRef.current, "preloader");

  useGSAP(
    () => {
      const section = sectionRef.current;
      const counterEl = counterRef.current;
      const counterContainer = counterContainerRef.current;
      const header = headerRef.current;
      const nav = navRef.current;
      const footer = footerRef.current;

      if (
        !(section && counterEl && counterContainer && header && nav && footer)
      ) {
        return;
      }

      if (reducedMotion) {
        gsap.set(counterContainerRef.current, { autoAlpha: 0 });
        gsap.set(heroBgRef.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        });
        gsap.set(heroImgRef.current, { scale: 1 });
        gsap.set(progressBarRef.current, { scaleX: 1 });
        gsap.set(progressFillRef.current, { scaleX: 1 });
        onComplete();
        return;
      }

      const headerSplit = SplitText.create(header.querySelector("h1")!, {
        type: "chars",
        charsClass: "preloader-char",
        mask: "chars",
      });

      const navSplit = SplitText.create(nav.querySelectorAll("a"), {
        type: "words",
        wordsClass: "preloader-word",
        mask: "words",
      });

      const footerSplit = SplitText.create(footer.querySelectorAll("p"), {
        type: "words",
        wordsClass: "preloader-word",
        mask: "words",
      });

      gsap.set(headerSplit.chars, { x: "50%", clipPath: "inset(0 100% 0 0)" });
      gsap.set([...navSplit.words, ...footerSplit.words], {
        y: "100%",
        clipPath: "inset(0 0 100% 0)",
      });

      const counter = { value: 0 };
      const tl = gsap.timeline({ id: "preloader" });
      tlRef.current = tl;

      tl.to(counter, {
        value: 100,
        duration: 3,
        ease: "power3.out",
        onUpdate: () => {
          if (counterEl) {
            counterEl.textContent = String(Math.floor(counter.value));
          }
        },
        onComplete: () => {
          if (!(counterEl && counterContainer)) {
            return;
          }
          const digitSplit = SplitText.create(counterEl, {
            type: "chars",
            charsClass: "preloader-digit",
            mask: "chars",
          });
          gsap.to(digitSplit.chars, {
            x: "-100%",
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.1,
            delay: 1,
            onComplete: () => {
              gsap.set(counterContainerRef.current, { autoAlpha: 0 });
            },
          });
        },
      });

      tl.to(
        counterContainer,
        { scale: 1, duration: 3, ease: "power3.out" },
        "<"
      );
      tl.to(
        progressBarRef.current,
        { scaleX: 1, duration: 3, ease: "power3.out" },
        "<"
      );

      tl.to(
        heroBgRef.current,
        {
          clipPath: "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)",
          duration: 1.5,
          ease: "hop",
        },
        4.5
      );

      tl.to(
        heroImgRef.current,
        { scale: 1.5, duration: 1.5, ease: "hop" },
        "<"
      );

      tl.to(
        heroBgRef.current,
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 2,
          ease: "hop",
        },
        6
      );

      tl.to(heroImgRef.current, { scale: 1, duration: 2, ease: "hop" }, 6);
      tl.to(
        progressFillRef.current,
        { scaleX: 1, duration: 2, ease: "hop" },
        6
      );

      tl.to(
        headerSplit.chars,
        {
          x: "0%",
          clipPath: "inset(0 0% 0 0)",
          duration: 1,
          ease: "power4.out",
          stagger: 0.075,
        },
        7
      );

      tl.to(
        [...navSplit.words, ...footerSplit.words],
        {
          y: "0%",
          clipPath: "inset(0 0 0% 0)",
          duration: 1,
          ease: "power4.out",
          stagger: 0.075,
          onComplete,
        },
        7.5
      );
    },
    { scope: sectionRef }
  );

  return (
    <>
      <div className="preloader-counter" ref={counterContainerRef}>
        <h1 ref={counterRef}>0</h1>
      </div>

      <section aria-label="Hero" className="preloader-hero" ref={sectionRef}>
        <nav className="preloader-nav" ref={navRef}>
          <div className="preloader-nav-logo">
            <a href="/">{PRELOADER_CONTENT.logo}</a>
          </div>
          <div className="preloader-nav-links">
            {PRELOADER_CONTENT.navLinks.map((link) => (
              <span key={link} role="link" tabIndex={0}>
                {link}
              </span>
            ))}
          </div>
        </nav>

        <div className="preloader-hero-bg" ref={heroBgRef}>
          <img alt="" ref={heroImgRef} src={PRELOADER_CONTENT.heroImage} />
        </div>

        <div className="preloader-header" ref={headerRef}>
          <h1>{PRELOADER_CONTENT.header}</h1>
        </div>

        <div className="preloader-hero-footer" ref={footerRef}>
          {PRELOADER_CONTENT.footerItems.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>

        <div className="preloader-progress-bar" ref={progressBarRef}>
          <div className="preloader-progress" ref={progressFillRef} />
        </div>
      </section>

      <style>{`
        .preloader-counter {
          position: fixed;
          top: 50svh;
          left: 2rem;
          transform: translateY(-50%) scale(0.25);
          transform-origin: left bottom;
          will-change: transform;
          z-index: 52;
        }
        .preloader-counter h1 {
          font-size: clamp(2.5rem, 25vw, 25rem);
          font-family: "DM Sans", sans-serif;
          font-weight: bold;
          line-height: 1;
          color: #fff;
        }

        .preloader-hero {
          position: relative;
          width: 100%;
          height: 100svh;
          overflow: hidden;
          background-color: #0f0f0f;
          color: #fff;
        }

        .preloader-nav {
          position: fixed;
          width: 100%;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          z-index: 51;
        }
        .preloader-nav a {
          text-decoration: none;
          color: #fff;
          font-family: "DM Sans", sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          line-height: 1;
        }
        .preloader-nav-links {
          display: flex;
          gap: 2rem;
        }

        .preloader-hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
          -webkit-clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
          will-change: clip-path, transform;
          z-index: 0;
        }
        .preloader-hero-bg img {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(2);
          width: 100%;
          height: 100%;
          object-fit: cover;
          will-change: transform;
        }

        .preloader-header {
          position: absolute;
          bottom: 4rem;
          width: 100%;
          padding: 0 2rem;
        }
        .preloader-header h1 {
          font-size: clamp(4rem, 12vw, 15rem);
          font-family: "Instrument Serif", serif;
          font-weight: 500;
          line-height: 1;
        }

        .preloader-hero-footer {
          position: absolute;
          bottom: 2rem;
          width: 100%;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .preloader-hero-footer p {
          font-family: "DM Sans", sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          line-height: 1;
          color: #fff;
        }

        .preloader-progress-bar {
          position: absolute;
          left: 2rem;
          bottom: 6rem;
          width: calc(100% - 4rem);
          height: 1.5px;
          background-color: #3a3a3a;
          transform-origin: left;
          transform: scaleX(0);
          will-change: transform;
          overflow: hidden;
        }
        .preloader-progress {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #fff;
          transform-origin: left;
          transform: scaleX(0);
          will-change: transform;
        }

        .preloader-char,
        .preloader-word,
        .preloader-digit {
          position: relative;
          will-change: transform, clip-path;
        }

        @media (max-width: 1000px) {
          .preloader-nav-links {
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
          }
          .preloader-header {
            bottom: unset;
            top: 50svh;
            display: flex;
            justify-content: center;
            transform: translateY(-50%);
          }
          .preloader-header h1 {
            font-size: 4rem;
          }
        }
      `}</style>
    </>
  );
}
