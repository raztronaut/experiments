"use client";

import { motion, type Transition } from "motion/react";
import { type UseScrambleProps, useScramble } from "use-scramble";
import { cn } from "@/lib/utils";

interface ScrambleTickerProps {
  align?: "left" | "center" | "right";
  className?: string;
  layout?: boolean | "position" | "preserve-aspect";
  layoutTransition?: Transition;
  scrambleProps?: Partial<UseScrambleProps>;
  text: string;
}

/**
 * A reusable component that implements the "Ghost Text" strategy for use-scramble.
 * Reserves space invisibly to prevent layout jitter while the scramble reveal plays.
 */
export function ScrambleTicker({
  text,
  className,
  scrambleProps,
  align = "left",
  layoutTransition,
  layout = true,
}: ScrambleTickerProps) {
  const { ref } = useScramble({
    text,
    speed: 0.6,
    tick: 1,
    step: 1,
    scramble: 3,
    seed: 2,
    playOnMount: false,
    ...scrambleProps,
  });

  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center overflow-hidden px-0.5",
        className
      )}
      layout={layout}
      transition={layoutTransition}
    >
      {/* Ghost text drives width/height and is the layout anchor */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none invisible select-none whitespace-nowrap opacity-0"
        layout={layout}
        transition={layoutTransition}
      >
        {text}
      </motion.span>

      {/* Scramble reveal is absolutely positioned over the ghost to prevent jitter */}
      <motion.span
        className={cn(
          "absolute inset-x-0.5 inset-y-0 flex items-center whitespace-nowrap",
          align === "left" && "justify-start",
          align === "center" && "justify-center",
          align === "right" && "justify-end"
        )}
        layout={layout}
        ref={ref}
        transition={layoutTransition}
      />
    </motion.div>
  );
}
