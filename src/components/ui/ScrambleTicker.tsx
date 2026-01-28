"use client";

import { motion, Transition } from "framer-motion";
import { useScramble, type UseScrambleProps } from "use-scramble";
import { cn } from "@/lib/utils";

interface ScrambleTickerProps {
    text: string;
    className?: string;
    scrambleProps?: Partial<UseScrambleProps>;
    align?: "left" | "center" | "right";
    layoutTransition?: Transition;
    layout?: boolean | "position" | "preserve-aspect";
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
    layout = true
}: ScrambleTickerProps) {
    const { ref } = useScramble({
        text,
        speed: 0.6,
        tick: 1,
        step: 1,
        scramble: 3,
        seed: 2,
        playOnMount: false,
        ...scrambleProps
    });

    return (
        <motion.div
            layout={layout}
            transition={layoutTransition}
            className={cn("relative inline-flex items-center overflow-hidden px-0.5", className)}
        >
            {/* Ghost text drives width/height and is the layout anchor */}
            <motion.span
                layout={layout}
                transition={layoutTransition}
                className="opacity-0 select-none pointer-events-none whitespace-nowrap invisible"
                aria-hidden="true"
            >
                {text}
            </motion.span>

            {/* Scramble reveal is absolutely positioned over the ghost to prevent jitter */}
            <motion.span
                ref={ref}
                layout={layout}
                transition={layoutTransition}
                className={cn(
                    "absolute inset-x-0.5 inset-y-0 flex items-center whitespace-nowrap",
                    align === "left" && "justify-start",
                    align === "center" && "justify-center",
                    align === "right" && "justify-end"
                )}
            />
        </motion.div>
    );
}
