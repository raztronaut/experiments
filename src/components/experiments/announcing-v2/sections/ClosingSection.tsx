"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { forwardRef, useCallback, useRef } from "react";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { ExperimentGridPreview } from "../components/ExperimentGridPreview";
import { CLOSING } from "../data";
import { usePrefersReducedMotion } from "../hooks";

export const ClosingSection = forwardRef<HTMLElement>(
  function ClosingSection(_, ref) {
    const sectionRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLAnchorElement>(null);
    const xTo = useRef<gsap.QuickToFunc | null>(null);
    const yTo = useRef<gsap.QuickToFunc | null>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    const combinedRef = (el: HTMLElement | null) => {
      sectionRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      }
    };

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (!ctaRef.current || prefersReducedMotion) {
          return;
        }
        const rect = ctaRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
        xTo.current?.(x);
        yTo.current?.(y);
      },
      [prefersReducedMotion]
    );

    const handleMouseLeave = useCallback(() => {
      if (prefersReducedMotion) {
        return;
      }
      xTo.current?.(0);
      yTo.current?.(0);
    }, [prefersReducedMotion]);

    useGSAP(
      () => {
        if (!sectionRef.current) {
          return;
        }

        // Heading — clipPath reveal from bottom
        const headingText =
          sectionRef.current.querySelector<HTMLElement>(".close-heading h2");
        const headingRule =
          sectionRef.current.querySelector<HTMLElement>(".close-rule");
        const cta =
          sectionRef.current.querySelector<HTMLElement>(".cta-button");

        if (prefersReducedMotion) {
          gsap.set(headingText, {
            clearProps: "all",
            clipPath: "none",
            y: 0,
          });
          gsap.set(headingRule, { clearProps: "all", scaleX: 1 });
          gsap.set(cta, { clearProps: "all", opacity: 1, y: 0 });
          return;
        }

        if (headingText) {
          gsap.fromTo(
            headingText,
            { clipPath: "inset(0 0 100% 0)", y: 20 },
            {
              clipPath: "inset(0 0 0% 0)",
              y: 0,
              ease: "expo.out",
              duration: 1.5,
              scrollTrigger: {
                trigger: headingText,
                start: "top 85%",
              },
            }
          );
        }

        if (headingRule) {
          gsap.fromTo(
            headingRule,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: headingRule,
                start: "top 85%",
                end: "top 60%",
                scrub: 1,
              },
            }
          );
        }

        // CTA button
        if (cta) {
          gsap.fromTo(
            cta,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "back.out(1.5)",
              scrollTrigger: {
                trigger: cta,
                start: "top 85%",
              },
            }
          );
        }

        // Magnetic button via GSAP quickTo (no React re-renders)
        if (ctaRef.current) {
          xTo.current = gsap.quickTo(ctaRef.current, "x", {
            duration: 0.4,
            ease: "power3",
          });
          yTo.current = gsap.quickTo(ctaRef.current, "y", {
            duration: 0.4,
            ease: "power3",
          });
        }
      },
      { scope: sectionRef, dependencies: [prefersReducedMotion] }
    );

    return (
      <section
        aria-label="Closing"
        className="relative min-h-screen px-[4vw] py-32"
        ref={combinedRef}
      >
        <GrainOverlay className="z-10 opacity-[0.04]" />

        <div className="relative z-20 mx-auto w-full">
          {/* Section Indicator */}
          <div className="mb-20 flex items-center gap-4">
            <div className="h-px w-16 bg-[#ff003c]" />
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
              End of Transmission
            </span>
          </div>

          {/* Heading - Asymmetric Left */}
          <div className="close-heading mb-24 max-w-4xl">
            <h2
              className={cn(
                "font-medium text-[clamp(4rem,12vw,12rem)] text-white uppercase leading-[0.8] tracking-[-0.04em]",
                activeFont.variable
              )}
            >
              <span className="text-white/40 italic">Open</span>
              <br />
              Source.
            </h2>
            <div className="close-rule mt-12 h-px w-full origin-left bg-gradient-to-r from-[#4dff88]/40 to-transparent" />
          </div>

          {/* Experiment grid */}
          <ExperimentGridPreview />

          {/* CTA & Footer Split */}
          <div className="mt-32 grid items-end gap-12 border-white/10 border-t pt-16 lg:grid-cols-2">
            {/* Left: Footer Metadata */}
            <div className="flex flex-col gap-4">
              <span className="font-mono font-semibold text-[#4dff88] text-[11px] uppercase tracking-[0.3em]">
                [ SYSTEM STATUS: ONLINE ]
              </span>
              <span className="max-w-sm font-canvas text-sm text-white/40 leading-relaxed">
                Built with the v2 platform architecture. Leveraging Lenis for
                scroll mapping, Tempus for unified RAF cycles, GSAP for
                properties, and R3F for WebGL context.
              </span>
            </div>

            {/* Right: CTA Button */}
            <div className="flex lg:justify-end">
              <Link
                className="cta-button group relative inline-flex items-center gap-6 rounded-none bg-white px-8 py-6 font-bold font-mono text-black text-xs uppercase tracking-[0.2em] transition-transform duration-300 hover:scale-[1.02]"
                href={CLOSING.ctaHref}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                ref={ctaRef}
              >
                {CLOSING.cta}
                <span className="inline-block text-[#ff003c] transition-transform duration-300 group-hover:translate-x-2">
                  &rarr;
                </span>

                {/* Decorative cut corner */}
                <div
                  className="absolute top-0 right-0 h-3 w-3 bg-[#0a0a0c]"
                  style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
