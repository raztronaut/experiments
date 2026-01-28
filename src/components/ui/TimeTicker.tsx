"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMounted } from "@/hooks/useMounted";
import { ScrambleTicker } from "./ScrambleTicker";

const layoutTransition = { type: "spring", stiffness: 220, damping: 40, mass: 1 } as const;

export function TimeTicker({
    className,
    timeZone,
    use24Hour = false
}: {
    className?: string;
    timeZone?: string;
    use24Hour?: boolean;
}) {
    const mounted = useMounted();
    const [date, setDate] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setDate(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatter = useMemo(() => new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: !use24Hour,
        timeZone
    }), [use24Hour, timeZone]);

    const timeParts = formatter.formatToParts(date);
    const hour = timeParts.find(p => p.type === "hour")?.value || "";
    const minute = timeParts.find(p => p.type === "minute")?.value || "";
    const period = !use24Hour ? (timeParts.find(p => p.type === "dayPeriod")?.value || "") : "";

    const timeString = `${hour}:${minute}`;

    // Avoid hydration mismatch by not rendering time-dependent UI until mounted
    if (!mounted) return (
        <div className={cn("inline-flex items-center h-5 md:h-8 w-[9ch]", className)} />
    );

    return (
        <motion.div
            layout="position"
            transition={layoutTransition}
            className={cn("inline-flex items-center tabular-nums leading-none select-none", className)}
        >
            <motion.div
                layout="position"
                transition={layoutTransition}
                className="relative h-5 md:h-8 flex items-center justify-center"
            >
                <motion.div
                    layout="position"
                    transition={layoutTransition}
                    className="flex items-center gap-0.5 font-semibold tabular-nums whitespace-nowrap"
                >
                    <ScrambleTicker
                        text={timeString}
                        scrambleProps={{ speed: 0.8, scramble: 3 }}
                    />
                    {period && (
                        <motion.span
                            layout="position"
                            transition={layoutTransition}
                            className="text-[10px] md:text-xs uppercase tracking-wider opacity-50"
                        >
                            {period}
                        </motion.span>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
