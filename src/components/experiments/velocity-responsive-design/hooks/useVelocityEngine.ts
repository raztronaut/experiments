"use client";

import type Lenis from "lenis";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TIMINGS, VELOCITY_THRESHOLDS } from "../constants";

type ReadingState = "detailed" | "skim";

export interface VelocityEngineConfig {
  normalizationMax: number;
  skimEnter: number;
  skimExit: number;
  skimExitDelay: number;
  velocityScale: number;
}

export interface VelocityEngineState {
  isScrolling: boolean;
  lockVelocity: () => void;
  normalizedVelocity: number;
  readingState: ReadingState;
  velocity: number;
}

export function useVelocityEngine(
  lenis: Lenis | null,
  config: VelocityEngineConfig,
  options: { manualVelocity: number | null; reducedMotion: boolean }
): VelocityEngineState {
  const { reducedMotion, manualVelocity } = options;

  const [scrollV, setScrollV] = useState(0);
  const [readingState, setReadingState] = useState<ReadingState>("detailed");
  const [isLocked, setIsLocked] = useState(false);

  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const velocity = manualVelocity ?? scrollV;

  // --- Hysteresis state machine ---

  const updateReadingState = useCallback(
    (v: number) => {
      if (reducedMotion) {
        return;
      }

      if (v > config.skimEnter) {
        setReadingState("skim");
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current);
          exitTimerRef.current = null;
        }
      } else if (v < config.skimExit) {
        setReadingState((prev) => {
          if (prev === "skim" && !exitTimerRef.current) {
            exitTimerRef.current = setTimeout(() => {
              setReadingState("detailed");
              exitTimerRef.current = null;
            }, config.skimExitDelay);
          }
          return prev;
        });
      } else if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    },
    [reducedMotion, config.skimEnter, config.skimExit, config.skimExitDelay]
  );

  // Keep reading state in sync when driven by manual velocity (FlightControl slider)
  useEffect(() => {
    if (manualVelocity !== null) {
      updateReadingState(manualVelocity);
    }
  }, [manualVelocity, updateReadingState]);

  // --- Lenis scroll listener ---

  const onScrollRef = useRef<(l: Lenis) => void>(() => {});
  onScrollRef.current = (l: Lenis) => {
    if (isLocked || manualVelocity !== null) {
      return;
    }

    const absV = Math.floor(Math.abs(l.velocity) * config.velocityScale);
    if (absV !== scrollV) {
      setScrollV(absV);
      updateReadingState(absV);
    }

    if (l.scroll <= 0) {
      updateReadingState(0);
    }

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      setScrollV(0);
      updateReadingState(0);
    }, 150);
  };

  useEffect(() => {
    if (!lenis) {
      return;
    }
    const handler = (l: Lenis) => onScrollRef.current(l);
    lenis.on("scroll", handler);
    return () => {
      lenis.off("scroll", handler);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [lenis]);

  // --- Velocity lock (suppresses tracking during scroll stabilizer corrections) ---

  const lockVelocity = useCallback(() => {
    setIsLocked(true);
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setTimeout(() => setIsLocked(false), TIMINGS.SCROLL_LOCK_DURATION + 100);
  }, []);

  // --- Derived values ---

  const normalizedVelocity = useMemo(
    () => Math.min(velocity / config.normalizationMax, 1),
    [velocity, config.normalizationMax]
  );

  const isScrolling = useMemo(
    () =>
      velocity > VELOCITY_THRESHOLDS.IS_SCROLLING || manualVelocity !== null,
    [velocity, manualVelocity]
  );

  return {
    velocity,
    normalizedVelocity,
    readingState,
    isScrolling,
    lockVelocity,
  };
}
