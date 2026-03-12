"use client";

import { useRef } from "react";
import { PRELOADER_CONTENT } from "../data";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { usePreloaderTimeline } from "../hooks/usePreloaderTimeline";
import "./preloader-section.css";

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
  const reducedMotion = usePrefersReducedMotion();

  usePreloaderTimeline(
    {
      section: sectionRef,
      counterContainer: counterContainerRef,
      counter: counterRef,
      heroBg: heroBgRef,
      heroImg: heroImgRef,
      progressBar: progressBarRef,
      progressFill: progressFillRef,
      header: headerRef,
      nav: navRef,
      footer: footerRef,
    },
    onComplete,
    reducedMotion
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
    </>
  );
}
