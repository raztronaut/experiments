"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { forwardRef, useRef } from "react";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { PUBLISHING } from "../data";
import { usePrefersReducedMotion } from "../hooks";

export const PublishingSection = forwardRef<HTMLElement>(
  function PublishingSection(_, ref) {
    const sectionRef = useRef<HTMLElement>(null);
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

        // Heading
        const heading =
          sectionRef.current.querySelector<HTMLElement>(".pub-heading");
        const nodes =
          sectionRef.current.querySelectorAll<HTMLElement>(".pipeline-node");
        const connectors = sectionRef.current.querySelectorAll<HTMLElement>(
          ".pipeline-connector"
        );
        const articleBlock =
          sectionRef.current.querySelector<HTMLElement>(".article-morph");

        if (prefersReducedMotion) {
          gsap.set(heading, { clearProps: "all", opacity: 1, y: 0 });
          gsap.set(nodes, { clearProps: "all", opacity: 1, y: 0 });
          gsap.set(connectors, { clearProps: "all", scaleX: 1 });
          gsap.set(articleBlock, { clearProps: "all", clipPath: "none", x: 0 });
          return;
        }

        if (heading) {
          gsap.fromTo(
            heading,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              ease: "expo.out",
              duration: 1.5,
              scrollTrigger: {
                trigger: heading,
                start: "top 80%",
              },
            }
          );
        }

        // Pipeline nodes — sequential light-up
        gsap.set(nodes, { opacity: 0.2, y: 20 });
        gsap.set(connectors, { scaleX: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: nodes[0]?.parentElement,
            start: "top 75%",
            end: "top 40%",
            scrub: 1,
          },
        });

        nodes.forEach((node, i) => {
          tl.to(node, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
          });
          if (connectors[i]) {
            tl.to(
              connectors[i],
              { scaleX: 1, duration: 0.2, ease: "none" },
              "-=0.2"
            );
          }
        });

        // Code morph — clip-path reveal with parallax
        const codeBlock =
          sectionRef.current.querySelector<HTMLElement>(".code-morph");

        if (codeBlock && articleBlock) {
          gsap.set(articleBlock, { clipPath: "inset(0 100% 0 0)", x: -50 });

          gsap.to(articleBlock, {
            clipPath: "inset(0 0% 0 0)",
            x: 0,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: codeBlock.parentElement,
              start: "top 60%",
              end: "top 20%",
              scrub: 1,
            },
          });
        }
      },
      { scope: sectionRef, dependencies: [prefersReducedMotion] }
    );

    return (
      <section
        aria-label="Publishing"
        className="relative min-h-screen px-[4vw] py-32"
        ref={combinedRef}
      >
        <div className="mx-auto w-full">
          {/* Heading */}
          <div className="pub-heading mb-32 flex flex-col justify-between gap-12 md:flex-row md:items-end">
            <h2
              className={cn(
                "max-w-[12ch] font-medium text-[clamp(3.5rem,8vw,8rem)] text-white uppercase leading-[0.85] tracking-[-0.03em]",
                activeFont.variable
              )}
            >
              <span className="text-white/40 italic">Ship</span> It.
              <br />
              Every
              <br />
              Week.
            </h2>

            <div className="max-w-md border-[#ff003c]/50 border-l pb-2 pl-6">
              <p className="font-canvas text-[clamp(1.125rem,1.5vw,1.5rem)] text-white/50 leading-relaxed">
                {PUBLISHING.description}
              </p>
            </div>
          </div>

          {/* Pipeline visualization */}
          <div className="mb-32">
            <div className="mb-12 flex items-center gap-4">
              <div className="h-px w-12 bg-white/20" />
              <span className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">
                Conversion Pipeline
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-0">
              {PUBLISHING.pipeline.map((step, i) => (
                <div className="flex items-center" key={step.label}>
                  <div className="pipeline-node flex flex-col items-start gap-4 border-white/20 border-l-2 py-2 pr-8 pl-6 md:pr-16">
                    <span className="text-2xl text-[#ff003c] opacity-80">
                      {step.icon}
                    </span>
                    <span className="font-medium font-mono text-[11px] text-white/60 uppercase tracking-[0.15em]">
                      {step.label}
                    </span>
                  </div>
                  {i < PUBLISHING.pipeline.length - 1 && (
                    <div className="pipeline-connector mx-2 hidden h-px w-12 origin-left bg-gradient-to-r from-white/20 to-transparent md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Code → Article morph */}
          <div className="relative border-white/10 border-t pt-16">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
              <span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                Transformation Execution
              </span>
            </div>

            <div className="relative grid min-h-[400px] gap-8 lg:grid-cols-12 lg:gap-0">
              {/* Left: Code */}
              <div className="code-morph relative z-10 overflow-hidden bg-[#0a0a0f] p-8 shadow-2xl md:p-12 lg:col-span-7">
                {/* Scanline effect */}
                <div className="pointer-events-none absolute inset-0 bg-[length:100%_4px] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] opacity-20" />

                <span className="mb-6 inline-block font-mono text-[#4dff88]/50 text-[10px] uppercase tracking-[0.2em]">
                  <span className="mr-2 text-white/20">{"//"}</span> source:
                  experiment component
                </span>
                <pre className="relative z-10 font-mono text-[13px] leading-loose md:text-[15px]">
                  <code className="block text-purple-400/80">
                    {`"use client";`}
                  </code>
                  <code className="block text-white/20">&nbsp;</code>
                  <code className="block text-blue-400/80">
                    {`import { useGSAP } from "@gsap/react";`}
                  </code>
                  <code className="block text-blue-400/80">
                    {"import { createUnifiedScroll }"}
                  </code>
                  <code className="block text-blue-400/80">
                    {`  from "@/lib/toolkit/scroll";`}
                  </code>
                  <code className="block text-white/20">&nbsp;</code>
                  <code className="block text-emerald-400/80">
                    {"export default function Experiment() {"}
                  </code>
                  <code className="block text-white/50">
                    {"  const scrollRef = useRef(null);"}
                  </code>
                  <code className="block text-white/30 italic">
                    {"  // ...magic happens here"}
                  </code>
                  <code className="block text-emerald-400/80">{"}"}</code>
                </pre>
              </div>

              {/* Right: Article preview (clip-path reveal) */}
              <div className="article-morph relative z-20 bg-white p-8 text-black shadow-2xl md:p-12 lg:col-span-6 lg:mt-16 lg:-ml-12">
                <span className="mb-6 inline-block font-bold font-mono text-[10px] text-black/40 uppercase tracking-[0.2em]">
                  output: published article
                </span>
                <div className="space-y-6">
                  <h4
                    className={cn(
                      "font-bold text-3xl text-black tracking-tight md:text-4xl",
                      activeFont.variable
                    )}
                  >
                    Building a Scroll-Driven Experience
                  </h4>
                  <p className="font-serif text-black/70 text-lg leading-relaxed">
                    This experiment explores how to unify Lenis smooth scroll
                    with GSAP ScrollTrigger under a single RAF loop using
                    Tempus. The result is buttery-smooth scroll-driven
                    animations with zero jank.
                  </p>
                  <div className="flex gap-3 border-black/10 border-t pt-4">
                    <span className="font-bold font-mono text-[10px] text-black/50 uppercase">
                      lenis
                    </span>
                    <span className="font-bold font-mono text-[10px] text-black/50 uppercase">
                      gsap
                    </span>
                    <span className="font-bold font-mono text-[10px] text-black/50 uppercase">
                      scrolltrigger
                    </span>
                  </div>
                </div>

                {/* Decorative brutalist tape */}
                <div className="absolute top-0 right-8 h-4 w-16 -translate-y-2 rotate-2 bg-[#ff003c]/20" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
