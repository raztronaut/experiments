"use client";

import type Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useDevControls } from "@/hooks/useDevControls";
import { TIMINGS, VELOCITY_THRESHOLDS } from "./constants";
import { useVelocityEngine } from "./hooks/useVelocityEngine";

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
  const [manualVelocity, setManualVelocityRaw] = useState<number | null>(null);

  const config = useDevControls("Velocity Thresholds", {
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

  const engine = useVelocityEngine(lenis, config, {
    reducedMotion,
    manualVelocity,
  });

  const setManualVelocity = useCallback(
    (v: number | null) => setManualVelocityRaw(v),
    []
  );

  const value = useMemo<VelocityContextType>(
    () => ({
      ...engine,
      manualVelocity,
      reducedMotion,
      setManualVelocity,
    }),
    [engine, manualVelocity, reducedMotion, setManualVelocity]
  );

  return (
    <VelocityContext.Provider value={value}>
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
