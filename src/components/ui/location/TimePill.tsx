"use client";

import { motion, type Transition } from "motion/react";
import { memo, useEffect, useMemo, useState } from "react";
import { useMounted } from "@/hooks/useMounted";
import { WithHover } from "../cursor/WithHover";
import { ScrambleTicker } from "../ScrambleTicker";

interface TimePillProps {
  hoveredId: string | null;
  layoutTransition: Transition;
  setHoveredId: (id: string | null) => void;
  setUse24Hour: (use: boolean) => void;
  use24Hour: boolean;
}

export const TimePill = memo(
  ({
    use24Hour,
    setUse24Hour,
    hoveredId,
    setHoveredId,
    layoutTransition,
  }: TimePillProps) => {
    const mounted = useMounted();
    const [date, setDate] = useState(() => new Date());

    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date();
        // Only trigger re-render if the minute has changed
        setDate((prev) => {
          if (prev.getMinutes() !== now.getMinutes()) {
            return now;
          }
          return prev;
        });
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const formatter = useMemo(
      () =>
        new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: !use24Hour,
          timeZone: "America/Toronto",
        }),
      [use24Hour]
    );

    const timeParts = formatter.formatToParts(date);
    const hour = timeParts.find((p) => p.type === "hour")?.value || "";
    const minute = timeParts.find((p) => p.type === "minute")?.value || "";
    const period = use24Hour
      ? ""
      : timeParts.find((p) => p.type === "dayPeriod")?.value || "";

    const timeString = `${hour}:${minute}`;

    /*
     * HISTORY:
     * Attempt 18: Deep Structure + Position Content.
     * 1. RESTORED Deep Structure (Root->Button->Inner) from Attempt 16 (fixes sliding).
     * 2. CHANGED Content to `layout="position"` (fixes stretching).
     *    - Root/Button/Inner handle the layout/resize/slide (Full Layout).
     *    - Text Content opts out of scaling via `layout="position"`.
     */
    return (
      <motion.div
        className="flex min-w-[7ch] items-center justify-center md:min-w-[10ch]"
        layout
        transition={layoutTransition}
      >
        <WithHover>
          <motion.button
            aria-label="Toggle time format"
            className="relative z-10 flex h-5 w-full cursor-pointer items-center justify-center rounded-sm px-2 py-0.5 text-foreground transition-colors md:h-8 md:px-3"
            layout
            onClick={() => setUse24Hour(!use24Hour)}
            onMouseEnter={() => setHoveredId("time")}
            onMouseLeave={() => setHoveredId(null)}
            transition={layoutTransition}
          >
            {hoveredId === "time" ? (
              <motion.div
                animate={{ opacity: 1 }}
                className="absolute inset-0 -z-10 hidden rounded-sm bg-muted/40 md:block"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                layoutId="pill-hover"
              />
            ) : null}

            {mounted ? (
              <motion.div
                className="flex items-center gap-0.5 whitespace-nowrap font-semibold tabular-nums"
                layout
                transition={layoutTransition}
              >
                <ScrambleTicker
                  layout="position"
                  layoutTransition={layoutTransition}
                  scrambleProps={{ speed: 0.8, scramble: 3 }}
                  text={timeString}
                />
                <motion.span
                  animate={{
                    width: use24Hour ? 0 : "auto",
                    opacity: use24Hour ? 0 : 0.5,
                    marginLeft: use24Hour ? 0 : 2,
                  }}
                  className="overflow-hidden text-[10px] uppercase tracking-wider md:text-xs"
                  initial={false}
                  layout="position"
                  transition={layoutTransition}
                >
                  {period || "AM"}
                </motion.span>
              </motion.div>
            ) : (
              <div className="h-4 w-[5ch] bg-transparent" />
            )}
          </motion.button>
        </WithHover>
      </motion.div>
    );
  }
);

TimePill.displayName = "TimePill";
