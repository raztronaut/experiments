"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVelocityState } from "./VelocityContext";
import { SPRING_CONFIGS } from "./constants";

interface VelocityTextProps {
    detailed: string;
    summary: string;
}

export const VelocityText: React.FC<VelocityTextProps> = ({ detailed, summary }) => {
    const { readingState, normalizedVelocity } = useVelocityState();
    const isSkim = readingState === "skim";

    // Removed blur entirely for maximum readability as requested
    const opacityValue = isSkim ? Math.max(0.9, 1 - normalizedVelocity * 0.1) : 1;

    return (
        <motion.div
            layout
            transition={SPRING_CONFIGS.TRANSITION}
            className="relative my-12 font-sans overflow-hidden"
        >
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                    key={readingState}
                    initial={{ opacity: 0, y: isSkim ? 10 : -10 }}
                    animate={{
                        opacity: opacityValue,
                        y: 0,
                    }}
                    exit={{ opacity: 0, y: isSkim ? -10 : 10 }}
                    transition={{
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1]
                    }}
                    className={`${isSkim
                        ? "text-2xl sm:text-4xl font-black text-white tracking-tighter leading-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                        : "text-lg text-zinc-400 leading-relaxed font-serif"
                        } w-full`}
                >
                    {isSkim ? summary : detailed}
                </motion.div>
            </AnimatePresence>

            {/* Visual noise/streak effect during transition - kept very subtle */}
            {normalizedVelocity > 0.5 && !isSkim && (
                <motion.div
                    className="absolute inset-x-0 top-1/2 h-[1px] bg-primary/20"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 0.3 }}
                    style={{
                        transformOrigin: "left",
                    }}
                />
            )}
        </motion.div>
    );
};

