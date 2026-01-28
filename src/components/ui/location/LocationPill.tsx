"use client";

import { memo } from "react";
import { motion, Transition } from "framer-motion";
import { ScrambleTicker } from "../ScrambleTicker";
import { WithHover } from "../cursor/WithHover";

interface LocationPillProps {
    showCoords: boolean;
    setShowCoords: (show: boolean) => void;
    hoveredId: string | null;
    setHoveredId: (id: string | null) => void;
    layoutTransition: Transition;
}

export const LocationPill = memo(({
    showCoords,
    setShowCoords,
    hoveredId,
    setHoveredId,
    layoutTransition
}: LocationPillProps) => {
    return (
        <WithHover>
            <motion.button
                layout
                transition={layoutTransition}
                onClick={() => setShowCoords(!showCoords)}
                onMouseEnter={() => setHoveredId('location')}
                onMouseLeave={() => setHoveredId(null)}
                className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm px-2 py-0.5 md:px-3 h-5 md:h-8 min-w-[8ch] md:min-w-[10ch]"
                aria-label="Toggle location format"
            >
                {hoveredId === 'location' ? (
                    <motion.div
                        layoutId="pill-hover"
                        className="absolute inset-0 bg-muted/40 rounded-sm -z-10 hidden md:block"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                ) : null}
                {/* Mobile Text (Compact) */}
                <ScrambleTicker
                    text={showCoords ? "43°N 79°W" : "TORONTO"}
                    align="center"
                    className="font-semibold tracking-tight tabular-nums md:hidden block"
                    layoutTransition={layoutTransition}
                />
                {/* Desktop Text (Full) */}
                <ScrambleTicker
                    text={showCoords ? "43°39'N 79°23'W" : "TORONTO"}
                    align="center"
                    className="font-semibold tracking-tight tabular-nums hidden md:block"
                    layoutTransition={layoutTransition}
                />
            </motion.button>
        </WithHover>
    );
});

LocationPill.displayName = "LocationPill";
