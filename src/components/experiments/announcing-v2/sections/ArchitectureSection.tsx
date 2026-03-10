"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { forwardRef, useRef } from "react";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { PROFILES, type ProfileCard } from "../data";
import { usePrefersReducedMotion } from "../hooks";

function ProfileCardComponent({ card }: { card: ProfileCard }) {
  return (
    <div className="profile-card group relative flex flex-col justify-between border-white/10 border-b py-6 transition-colors hover:bg-white/[0.02]">
      <div className="flex flex-col justify-between gap-4 px-[4vw] md:flex-row md:items-center">
        <div className="flex items-center gap-6">
          <span className="inline-block text-2xl text-[#4dff88] opacity-60 transition-opacity group-hover:opacity-100 md:text-4xl">
            {card.icon}
          </span>
          <h3
            className={cn(
              "font-medium text-[clamp(1.5rem,3vw,3rem)] text-white tracking-tight",
              activeFont.variable
            )}
          >
            {card.name}
          </h3>
        </div>

        <div className="ml-12 flex max-w-sm flex-col justify-center md:ml-0 md:items-end md:text-right">
          <span className="mb-1 block font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] transition-colors group-hover:text-white/80">
            {card.profile}
          </span>
          <p className="font-canvas text-sm text-white/50 leading-relaxed transition-colors group-hover:text-white/70 md:text-base">
            {card.description}
          </p>
        </div>
      </div>

      {/* Animated accent line replacing static border */}
      <div className="absolute bottom-[-1px] left-0 h-px w-0 bg-gradient-to-r from-white/40 to-transparent transition-all duration-700 ease-out group-hover:w-full" />
    </div>
  );
}

export const ArchitectureSection = forwardRef<HTMLElement>(
  function ArchitectureSection(_, ref) {
    const sectionRef = useRef<HTMLElement>(null);
    const diagramRef = useRef<HTMLDivElement>(null);
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

        // Heading — typographic reveal
        const heading =
          sectionRef.current.querySelector<HTMLElement>(".arch-heading");
        const cards =
          sectionRef.current.querySelectorAll<HTMLElement>(".profile-card");
        const diagramLines =
          diagramRef.current?.querySelectorAll<HTMLElement>(".diagram-line") ??
          [];

        if (prefersReducedMotion) {
          gsap.set(heading, { clearProps: "all", opacity: 1, y: 0, scale: 1 });
          gsap.set(cards, { clearProps: "all", opacity: 1, x: 0 });
          gsap.set(diagramLines, { clearProps: "all", opacity: 1, y: 0 });
          return;
        }

        if (heading) {
          gsap.fromTo(
            heading,
            { opacity: 0, y: 30, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              ease: "power3.out",
              duration: 1.2,
              scrollTrigger: {
                trigger: heading,
                start: "top 80%",
              },
            }
          );
        }

        // Stagger list cards
        gsap.set(cards, { opacity: 0, x: -30 });

        ScrollTrigger.batch(cards, {
          onEnter: (batch) =>
            gsap.to(batch, {
              opacity: 1,
              x: 0,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.1,
            }),
          start: "top 85%",
        });

        // Route isolation diagram - giant text reveal
        if (diagramRef.current) {
          gsap.set(diagramLines, { opacity: 0, y: 15 });

          gsap.to(diagramLines, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: diagramRef.current,
              start: "top 75%",
            },
          });
        }
      },
      { scope: sectionRef, dependencies: [prefersReducedMotion] }
    );

    return (
      <section
        aria-label="Architecture"
        className="relative min-h-screen py-32"
        ref={combinedRef}
      >
        <div className="w-full">
          {/* Section Heading */}
          <div className="arch-heading mb-24 flex flex-col justify-between gap-8 px-[4vw] md:flex-row md:items-end">
            <h2
              className={cn(
                "max-w-[12ch] font-medium text-[clamp(3.5rem,8vw,8rem)] text-white uppercase leading-[0.85] tracking-[-0.03em]",
                activeFont.variable
              )}
            >
              Seven
              <br />
              Templates.
              <br />
              <span className="text-white/30 italic">Infinite</span>
              <br />
              Exp.
            </h2>

            <div className="max-w-md border-amber-400 border-l-2 pb-2 pl-6">
              <p className="font-canvas text-[clamp(1.125rem,1.5vw,1.5rem)] text-white/50 leading-relaxed">
                Each profile is a behavioral mode — shaping trade-offs, toolkit
                imports, and component structure from the moment of scaffolding.
              </p>
            </div>
          </div>

          {/* Profile List (replacing grid) */}
          <div className="mb-32 w-full border-white/10 border-t">
            {PROFILES.map((card) => (
              <ProfileCardComponent card={card} key={card.profile} />
            ))}
          </div>

          {/* Massive Route Isolation Diagram */}
          <div className="px-[4vw]">
            <div className="mb-12 flex items-center gap-4">
              <div className="h-px w-24 bg-white/30" />
              <span className="font-mono text-white/40 text-xs uppercase tracking-[0.2em]">
                Route Group Isolation
              </span>
            </div>

            <div
              className="scrollbar-hide overflow-x-auto bg-black/20 p-[4vw]"
              ref={diagramRef}
            >
              <div className="min-w-max space-y-4 whitespace-nowrap font-mono text-[clamp(12px,1.5vw,24px)] leading-relaxed">
                <code className="diagram-line block text-white/50">
                  src/app/experiments/
                </code>
                <code className="diagram-line block pl-[4vw] text-white/40">
                  <span className="text-white/20">├─ </span>(experiment-a)/
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="text-emerald-400/60 text-sm">
                    ← own &lt;html&gt; + &lt;body&gt;
                  </span>
                </code>
                <code className="diagram-line block pl-[8vw] text-[#4dff88]">
                  <span className="text-white/20">├─ </span>layout.tsx
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="text-sm text-white/30">
                    # standalone document
                  </span>
                </code>
                <code className="diagram-line block pl-[8vw] text-white/40">
                  <span className="text-white/20">├─ </span>experiment.json
                  &nbsp;&nbsp;&nbsp;
                  <span className="text-sm text-white/30"># metadata</span>
                </code>
                <code className="diagram-line block pl-[8vw] text-white/40">
                  <span className="text-white/20">└─ </span>
                  experiment-a/page.tsx
                </code>
                <div className="h-8" />
                <code className="diagram-line block pl-[4vw] text-white/40">
                  <span className="text-white/20">├─ </span>(experiment-b)/
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="text-emerald-400/60 text-sm">
                    ← completely isolated CSS/JS
                  </span>
                </code>
                <code className="diagram-line block pl-[8vw] text-white/40">
                  <span className="text-white/20">└─ </span>...
                </code>
                <div className="h-4" />
                <code className="diagram-line block pl-[4vw] text-white">
                  <span className="text-white/20">└─ </span>(announcing-v2)/
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <span className="animate-pulse font-bold text-amber-400 text-sm uppercase tracking-widest">
                    ← you are here
                  </span>
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
