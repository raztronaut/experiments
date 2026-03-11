"use client";

import type Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDevControls } from "@/hooks/useDevControls";
import { TIMINGS, VELOCITY_THRESHOLDS } from "./constants";

type ReadingState = "detailed" | "skim";

interface VelocityContextType {
  isScrolling: boolean;
  lockVelocity: () => void;
  manualVelocity: number | null;
  normalizedVelocity: number;
  readingState: ReadingState;
  reducedMotion: boolean;
  setManualVelocity: (v: number | null) => void;
  velocity: number;
}

const VelocityContext = createContext<VelocityContextType | undefined>(
  undefined
);

interface VelocityProviderProps {
  children: React.ReactNode;
  lenis: Lenis | null;
}

export function VelocityProvider({ children, lenis }: VelocityProviderProps) {
  const reducedMotion = useReducedMotion() ?? false;

  const thresholds = useDevControls("Velocity Thresholds", {
    velocityScale: {
      value: VELOCITY_THRESHOLDS.VELOCITY_SCALE,
      min: 1,
      max: 50,
      step: 1,
    },
    skimEnter: {
      value: VELOCITY_THRESHOLDS.SKIM_ENTER,
      min: 500,
      max: 5000,
      step: 100,
    },
    skimExit: {
      value: VELOCITY_THRESHOLDS.SKIM_EXIT,
      min: 50,
      max: 2000,
      step: 50,
    },
    skimExitDelay: {
      value: TIMINGS.SKIM_EXIT_DELAY,
      min: 500,
      max: 5000,
      step: 100,
    },
    normalizationMax: {
      value: VELOCITY_THRESHOLDS.NORMALIZATION_MAX,
      min: 1000,
      max: 6000,
      step: 100,
    },
  });

  const [scrollV, setScrollV] = useState(0);
  const [manualVelocity, setManualVelocity] = useState<number | null>(null);
  const [readingState, setReadingState] = useState<ReadingState>("detailed");
  const [isVelocityLocked, setIsVelocityLocked] = useState(false);

  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateReadingState = useCallback(
    (v: number) => {
      if (reducedMotion) {
        return;
      }

      if (v > thresholds.skimEnter) {
        setReadingState("skim");
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current);
          exitTimerRef.current = null;
        }
      } else if (v < thresholds.skimExit) {
        setReadingState((prev) => {
          if (prev === "skim" && !exitTimerRef.current) {
            exitTimerRef.current = setTimeout(() => {
              setReadingState("detailed");
              exitTimerRef.current = null;
            }, thresholds.skimExitDelay);
          }
          return prev;
        });
      } else if (
        v >= thresholds.skimExit &&
        v <= thresholds.skimEnter &&
        exitTimerRef.current
      ) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    },
    [
      reducedMotion,
      thresholds.skimEnter,
      thresholds.skimExit,
      thresholds.skimExitDelay,
    ]
  );

  const velocity = manualVelocity !== null ? manualVelocity : scrollV;

  // When Lenis settles, no more scroll events fire and velocity stays stale.
  // This timer resets velocity to 0 when no events arrive within 150ms.
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref-based callback avoids stale closures in the Lenis scroll listener.
  const onScrollRef = useRef<(lenisInstance: Lenis) => void>(() => {});
  onScrollRef.current = (lenisInstance: Lenis) => {
    if (isVelocityLocked || manualVelocity !== null) {
      return;
    }

    const absV = Math.floor(
      Math.abs(lenisInstance.velocity) * thresholds.velocityScale
    );
    if (absV !== scrollV) {
      setScrollV(absV);
      updateReadingState(absV);
    }

    if (lenisInstance.scroll <= 0) {
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
    const handler = (lenisInstance: Lenis) =>
      onScrollRef.current(lenisInstance);
    lenis.on("scroll", handler);
    return () => {
      lenis.off("scroll", handler);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [lenis]);

  const lockVelocity = useCallback(() => {
    setIsVelocityLocked(true);

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    setTimeout(
      () => setIsVelocityLocked(false),
      TIMINGS.SCROLL_LOCK_DURATION + 100
    );
  }, []);

  const handleSetManualVelocity = useCallback(
    (v: number | null) => {
      setManualVelocity(v);
      if (v !== null) {
        updateReadingState(v);
      }
    },
    [updateReadingState]
  );

  const normalizedVelocity = useMemo(
    () => Math.min(velocity / thresholds.normalizationMax, 1),
    [velocity, thresholds.normalizationMax]
  );

  const isScrolling = useMemo(
    () =>
      velocity > VELOCITY_THRESHOLDS.IS_SCROLLING || manualVelocity !== null,
    [velocity, manualVelocity]
  );

  const contextValue = useMemo(
    () => ({
      velocity,
      normalizedVelocity,
      readingState,
      isScrolling,
      manualVelocity,
      reducedMotion,
      setManualVelocity: handleSetManualVelocity,
      lockVelocity,
    }),
    [
      velocity,
      normalizedVelocity,
      readingState,
      isScrolling,
      manualVelocity,
      reducedMotion,
      handleSetManualVelocity,
      lockVelocity,
    ]
  );

  return (
    <VelocityContext.Provider value={contextValue}>
      {children}
    </VelocityContext.Provider>
  );
}

export function useVelocityState() {
  const context = useContext(VelocityContext);
  if (context === undefined) {
    throw new Error("useVelocityState must be used within a VelocityProvider");
  }
  return context;
}
