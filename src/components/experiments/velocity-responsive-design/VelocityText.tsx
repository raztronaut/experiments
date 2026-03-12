"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING_CONFIGS } from "./constants";
import { useVelocityState } from "./VelocityContext";

interface VelocityTextProps {
  detailed: string;
  summary: string;
}

export function VelocityText({ detailed, summary }: VelocityTextProps) {
  const { readingState, normalizedVelocity, reducedMotion } =
    useVelocityState();
  const isSkim = readingState === "skim";

  return (
    <motion.div
      className="relative my-12 overflow-hidden font-sans"
      layout={!reducedMotion}
      transition={reducedMotion ? { duration: 0 } : SPRING_CONFIGS.TRANSITION}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={cn(
            "w-full",
            isSkim
              ? "font-black text-2xl text-white leading-tight tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] sm:text-4xl"
              : "font-serif text-lg text-zinc-400 leading-relaxed"
          )}
          exit={{ opacity: 0, y: isSkim ? -10 : 10 }}
          initial={{ opacity: 0, y: isSkim ? 10 : -10 }}
          key={readingState}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
          }
        >
          {isSkim ? summary : detailed}
        </motion.div>
      </AnimatePresence>

      {!reducedMotion && normalizedVelocity > 0.5 && !isSkim && (
        <motion.div
          animate={{ scaleX: 1, opacity: 0.3 }}
          className="absolute inset-x-0 top-1/2 h-px bg-primary/20"
          initial={{ scaleX: 0, opacity: 0 }}
          style={{ transformOrigin: "left" }}
        />
      )}
    </motion.div>
  );
}
