"use client";

import { memo, useEffect, useState, useMemo } from "react";
import { motion, Transition } from "framer-motion";
import { ScrambleTicker } from "../ScrambleTicker";
import { WithHover } from "../cursor/WithHover";
import { useMounted } from "@/hooks/useMounted";

interface TimePillProps {
    use24Hour: boolean;
    setUse24Hour: (use: boolean) => void;
    hoveredId: string | null;
    setHoveredId: (id: string | null) => void;
    layoutTransition: Transition;
}

export const TimePill = memo(({
    use24Hour,
    setUse24Hour,
    hoveredId,
    setHoveredId,
    layoutTransition
}: TimePillProps) => {
    const mounted = useMounted();
    const [date, setDate] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            // Only trigger re-render if the minute has changed
            setDate(prev => {
                if (prev.getMinutes() !== now.getMinutes()) {
                    return now;
                }
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatter = useMemo(() => new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: !use24Hour,
        timeZone: "America/Toronto"
    }), [use24Hour]);

    const timeParts = formatter.formatToParts(date);
    const hour = timeParts.find(p => p.type === "hour")?.value || "";
    const minute = timeParts.find(p => p.type === "minute")?.value || "";
    const period = !use24Hour ? (timeParts.find(p => p.type === "dayPeriod")?.value || "") : "";

    const timeString = `${hour}:${minute}`;

    /*
     * HISTORY:
     * Attempt 12: Chain Layout Position.
     * Strategy: Deep Layout Position.
     * 1. Reduce re-renders (check minute change).
     * 2. Wrapper uses layout="position".
     * 3. ScrambleTicker ALSO uses layout="position" (via new prop).
     * This creates a consistent "Do Not Scale" chain for the text content.
     */
    return (
        <WithHover>
            <motion.button
                layout
                transition={layoutTransition}
                onClick={() => setUse24Hour(!use24Hour)}
                onMouseEnter={() => setHoveredId('time')}
                onMouseLeave={() => setHoveredId(null)}
                className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm px-2 py-0.5 md:px-3 h-5 md:h-8 w-full min-w-[7ch] md:min-w-[9ch]"
                aria-label="Toggle time format"
            >
                {hoveredId === 'time' ? (
                    <motion.div
                        layoutId="pill-hover"
                        className="absolute inset-0 bg-muted/40 rounded-sm -z-10 hidden md:block"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                ) : null}

                {mounted ? (
                    <motion.div
                        layout="position"
                        transition={layoutTransition}
                        className="flex items-center gap-0.5 font-semibold tabular-nums whitespace-nowrap"
                    >
                        <ScrambleTicker
                            text={timeString}
                            scrambleProps={{ speed: 0.8, scramble: 3 }}
                            layoutTransition={layoutTransition}
                            layout="position"
                        />
                        <motion.span
                            initial={false}
                            animate={{
                                width: !use24Hour ? "auto" : 0,
                                opacity: !use24Hour ? 0.5 : 0,
                                marginLeft: !use24Hour ? 2 : 0
                            }}
                            transition={layoutTransition}
                            className="text-[10px] md:text-xs uppercase tracking-wider overflow-hidden"
                        >
                            {/* Always render AM/PM, just hide it */}
                            {period || "AM"}
                        </motion.span>
                    </motion.div>
                ) : (
                    <div className="w-[5ch] h-4 bg-transparent" />
                )}
            </motion.button>
        </WithHover>
    );
});

TimePill.displayName = "TimePill";
