"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { forwardRef, useRef } from "react";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { MANIFESTO } from "../data";
import { usePrefersReducedMotion } from "../hooks";

export const ManifestoSection = forwardRef<HTMLElement>(
  function ManifestoSection(_, ref) {
    const sectionRef = useRef<HTMLElement>(null);
    const terminalRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    const combinedRef = (el: HTMLElement | null) => {
      sectionRef.current = el;
      if (typeof ref === "function") {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = el;
      }
    };

    useGSAP(
      () => {
        if (!sectionRef.current) {
          return;
        }

        const lines =
          sectionRef.current.querySelectorAll<HTMLElement>(".manifesto-line");
        const emphases = sectionRef.current.querySelectorAll<HTMLElement>(
          ".manifesto-emphasis"
        );
        const chars =
          terminalRef.current?.querySelectorAll<HTMLSpanElement>(
            ".term-char"
          ) ?? [];

        if (prefersReducedMotion) {
          gsap.set(lines, { clearProps: "all", clipPath: "none", y: 0 });
          gsap.set(emphases, { clearProps: "all", opacity: 1, x: 0 });
          gsap.set(chars, { clearProps: "all", opacity: 1 });
          gsap.set(terminalRef.current, { clearProps: "transform", y: 0 });
          return;
        }

        gsap.set(lines, {
          clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          y: 40,
        });
        gsap.set(emphases, { opacity: 0, x: -20 });

        lines.forEach((line, i) => {
          const emphasis = emphases[i];
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: line,
              start: "top 85%",
              end: "top 40%",
              scrub: 1,
            },
          });

          if (emphasis) {
            tl.to(emphasis, {
              opacity: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.out",
            });
          }
          tl.to(
            line,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              y: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            "-=0.1"
          );
        });

        // Terminal typing - Smooth but glitchy reveal
        if (terminalRef.current) {
          gsap.set(chars, { opacity: 0 });

          gsap.to(chars, {
            opacity: 1,
            duration: 0.01,
            stagger: 0.05, // slower stagger to read more clearly
            ease: "steps(1)",
            scrollTrigger: {
              trigger: terminalRef.current,
              start: "top 75%",
              end: "top 35%",
              scrub: 1,
            },
          });
        }

        // Parallax the terminal
        gsap.to(terminalRef.current, {
          y: -100,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      },
      { scope: sectionRef, dependencies: [prefersReducedMotion] }
    );

    const commandChars = MANIFESTO.command.split("");

    return (
      <section
        aria-label="Manifesto"
        className="relative mt-32 min-h-[120vh] px-[4vw] py-32"
        ref={combinedRef}
      >
        <div className="relative mx-auto w-full">
          {/* Asymmetrical Heading */}
          <div className="mb-24 flex w-full justify-start">
            <h2
              className={cn(
                "font-medium text-[clamp(3rem,10vw,12rem)] text-white/90 uppercase leading-[0.8] tracking-[-0.03em]",
                activeFont.variable
              )}
            >
              Mani
              <br />
              <span className="ml-[15vw] text-[#ff003c] italic">festo.</span>
            </h2>
          </div>

          <div className="relative z-10 grid gap-24 lg:grid-cols-12">
            {/* Left/Offset: Editorial text */}
            <div className="flex flex-col justify-center space-y-24 lg:col-span-6 lg:col-start-2">
              {MANIFESTO.lines.map((line, i) => (
                <div className="group relative" key={i}>
                  <span className="manifesto-emphasis absolute top-2 -left-6 origin-left rotate-[-90deg] whitespace-nowrap font-mono text-[#ff003c] text-[10px] uppercase tracking-[0.2em]">
                    {line.emphasis}
                  </span>
                  <div className="overflow-hidden border-white/10 border-l py-2 pl-4">
                    <p
                      className={cn(
                        "manifesto-line text-[clamp(1.5rem,3vw,3rem)] text-white/90 leading-[1.2] tracking-tight selection:bg-[#ff003c]",
                        activeFont.variable
                      )}
                    >
                      {line.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Floating Terminal (breaks grid logic) */}
            <div className="relative flex items-start lg:col-span-5 lg:mt-[20vh] lg:-ml-[10vw]">
              <div
                className="w-full max-w-lg overflow-hidden border border-white/10 bg-black/40 shadow-2xl backdrop-blur-xl"
                ref={terminalRef}
              >
                {/* Terminal chrome */}
                <div className="flex items-center gap-2 border-white/10 border-b bg-white/5 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                  <span className="ml-4 font-mono text-[10px] text-white/40 uppercase tracking-widest">
                    ~/experiments/scrollytelling
                  </span>
                </div>
                {/* Terminal body */}
                <div className="p-8">
                  <div className="flex flex-wrap leading-relaxed">
                    <span className="font-bold font-mono text-[#ff003c] text-xs">
                      $&nbsp;
                    </span>
                    {commandChars.map((char, i) => (
                      <span
                        className="term-char font-medium font-mono text-white/80 text-xs uppercase"
                        key={i}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                    <span className="ml-1 inline-block h-3 w-2 animate-pulse bg-[#ff003c]" />
                  </div>
                  <div className="mt-8 space-y-3 font-mono text-[10px] text-white/30 uppercase tracking-widest">
                    <p className="term-char opacity-0">
                      &gt; Boot sequence initiated
                    </p>
                    <p className="term-char opacity-0">
                      &gt; Injecting unified RAF loop...
                    </p>
                    <p className="term-char text-[#ff003c] opacity-0">
                      [OK] Tempus priority scaling active
                    </p>
                    <p className="term-char text-[#ff003c] opacity-0">
                      [OK] GSAP ScrollTrigger synchronized
                    </p>
                    <p className="term-char mt-6 text-white/50 opacity-0">
                      Awaiting manual scroll input...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
