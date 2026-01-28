"use client";

import { memo } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { ScrambleTicker } from "../ScrambleTicker";
import { WithHover } from "../cursor/WithHover";
import { LottieWeatherIcon } from "../LottieWeatherIcon";
import { WeatherData } from "@/hooks/useWeather";

interface WeatherPillProps {
    weather: WeatherData | null;
    tempValue: number | null;
    tempUnitLabel: string;
    toggleUnit: () => void;
    hoveredId: string | null;
    setHoveredId: (id: string | null) => void;
    layoutTransition: Transition;
}

export const WeatherPill = memo(({
    weather,
    tempValue,
    tempUnitLabel,
    toggleUnit,
    hoveredId,
    setHoveredId,
    layoutTransition
}: WeatherPillProps) => {
    return (
        <motion.div
            layout
            transition={layoutTransition}
            className="flex items-center justify-center min-w-[8ch] md:min-w-[12ch]"
        >
            <AnimatePresence mode="wait" initial={false}>
                {weather ? (
                    <WithHover>
                        <motion.button
                            key="weather"
                            layout
                            transition={layoutTransition}
                            onClick={toggleUnit}
                            onMouseEnter={() => setHoveredId('weather')}
                            onMouseLeave={() => setHoveredId(null)}
                            className="relative z-[60] flex items-center gap-1.5 md:gap-2 text-foreground transition-colors cursor-pointer px-2 py-0.5 md:px-3 rounded-sm h-5 md:h-8 justify-center w-full"
                            aria-label="Toggle temperature unit"
                        >
                            {hoveredId === 'weather' ? (
                                <motion.div
                                    layoutId="pill-hover"
                                    className="absolute inset-0 bg-muted/40 rounded-sm -z-10 hidden md:block"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            ) : null}
                            <LottieWeatherIcon code={weather.weatherCode} isNight={!weather.isDay} />

                            <motion.div
                                layout
                                transition={layoutTransition}
                                className="flex items-center gap-0.5 font-semibold tabular-nums"
                            >
                                <ScrambleTicker
                                    text={tempValue !== null ? String(tempValue) : ""}
                                    layoutTransition={layoutTransition}
                                />
                                <motion.span
                                    layout
                                    transition={layoutTransition}
                                    className="text-[10px] md:text-xs uppercase tracking-wider opacity-50"
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
                        className="flex items-center gap-1.5 md:gap-2 px-2 py-0.5 md:px-3 h-5 md:h-8 w-full justify-center"
                    >
                        <div className="w-4 h-4 md:w-6 md:h-6 bg-muted-foreground/10 animate-pulse rounded-full" />
                        <div className="w-6 h-3 md:w-8 md:h-4 bg-muted-foreground/10 animate-pulse rounded-sm" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

WeatherPill.displayName = "WeatherPill";
