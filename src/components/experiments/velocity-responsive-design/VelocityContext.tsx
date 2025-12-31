"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useScroll, useVelocity, useSpring } from "framer-motion";
import { VELOCITY_THRESHOLDS, TIMINGS, SPRING_CONFIGS } from "./constants";

type ReadingState = "detailed" | "skim";

interface VelocityContextType {
    velocity: number;
    normalizedVelocity: number; // 0 to 1
    readingState: ReadingState;
    isScrolling: boolean;
    manualVelocity: number | null;
    setManualVelocity: (v: number | null) => void;
    lockVelocity: () => void;
}

const VelocityContext = createContext<VelocityContextType | undefined>(undefined);

export const VelocityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);

    // Use a spring to smooth out the velocity values for UI transitions
    const smoothVelocity = useSpring(scrollVelocity, SPRING_CONFIGS.VELOCITY_SMOOTHING);

    const [scrollV, setScrollV] = useState(0);
    const [manualVelocity, setManualVelocity] = useState<number | null>(null);
    const [isScrolling, setIsScrolling] = useState(false);
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
            setReadingState(prev => {
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
        else if (v >= VELOCITY_THRESHOLDS.SKIM_EXIT && v <= VELOCITY_THRESHOLDS.SKIM_ENTER) {
            if (exitTimerRef.current) {
                clearTimeout(exitTimerRef.current);
                exitTimerRef.current = null;
            }
        }
    }, []);

    // effectiveVelocity is either manual override or scroll velocity
    const velocity = manualVelocity !== null ? manualVelocity : (isVelocityLocked ? 0 : scrollV);

    useEffect(() => {
        const unsubscribe = smoothVelocity.on("change", (v) => {
            if (isVelocityLocked) {
                if (scrollV !== 0) setScrollV(0);
                return;
            }
            const absV = Math.floor(Math.abs(v));
            if (absV !== Math.floor(scrollV)) {
                setScrollV(absV);
                setIsScrolling(absV > VELOCITY_THRESHOLDS.IS_SCROLLING);

                // Update reading state based on new scroll velocity (only if manual override is OFF)
                if (manualVelocity === null) {
                    updateReadingState(absV);
                }
            }
        });

        return () => unsubscribe();
    }, [smoothVelocity, scrollV, isVelocityLocked, manualVelocity, updateReadingState]);

    const lockVelocity = React.useCallback(() => {
        setIsVelocityLocked(true);
        // Neutralize the underlying MotionValues to prevent the spring from "momentum-swallowing" the spike
        scrollVelocity.set(0);
        smoothVelocity.set(0);
        setScrollV(0);

        // Force state back to detailed when locked (programmatic scroll)
        setReadingState("detailed");
        if (exitTimerRef.current) {
            clearTimeout(exitTimerRef.current);
            exitTimerRef.current = null;
        }

        // A slightly longer lock ensures the browser and framer-motion have fully settled
        setTimeout(() => setIsVelocityLocked(false), TIMINGS.SCROLL_LOCK_DURATION + 100);
    }, [scrollVelocity, smoothVelocity]);

    const handleSetManualVelocity = React.useCallback((v: number | null) => {
        setManualVelocity(v);
        if (v !== null) {
            updateReadingState(v);
        }
    }, [updateReadingState]);

    // Handle scroll-to-top specifically: if user flings to top, we want to respect the delay
    // but also ensure we don't get stuck in skim mode if they are already at 0.
    useEffect(() => {
        const unsubscribe = scrollY.on("change", (latest) => {
            if (latest <= 0) {
                // If we hit the absolute top, start the exit timer if in skim mode
                updateReadingState(0);
            }
        });
        return () => unsubscribe();
    }, [scrollY, updateReadingState]);

    // Normalize velocity for effects (0 to VELOCITY_THRESHOLDS.NORMALIZATION_MAX mapped to 0 to 1)
    const normalizedVelocity = Math.min(velocity / VELOCITY_THRESHOLDS.NORMALIZATION_MAX, 1);

    return (
        <VelocityContext.Provider value={{
            velocity,
            normalizedVelocity,
            readingState,
            isScrolling: isScrolling || manualVelocity !== null,
            manualVelocity,
            setManualVelocity: handleSetManualVelocity,
            lockVelocity
        }}>
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

