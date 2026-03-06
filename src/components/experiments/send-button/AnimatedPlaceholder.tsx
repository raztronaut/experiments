"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { letterVariants, placeholderContainerVariants } from "./variants";

interface AnimatedPlaceholderProps {
  /** Interval between placeholder changes in ms (default: 3000) */
  cycleInterval?: number;
  /** Whether the input has a value */
  hasValue: boolean;
  /** Whether the input is currently active/focused */
  isActive: boolean;
  /** Array of placeholder strings to cycle through */
  placeholders: string[];
}

/**
 * Animated placeholder that cycles through suggestions
 * with letter-by-letter blur/fade animations
 */
export function AnimatedPlaceholder({
  placeholders,
  isActive,
  hasValue,
  cycleInterval = 3000,
}: AnimatedPlaceholderProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  // Cycle placeholder text when input is inactive
  useEffect(() => {
    if (isActive || hasValue) {
      return;
    }

    const interval = setInterval(() => {
      setShowPlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setShowPlaceholder(true);
      }, 400);
    }, cycleInterval);

    return () => clearInterval(interval);
  }, [isActive, hasValue, placeholders.length, cycleInterval]);

  // Don't render if active or has value
  if (isActive || hasValue || !showPlaceholder) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full items-center px-3 py-2">
      <AnimatePresence mode="wait">
        <motion.span
          animate="animate"
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 select-none text-gray-400"
          custom={placeholders[placeholderIndex].length}
          exit="exit"
          initial="initial"
          key={placeholderIndex}
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "calc(100% - 24px)",
            left: "12px",
            zIndex: 0,
          }}
          variants={placeholderContainerVariants}
        >
          {placeholders[placeholderIndex].split("").map((char, i) => (
            <motion.span
              key={i}
              style={{ display: "inline-block" }}
              variants={letterVariants}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
