"use client";

import { Monitor, Settings, Zap } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { AIWidget } from "@/components/ui/AIWidget";
import { VELOCITY_THRESHOLDS } from "./constants";
import { CONTENT } from "./content";
import { SpeedLines } from "./SpeedLines";
import { VelocityCodeBlock } from "./VelocityCodeBlock";
import { useVelocityState, VelocityProvider } from "./VelocityContext";
import { VelocityImage } from "./VelocityImage";
import { VelocityText } from "./VelocityText";

const StaticBackgroundPattern = () => (
  <div
    className="pointer-events-none absolute inset-0 opacity-20"
    style={{
      backgroundImage:
        "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)",
      backgroundSize: "40px 40px",
    }}
  />
);

function FlightControl() {
  const { velocity, manualVelocity, setManualVelocity, readingState } =
    useVelocityState();

  return (
    <div className="fixed bottom-8 left-1/2 z-100 flex w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:gap-6 sm:p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="mb-1 flex justify-between font-mono text-[9px] text-zinc-500 uppercase tracking-widest sm:text-[10px]">
          <span className="flex items-center gap-1.5 truncate sm:gap-2">
            <Zap
              className={
                manualVelocity !== null
                  ? "animate-pulse text-primary"
                  : "text-primary/50"
              }
              size={10}
            />
            <span className="hidden min-[400px]:inline">Velocity Vector</span>
            <span className="min-[400px]:hidden">VEL</span>
          </span>
          <span
            className={
              readingState === "skim"
                ? "whitespace-nowrap font-bold text-primary"
                : "whitespace-nowrap text-zinc-400"
            }
          >
            {Math.round(velocity)} PX/S
          </span>
        </div>

        {/* Enhanced Slider Container */}
        <div className="group/slider relative flex h-8 w-full items-center">
          {/* Visual Track Background */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/50">
            {/* Progressive Fill */}
            <motion.div
              animate={{
                width: `${Math.min((velocity / VELOCITY_THRESHOLDS.NORMALIZATION_MAX) * 100, 100)}%`,
                backgroundColor:
                  manualVelocity !== null ? "#3b82f6" : "#ffffff", // Primary color or white
              }}
              className="absolute inset-y-0 left-0 bg-primary/80"
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
            />
          </div>

          {/* Actual Input - Taller hit area */}
          <input
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            max={VELOCITY_THRESHOLDS.NORMALIZATION_MAX + 500}
            min="0"
            onChange={(e) => setManualVelocity(Number(e.target.value))}
            type="range"
            value={velocity}
          />

          {/* Floating Thumb Hint */}
          <motion.div
            animate={{
              left: `${Math.min((velocity / VELOCITY_THRESHOLDS.NORMALIZATION_MAX) * 100, 100)}%`,
              x: "-50%",
              scale: manualVelocity !== null ? 1.2 : 0.8,
              opacity: manualVelocity !== null ? 1 : 0,
            }}
            className="pointer-events-none absolute top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          />

          {/* Hover indicator for thumb when manual is OFF */}
          {manualVelocity === null ? (
            <div
              className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white/20 opacity-0 transition-opacity group-hover/slider:opacity-100"
              style={{
                left: `${Math.min((velocity / VELOCITY_THRESHOLDS.NORMALIZATION_MAX) * 100, 100)}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="h-10 w-px bg-white/10" />

      <div className="flex items-center gap-4">
        <button
          className={`rounded-xl p-2.5 transition-all duration-300 ${
            manualVelocity !== null
              ? "bg-primary text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          }`}
          onClick={() =>
            setManualVelocity(manualVelocity === null ? velocity : null)
          }
          title={
            manualVelocity !== null
              ? "Switch to Auto-Scroll Velocity"
              : "Switch to Manual Override"
          }
        >
          <Settings
            className={manualVelocity !== null ? "animate-spin-slow" : ""}
            size={18}
          />
        </button>
        <div className="flex min-w-[80px] flex-col items-start">
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-tighter">
            System Phase
          </div>
          <div
            className={`font-black text-sm uppercase leading-none tracking-tighter ${readingState === "skim" ? "text-primary" : "text-blue-400"}`}
          >
            {readingState}
          </div>
        </div>
      </div>
    </div>
  );
}

function IntelligentScroller({ children }: { children: React.ReactNode }) {
  const { readingState, lockVelocity } = useVelocityState();
  const containerRef = useRef<HTMLDivElement>(null);

  // Using a ref to track the "anchor" before the layout shift happens.
  // We update this continuously on scroll so that when readingState changes,
  // we already know what was visible and where it was.
  const lastAnchorRef = useRef<{
    index: number;
    topOffset: number;
    viewportOffset: number;
  } | null>(null);

  useEffect(() => {
    const updateAnchor = () => {
      if (!containerRef.current) {
        return;
      }

      const childrenElements = Array.from(containerRef.current.children);
      const viewportHalf = window.innerHeight * 0.4; // Target slightly above center for better "gaze" anchoring

      let closestIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      childrenElements.forEach((child, i) => {
        const rect = child.getBoundingClientRect();
        // We anchor to the top of the element plus a small buffer
        const distance = Math.abs(rect.top - viewportHalf);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      });

      if (childrenElements[closestIndex]) {
        const rect = childrenElements[closestIndex].getBoundingClientRect();
        lastAnchorRef.current = {
          index: closestIndex,
          topOffset: rect.top,
          viewportOffset: rect.top, // Store relative to viewport
        };
      }
    };

    window.addEventListener("scroll", updateAnchor, { passive: true });
    updateAnchor(); // Initial capture
    return () => window.removeEventListener("scroll", updateAnchor);
  }, []);

  // Apply stabilization when readingState changes
  useLayoutEffect(() => {
    if (!(lastAnchorRef.current && containerRef.current)) {
      return;
    }

    const anchor = lastAnchorRef.current;
    const childrenElements = Array.from(containerRef.current.children);
    const targetChild = childrenElements[anchor.index] as HTMLElement;

    if (!targetChild) {
      return;
    }

    // Force a synchronous layout pass for accurate measurement
    // We need to wait for the next frame or use a small delay if content is still morphing
    // but useLayoutEffect usually fires after DOM updates but before paint.

    const newRect = targetChild.getBoundingClientRect();
    const delta = newRect.top - anchor.viewportOffset;

    if (Math.abs(delta) > 0.1) {
      lockVelocity();
      window.scrollBy({ top: delta, behavior: "instant" as any });
    }
  }, [lockVelocity]);

  return (
    <main
      className="relative z-10 mx-auto max-w-3xl px-6 py-24"
      ref={containerRef}
    >
      {children}
    </main>
  );
}

export default function VelocityResponsiveDesign() {
  return (
    <VelocityProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-primary selection:text-black">
        <SpeedLines />

        {/* Header Section */}
        <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 p-8 text-center">
          <StaticBackgroundPattern />

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="mb-4 bg-linear-to-b from-white to-zinc-700 bg-clip-text font-black text-5xl text-transparent text-white uppercase italic leading-[0.9] tracking-tighter sm:text-8xl">
              The
              <br />
              Relativistic
              <br />
              Reader
            </h1>

            <div className="mt-16 flex flex-col items-center gap-4">
              <div className="h-24 w-px bg-linear-to-b from-primary/50 to-transparent" />
              <span className="animate-pulse font-mono text-[9px] text-zinc-600 uppercase tracking-widest">
                Scroll to Accelerate
              </span>
            </div>
          </motion.div>
        </div>

        <IntelligentScroller>
          {CONTENT.map((item, i) => {
            if (item.type === "text") {
              return (
                <VelocityText
                  detailed={item.detailed!}
                  key={i}
                  summary={item.summary!}
                />
              );
            }
            if (item.type === "image") {
              return <VelocityImage alt={item.alt!} key={i} src={item.src!} />;
            }
            if (item.type === "code") {
              return (
                <VelocityCodeBlock
                  code={item.code!}
                  filename={item.filename!}
                  key={i}
                  language={item.language!}
                />
              );
            }
            return null;
          })}
        </IntelligentScroller>

        <FlightControl />

        <footer className="relative flex h-[200vh] flex-col items-center justify-center border-white/5 border-t bg-zinc-950">
          <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-linear-to-b from-white/10 to-transparent" />
          <p className="mb-4 font-mono text-xs text-zinc-700 uppercase tracking-[0.4em]">
            End of Content Stream
          </p>
          <div className="flex gap-4">
            <Zap className="text-zinc-800" size={14} />
            <Monitor className="text-zinc-800" size={14} />
            <Settings className="text-zinc-800" size={14} />
          </div>
        </footer>

        <div className="hidden md:block">
          <AIWidget />
        </div>
      </div>
    </VelocityProvider>
  );
}
