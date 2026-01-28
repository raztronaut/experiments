"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { spaceGrotesk } from "@/lib/fonts";

import { usePreferences } from "@/hooks/usePreferences";
import { useWeather } from "@/hooks/useWeather";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useElementSize } from "@/hooks/useElementSize";
import { useLiquidGlassStyle } from "@/hooks/useLiquidGlassStyle";
import { TimeTicker } from "./TimeTicker";
import { ScrambleTicker } from "./ScrambleTicker";
import { WithHover } from "./cursor/WithHover";
import { LiquidGlassFilter } from "./LiquidGlassFilter";
import { LottieWeatherIcon } from "./LottieWeatherIcon";

const layoutTransition = { type: "spring", stiffness: 220, damping: 40, mass: 1 } as const;

export function LocationStatus() {
    const {
        showCoords, setShowCoords,
        use24Hour, setUse24Hour,
        tempUnit, toggleUnit, tempUnitLabel
    } = usePreferences();

    const { weather: torontoWeather, tempValue } = useWeather(tempUnit);

    // We use a less frequent update for the "isNight" status to avoid second-by-second re-renders of the whole pill
    const { isNight: effectiveIsNight } = useTimeOfDay();

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Measure own size for the Liquid Glass Filter
    const { ref: pillRef, width, height } = useElementSize<HTMLDivElement>();
    const RADIUS = 6; // Matches rounded-md

    const glassStyle = useLiquidGlassStyle({
        filterId: "liquid-glass-location",
        fallbackBlur: 10
    });

    const hasSize = width > 0 && height > 0;

    return (
        <motion.div
            layout
            transition={layoutTransition}
            className={cn("flex flex-wrap items-center gap-2 text-sm select-none w-full md:w-auto", spaceGrotesk.className)}
        >
            <LiquidGlassFilter
                id="liquid-glass-location"
                width={width}
                height={height}
                radius={RADIUS}
                displacementScale={12} // Slightly stronger than default
            />
            <motion.div
                ref={pillRef}
                layout
                transition={layoutTransition}
                style={hasSize ? glassStyle : {}}
                className={cn(
                    "flex items-center gap-0.5 bg-muted/20 border border-border/50 px-1.5 py-1 rounded-md shadow-sm w-full md:w-auto justify-between md:justify-start",
                    "relative group/pill transition-shadow duration-500",
                    effectiveIsNight ? "shadow-blue-500/5" : "shadow-orange-500/5"
                )}
            >

                {/* Dynamic Glow Background */}


                <WithHover>
                    <motion.button
                        layout
                        transition={layoutTransition}
                        onClick={() => setShowCoords(!showCoords)}
                        onMouseEnter={() => setHoveredId('location')}
                        onMouseLeave={() => setHoveredId(null)}
                        className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm px-2 py-0.5 h-5 min-w-[8ch]"
                        aria-label="Toggle location format"
                    >
                        {hoveredId === 'location' && (
                            <motion.div
                                layoutId="pill-hover"
                                className="absolute inset-0 bg-muted/40 rounded-sm -z-10 hidden md:block"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}
                        {/* Mobile Text (Compact) */}
                        <ScrambleTicker
                            text={showCoords ? "43°N 79°W" : "TORONTO"}
                            align="center"
                            className="font-semibold tracking-tight tabular-nums md:hidden block"
                        />
                        {/* Desktop Text (Full) */}
                        <ScrambleTicker
                            text={showCoords ? "43°39'N 79°23'W" : "TORONTO"}
                            align="center"
                            className="font-semibold tracking-tight tabular-nums hidden md:block"
                        />
                    </motion.button>
                </WithHover>

                <motion.span
                    layout
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{
                        layout: { type: "spring", stiffness: 220, damping: 40, mass: 1 },
                        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="opacity-20 font-light select-none cursor-default"
                >
                    •
                </motion.span>

                {/* Time Ticker Section */}
                <WithHover>
                    <motion.button
                        layout
                        transition={layoutTransition}
                        onClick={() => setUse24Hour(!use24Hour)}
                        onMouseEnter={() => setHoveredId('time')}
                        onMouseLeave={() => setHoveredId(null)}
                        className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm px-2 py-0.5 h-5"
                        aria-label="Toggle time format"
                    >
                        {hoveredId === 'time' && (
                            <motion.div
                                layoutId="pill-hover"
                                className="absolute inset-0 bg-muted/40 rounded-sm -z-10 hidden md:block"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        )}
                        <TimeTicker timeZone="America/Toronto" use24Hour={use24Hour} />
                    </motion.button>
                </WithHover>

                <motion.span
                    layout
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{
                        layout: { type: "spring", stiffness: 220, damping: 40, mass: 1 },
                        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
                    }}
                    className="opacity-20 font-light select-none cursor-default"
                >
                    •
                </motion.span>

                {/* Weather Section */}
                <motion.div
                    layout
                    transition={layoutTransition}
                    className="flex items-center justify-center"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {torontoWeather ? (
                            <WithHover>
                                <motion.button
                                    key="weather"
                                    layout
                                    transition={layoutTransition}
                                    onClick={toggleUnit}
                                    onMouseEnter={() => setHoveredId('weather')}
                                    onMouseLeave={() => setHoveredId(null)}
                                    className="relative z-[60] flex items-center gap-1.5 text-foreground transition-colors cursor-pointer px-2 py-0.5 rounded-sm h-5 justify-center min-w-[8ch]"
                                    aria-label="Toggle temperature unit"
                                >
                                    {hoveredId === 'weather' && (
                                        <motion.div
                                            layoutId="pill-hover"
                                            className="absolute inset-0 bg-muted/40 rounded-sm -z-10 hidden md:block"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <LottieWeatherIcon code={torontoWeather.weatherCode} isNight={!torontoWeather.isDay} />

                                    <motion.div
                                        layout
                                        transition={layoutTransition}
                                        className="flex items-center gap-0.5 font-semibold tabular-nums"
                                    >
                                        <ScrambleTicker
                                            text={tempValue !== null ? String(tempValue) : ""}
                                        />
                                        <motion.span
                                            layout
                                            transition={layoutTransition}
                                            className="text-[10px] uppercase tracking-wider opacity-50"
                                        >
                                            {tempUnitLabel}
                                        </motion.span>
                                    </motion.div>
                                </motion.button>
                            </WithHover>
                        ) : (
                            <motion.div
                                key="skeleton"
                                layout
                                transition={layoutTransition}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-12 h-3 bg-muted-foreground/10 animate-pulse rounded-sm mx-2"
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </motion.div>
    );

}
