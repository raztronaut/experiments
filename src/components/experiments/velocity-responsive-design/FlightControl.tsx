"use client";

import { Settings, Zap } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { VELOCITY_THRESHOLDS } from "./constants";
import { useVelocityState } from "./VelocityContext";

export function FlightControl() {
  const {
    velocity,
    manualVelocity,
    setManualVelocity,
    readingState,
    reducedMotion,
  } = useVelocityState();

  const isManual = manualVelocity !== null;
  const fillPercent = Math.min(
    (velocity / VELOCITY_THRESHOLDS.NORMALIZATION_MAX) * 100,
    100
  );

  return (
    <div
      aria-label="Flight Control — velocity dashboard"
      className="fixed bottom-8 left-1/2 z-100 flex w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:gap-6 sm:p-4"
      role="toolbar"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="mb-1 flex justify-between font-mono text-[9px] text-zinc-500 uppercase tracking-widest sm:text-[10px]">
          <span className="flex items-center gap-1.5 truncate sm:gap-2">
            <Zap
              className={cn(
                isManual ? "animate-pulse text-primary" : "text-primary/50"
              )}
              size={10}
            />
            <span className="hidden min-[400px]:inline">Velocity Vector</span>
            <span className="min-[400px]:hidden">VEL</span>
          </span>
          <span
            className={cn(
              "whitespace-nowrap",
              readingState === "skim"
                ? "font-bold text-primary"
                : "text-zinc-400"
            )}
          >
            {Math.round(velocity)} PX/S
          </span>
        </div>

        <div className="group/slider relative flex h-8 w-full items-center">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/50">
            <motion.div
              animate={{
                width: `${fillPercent}%`,
                backgroundColor: isManual
                  ? "hsl(var(--primary))"
                  : "hsl(var(--foreground))",
              }}
              className="absolute inset-y-0 left-0"
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { type: "spring", damping: 30, stiffness: 200 }
              }
            />
          </div>

          <input
            aria-label="Velocity control"
            aria-valuetext={`${Math.round(velocity)} pixels per second`}
            className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
            max={VELOCITY_THRESHOLDS.NORMALIZATION_MAX}
            min="0"
            onChange={(e) => setManualVelocity(Number(e.target.value))}
            type="range"
            value={velocity}
          />

          <motion.div
            animate={{
              left: `${fillPercent}%`,
              x: "-50%",
              scale: isManual ? 1.2 : 0.8,
              opacity: isManual ? 1 : 0,
            }}
            className="pointer-events-none absolute top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            transition={
              reducedMotion
                ? { duration: 0 }
                : { type: "spring", damping: 25, stiffness: 300 }
            }
          />

          {!isManual && (
            <div
              className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white/20 opacity-0 transition-opacity group-hover/slider:opacity-100"
              style={{
                left: `${fillPercent}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </div>
      </div>

      <div className="h-10 w-px bg-white/10" />

      <div className="flex items-center gap-4">
        <button
          aria-label={
            isManual
              ? "Switch to auto-scroll velocity"
              : "Switch to manual override"
          }
          className={cn(
            "rounded-xl p-3 transition-all duration-300",
            isManual
              ? "bg-primary text-black shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
              : "bg-white/5 text-zinc-400 hover:bg-white/10"
          )}
          onClick={() => setManualVelocity(isManual ? null : velocity)}
          type="button"
        >
          <motion.div
            animate={
              !reducedMotion && isManual ? { rotate: 360 } : { rotate: 0 }
            }
            transition={
              isManual
                ? {
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }
                : { duration: 0.3 }
            }
          >
            <Settings size={18} />
          </motion.div>
        </button>
        <div className="flex min-w-[80px] flex-col items-start">
          <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-tighter">
            System Phase
          </div>
          <div
            className={cn(
              "font-black text-sm uppercase leading-none tracking-tighter",
              readingState === "skim" ? "text-primary" : "text-blue-400"
            )}
          >
            {readingState}
          </div>
        </div>
      </div>
    </div>
  );
}
