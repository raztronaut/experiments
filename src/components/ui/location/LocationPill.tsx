"use client";

import { motion, type Transition } from "motion/react";
import { memo } from "react";
import { WithHover } from "../cursor/WithHover";
import { ScrambleTicker } from "../ScrambleTicker";

interface LocationPillProps {
  hoveredId: string | null;
  layoutTransition: Transition;
  setHoveredId: (id: string | null) => void;
  setShowCoords: (show: boolean) => void;
  showCoords: boolean;
}

export const LocationPill = memo(
  ({
    showCoords,
    setShowCoords,
    hoveredId,
    setHoveredId,
    layoutTransition,
  }: LocationPillProps) => {
    return (
      <motion.div
        className="flex min-w-[8ch] items-center justify-center md:min-w-[10ch]"
        layout
        transition={layoutTransition}
      >
        <WithHover>
          <motion.button
            aria-label="Toggle location format"
            className="relative z-10 flex h-5 w-full cursor-pointer items-center justify-center rounded-sm px-2 py-0.5 text-foreground transition-colors md:h-8 md:px-3"
            layout
            onClick={() => setShowCoords(!showCoords)}
            onMouseEnter={() => setHoveredId("location")}
            onMouseLeave={() => setHoveredId(null)}
            transition={layoutTransition}
          >
            {hoveredId === "location" ? (
              <motion.div
                animate={{ opacity: 1 }}
                className="absolute inset-0 -z-10 hidden rounded-sm bg-muted/40 md:block"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                layoutId="pill-hover"
              />
            ) : null}

            <motion.div
              className="flex items-center justify-center"
              layout
              transition={layoutTransition}
            >
              {/* Mobile Text (Compact) */}
              <ScrambleTicker
                align="center"
                className="block font-semibold tabular-nums tracking-tight md:hidden"
                layout="position"
                layoutTransition={layoutTransition}
                text={showCoords ? "43°N 79°W" : "TORONTO"}
              />
              {/* Desktop Text (Full) */}
              <ScrambleTicker
                align="center"
                className="hidden font-semibold tabular-nums tracking-tight md:block"
                layout="position"
                layoutTransition={layoutTransition}
                text={showCoords ? "43°39'N 79°23'W" : "TORONTO"}
              />
            </motion.div>
          </motion.button>
        </WithHover>
      </motion.div>
    );
  }
);

LocationPill.displayName = "LocationPill";
