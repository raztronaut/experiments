"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getNextChar, getPreviousChar, sanitizeChar } from "./utils";

interface SplitFlapCellProps {
  char: string;
  className?: string;
  onFlip?: () => void;
  refreshKey?: number;
}

export function SplitFlapCell({
  char: targetCharProp = " ",
  className,
  onFlip,
  refreshKey,
}: SplitFlapCellProps) {
  const sanitizedTarget = useMemo(
    () => sanitizeChar(targetCharProp),
    [targetCharProp]
  );
  const [currentChar, setCurrentChar] = useState(" ");
  const [isScrambling, setIsScrambling] = useState(false);
  const [prevRefreshKey, setPrevRefreshKey] = useState(refreshKey);

  // Synchronize state with props during render (React recommended pattern)
  if (refreshKey !== prevRefreshKey) {
    setPrevRefreshKey(refreshKey);
    setIsScrambling(true);
    setCurrentChar(" ");
  }

  const isFlipping = currentChar !== sanitizedTarget;

  // Reset scrambling during render if we reached the target
  if (!isFlipping && isScrambling) {
    setIsScrambling(false);
  }

  useEffect(() => {
    if (!isFlipping) {
      return;
    }

    const timer = setTimeout(() => {
      const next = getNextChar(currentChar);
      setCurrentChar(next);

      if (onFlip && (isScrambling || Math.random() > 0.5)) {
        onFlip();
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [currentChar, isFlipping, onFlip, isScrambling]);

  return (
    <div
      className={cn(
        "perspective-1000 relative select-none overflow-hidden rounded-[2px] bg-[#1a1a1a]",
        className
      )}
      style={{
        width: "var(--flap-w, 28px)",
        height: "var(--flap-h, 44px)",
      }}
    >
      {/* Static Background (Target/Incoming Character) */}
      <div className="absolute inset-0 flex flex-col">
        <div className="flex h-1/2 w-full items-end justify-center overflow-hidden border-black/50 border-b bg-[#1a1a1a]">
          <span
            className="translate-y-1/2 font-bold font-mono text-white leading-none"
            style={{ fontSize: "var(--flap-font, 24px)" }}
          >
            {currentChar}
          </span>
        </div>
        <div className="flex h-1/2 w-full items-start justify-center overflow-hidden bg-[#1a1a1a]">
          <span
            className="-translate-y-1/2 font-bold font-mono text-white leading-none"
            style={{ fontSize: "var(--flap-font, 24px)" }}
          >
            {currentChar}
          </span>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {isFlipping && (
          <motion.div
            animate={{ rotateX: -180 }}
            className="backface-hidden absolute top-0 left-0 flex h-1/2 w-full items-end justify-center overflow-hidden border-black/50 border-b bg-[#1a1a1a]"
            exit={{ display: "none" }}
            initial={{ rotateX: 0 }}
            key={currentChar}
            style={{ transformOrigin: "bottom", zIndex: 10 }}
            transition={{ duration: 0.1, ease: "linear" }}
          >
            <span
              className="translate-y-1/2 font-bold font-mono text-white leading-none"
              style={{ fontSize: "var(--flap-font, 24px)" }}
            >
              {getPreviousChar(currentChar)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative center line */}
      <div className="absolute top-[calc(50%-0.5px)] left-0 z-20 h-px w-full bg-black/80 shadow-xs md:top-[calc(50%-1px)] md:h-[2px]" />
    </div>
  );
}
