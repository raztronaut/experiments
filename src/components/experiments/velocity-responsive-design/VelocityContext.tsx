"use client";

import { useScroll, useSpring, useVelocity } from "motion/react";
import React, { createContext, useContext, useEffect, useState } from "react";
import { SPRING_CONFIGS, TIMINGS, VELOCITY_THRESHOLDS } from "./constants";

type ReadingState = "detailed" | "skim";

interface VelocityContextType {
  isScrolling: boolean;
  lockVelocity: () => void;
  manualVelocity: number | null;
  normalizedVelocity: number; // 0 to 1
  readingState: ReadingState;
  setManualVelocity: (v: number | null) => void;
  velocity: number;
}

const VelocityContext = createContext<VelocityContextType | undefined>(
  undefined
);

export const VelocityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  // Use a spring to smooth out the velocity values for UI transitions
  const smoothVelocity = useSpring(
    scrollVelocity,
    SPRING_CONFIGS.VELOCITY_SMOOTHING
  );

  const [scrollV, setScrollV] = useState(0);
  const [manualVelocity, setManualVelocity] = useState<number | null>(null);
  const [readingState, setReadingState] = useState<ReadingState>("detailed");
  const [isVelocityLocked, setIsVelocityLocked] = useState(false);

  // Use a ref to manage the exit timer identity
  const exitTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Unified logic to update reading state based on current velocity
  const updateReadingState = React.useCallback((v: number) => {
    // Clear timer if we exceed skim entrance threshold
    if (v > VELOCITY_THRESHOLDS.SKIM_ENTER) {
      setReadingState("skim");
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    }
    // Start or continue exit timer if below exit threshold
    else if (v < VELOCITY_THRESHOLDS.SKIM_EXIT) {
      setReadingState((prev) => {
        if (prev === "skim" && !exitTimerRef.current) {
          exitTimerRef.current = setTimeout(() => {
            setReadingState("detailed");
            exitTimerRef.current = null;
          }, TIMINGS.SKIM_EXIT_DELAY);
        }
        return prev;
      });
    }
    // Intermediate zone: cancel exit timer if user speeds up slightly
    else if (
      v >= VELOCITY_THRESHOLDS.SKIM_EXIT &&
      v <= VELOCITY_THRESHOLDS.SKIM_ENTER &&
      exitTimerRef.current
    ) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  // effectiveVelocity is either manual override or scroll velocity
  const velocity = manualVelocity !== null ? manualVelocity : scrollV;

  useEffect(() => {
    const unsubscribe = smoothVelocity.on("change", (v) => {
      if (isVelocityLocked) {
        return;
      }
      const absV = Math.floor(Math.abs(v));
      if (absV !== Math.floor(scrollV)) {
        setScrollV(absV);

        // Update reading state based on new scroll velocity (only if manual override is OFF)
        if (manualVelocity === null) {
          updateReadingState(absV);
        }
      }
    });

    return () => unsubscribe();
  }, [
    smoothVelocity,
    scrollV,
    isVelocityLocked,
    manualVelocity,
    updateReadingState,
  ]);

  const lockVelocity = React.useCallback(() => {
    setIsVelocityLocked(true);
    // Neutralize the underlying MotionValues to prevent the spring from "momentum-swallowing" the spike
    scrollVelocity.set(0);
    smoothVelocity.set(0);

    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    // A slightly longer lock ensures the browser and framer-motion have fully settled
    setTimeout(
      () => setIsVelocityLocked(false),
      TIMINGS.SCROLL_LOCK_DURATION + 100
    );
  }, [scrollVelocity, smoothVelocity]);

  const handleSetManualVelocity = React.useCallback(
    (v: number | null) => {
      setManualVelocity(v);
      if (v !== null) {
        updateReadingState(v);
      }
    },
    [updateReadingState]
  );

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      if (latest <= 0) {
        updateReadingState(0);
      }
    });
    return () => unsubscribe();
  }, [scrollY, updateReadingState]);

  // Optimize derived values and context object
  const normalizedVelocity = React.useMemo(
    () => Math.min(velocity / VELOCITY_THRESHOLDS.NORMALIZATION_MAX, 1),
    [velocity]
  );

  const isScrolling = React.useMemo(
    () =>
      velocity > VELOCITY_THRESHOLDS.IS_SCROLLING || manualVelocity !== null,
    [velocity, manualVelocity]
  );

  const contextValue = React.useMemo(
    () => ({
      velocity,
      normalizedVelocity,
      readingState,
      isScrolling,
      manualVelocity,
      setManualVelocity: handleSetManualVelocity,
      lockVelocity,
    }),
    [
      velocity,
      normalizedVelocity,
      readingState,
      isScrolling,
      manualVelocity,
      handleSetManualVelocity,
      lockVelocity,
    ]
  );

  return (
    <VelocityContext.Provider value={contextValue}>
      {children}
    </VelocityContext.Provider>
  );
};

export const useVelocityState = () => {
  const context = useContext(VelocityContext);
  if (context === undefined) {
    throw new Error("useVelocityState must be used within a VelocityProvider");
  }
  return context;
};
