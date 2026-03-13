"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ANIMATION_DURATION_MS,
  calculateShortestPath,
  SEQUENCE_COUNT,
} from "../data";

interface UseMorphAnimationOptions {
  duration?: number;
  reducedMotion?: boolean;
  debug?: boolean;
}

interface UseMorphAnimationResult {
  progressRef: React.RefObject<number>;
  animateTo: (target: number) => void;
}

export function useMorphAnimation(
  options: UseMorphAnimationOptions = {}
): UseMorphAnimationResult {
  const {
    duration = ANIMATION_DURATION_MS,
    reducedMotion = false,
    debug = false,
  } = options;

  const progressRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(1);
  const targetValueRef = useRef(1);

  const logDebug = useCallback(
    (msg: string) => {
      if (debug) {
        console.log(`[luma-morphing] ${msg}`);
      }
    },
    [debug]
  );

  const animateTo = useCallback(
    (target: number) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      const diff = calculateShortestPath(progressRef.current, target);
      logDebug(
        `morph: ${progressRef.current.toFixed(2)} -> ${target} (shortest path: ${diff > 0 ? "+" : ""}${diff.toFixed(2)}, duration: ${duration}ms)`
      );

      if (reducedMotion) {
        progressRef.current = target;
        return;
      }

      startTimeRef.current = null;
      startValueRef.current = progressRef.current;
      targetValueRef.current = target;

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;

        if (elapsed < duration) {
          const t = elapsed / duration;
          const diff = calculateShortestPath(
            startValueRef.current,
            targetValueRef.current
          );
          let newValue = startValueRef.current + diff * t;

          if (newValue > SEQUENCE_COUNT) {
            newValue -= SEQUENCE_COUNT;
          }
          if (newValue < 1) {
            newValue += SEQUENCE_COUNT;
          }

          progressRef.current = newValue;
          rafRef.current = requestAnimationFrame(animate);
        } else {
          progressRef.current = targetValueRef.current;
          rafRef.current = null;
          startTimeRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [duration, reducedMotion, logDebug]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { progressRef, animateTo };
}
