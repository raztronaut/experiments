"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { forwardRef, useRef } from "react";
import { activeFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { MetricsVisualization } from "../components/MetricsVisualization";
import { AI_BRIDGE } from "../data";
import { usePrefersReducedMotion } from "../hooks";

export const AIBridgeSection = forwardRef<HTMLElement>(
  function AIBridgeSection(_, ref) {
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

        // Heading — scale + rotation entrance
        const heading =
          sectionRef.current.querySelector<HTMLElement>(".bridge-heading");
        const graphLines =
          sectionRef.current.querySelectorAll<HTMLElement>(".graph-line");
        const cards =
          sectionRef.current.querySelectorAll<HTMLElement>(".data-card");

        if (prefersReducedMotion) {
          gsap.set(heading, { clearProps: "all", opacity: 1, scale: 1, y: 0 });
          gsap.set(graphLines, { clearProps: "all", opacity: 1, x: 0 });
          gsap.set(cards, { clearProps: "all", opacity: 1, y: 0 });
          return;
        }

        if (heading) {
          gsap.fromTo(
            heading,
            { opacity: 0, scale: 0.9, y: 50 },
            {
              opacity: 1,
              scale: 1,
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

        // Scene graph lines — build up one by one
        gsap.set(graphLines, { opacity: 0, x: -10 });

        gsap.to(graphLines, {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: graphLines[0]?.parentElement,
            start: "top 75%",
            end: "top 30%",
            scrub: 1,
          },
        });

        // Data Cards
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cards[0],
              start: "top 85%",
            },
          }
        );
      },
      { scope: sectionRef, dependencies: [prefersReducedMotion] }
    );

    return (
      <section
        aria-label="AI Bridge"
        className="relative min-h-[120vh] px-[4vw] py-32"
        ref={combinedRef}
      >
        <div className="relative mx-auto w-full">
          <div className="bridge-heading mb-32 flex flex-col items-start">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">
                System Monitoring Active
              </span>
            </div>

            <div className="flex w-full flex-col justify-between gap-12 lg:flex-row lg:items-end">
              <h2
                className={cn(
                  "max-w-[12ch] font-medium text-[clamp(3.5rem,10vw,10rem)] text-white uppercase leading-[0.85] tracking-[-0.03em]",
                  activeFont.variable
                )}
              >
                Teaching
                <br />
                <span className="text-white/40 italic">Machines</span>
                <br />
                To See.
              </h2>

              <div className="max-w-md border-white/10 border-l pl-6 lg:mb-4">
                <p className="font-canvas text-[clamp(1.125rem,1.5vw,1.5rem)] text-white/60 leading-relaxed">
                  {AI_BRIDGE.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-24">
            <MetricsVisualization />
          </div>

          {/* Asymmetric Split Layout */}
          <div className="grid items-start gap-16 lg:grid-cols-12">
            {/* Left/Main Column: Scene Graph Printout */}
            <div className="relative lg:col-span-7">
              <div className="absolute top-0 bottom-0 -left-4 w-px bg-gradient-to-b from-white/20 to-transparent" />
              <div className="pl-6">
                <div className="mb-8 flex items-center justify-between border-white/10 border-b pb-4">
                  <span className="font-mono text-[#4dff88] text-xs uppercase tracking-widest">
                    R3FSceneInspector Output
                  </span>
                  <span className="font-mono text-[10px] text-white/30">
                    [ LIVE SNAPSHOT ]
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-sm bg-[#0a0a0f] p-8 font-mono text-[13px] text-white/60 leading-loose shadow-2xl md:text-[15px]">
                  {/* Scanline effect */}
                  <div className="pointer-events-none absolute inset-0 bg-[length:100%_4px] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] opacity-20" />

                  <pre className="scrollbar-hide relative z-10 w-full overflow-x-auto">
                    {AI_BRIDGE.sceneGraph.map((line, i) => (
                      <code className="graph-line block whitespace-pre" key={i}>
                        {line.includes("├") ||
                        line.includes("└") ||
                        line.includes("│") ? (
                          <span className="text-white/20">
                            {line.substring(
                              0,
                              line.indexOf(line.match(/[^├└│\s]/)?.[0] || " ")
                            )}
                          </span>
                        ) : null}
                        <span
                          className={
                            line.includes("Mesh")
                              ? "text-[#4dff88]"
                              : line.includes("Material")
                                ? "text-amber-300"
                                : "text-white"
                          }
                        >
                          {line.replace(/^[├└│\s]+/, "")}
                        </span>
                      </code>
                    ))}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right/Secondary Column: Explanation Cards */}
            <div className="space-y-6 lg:col-span-4 lg:col-start-9 lg:mt-24">
              <div className="data-card border-white/20 border-t pt-6">
                <h4 className="mb-3 font-mono font-semibold text-[#4dff88] text-[11px] uppercase tracking-[0.2em]">
                  ExperimentDevMetrics
                </h4>
                <p className="font-canvas text-base text-white/50 leading-relaxed">
                  Logs FPS, heap, CLS, and active GSAP tweens every 2s via
                  console.warn. Writes to{" "}
                  <code className="rounded bg-white/5 px-1 text-white/70">
                    window.__experimentMetrics
                  </code>{" "}
                  for programmatic querying by MCP tools.
                </p>
              </div>

              <div className="data-card border-white/10 border-t pt-6">
                <h4 className="mb-3 font-mono font-semibold text-[#ff003c] text-[11px] uppercase tracking-[0.2em]">
                  Visual QA Workflow
                </h4>
                <p className="font-canvas text-base text-white/50 leading-relaxed">
                  Playwright captures, MCP-driven scroll control, and a
                  structured verification loop so agents can validate their own
                  visual output.
                </p>
              </div>

              <div className="data-card border-white/10 border-t pt-6">
                <h4 className="mb-3 font-mono font-semibold text-[11px] text-amber-400 uppercase tracking-[0.2em]">
                  Debug Overlay
                </h4>
                <p className="font-canvas text-base text-white/50 leading-relaxed">
                  Activated via{" "}
                  <code className="rounded bg-white/5 px-1 text-white/70">
                    ?debug
                  </code>{" "}
                  URL param. GSDevTools timeline, device info, and debug hotkeys
                  — all gated behind a single flag.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
