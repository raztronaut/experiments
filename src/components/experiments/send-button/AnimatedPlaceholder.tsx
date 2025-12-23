"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { placeholderContainerVariants, letterVariants } from "./variants";

interface AnimatedPlaceholderProps {
    /** Array of placeholder strings to cycle through */
    placeholders: string[];
    /** Whether the input is currently active/focused */
    isActive: boolean;
    /** Whether the input has a value */
    hasValue: boolean;
    /** Interval between placeholder changes in ms (default: 3000) */
    cycleInterval?: number;
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
        if (isActive || hasValue) return;

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
        <div className="absolute left-0 top-0 w-full h-full pointer-events-none flex items-center px-3 py-2">
            <AnimatePresence mode="wait">
                <motion.span
                    key={placeholderIndex}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 select-none pointer-events-none"
                    style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        zIndex: 0,
                    }}
                    variants={placeholderContainerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    {placeholders[placeholderIndex].split("").map((char, i) => (
                        <motion.span
                            key={i}
                            variants={letterVariants}
                            style={{ display: "inline-block" }}
                        >
                            {char === " " ? "\u00A0" : char}
                        </motion.span>
                    ))}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}
