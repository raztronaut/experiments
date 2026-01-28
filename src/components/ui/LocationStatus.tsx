"use client";

import { useState, useId } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { spaceGrotesk } from "@/lib/fonts";

import { usePreferences } from "@/hooks/usePreferences";
import { useWeather } from "@/hooks/useWeather";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useElementSize } from "@/hooks/useElementSize";
import { useLiquidGlassStyle } from "@/hooks/useLiquidGlassStyle";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { LiquidGlassFilter } from "./LiquidGlassFilter";
import { LocationPill } from "./location/LocationPill";
import { TimePill } from "./location/TimePill";
import { WeatherPill } from "./location/WeatherPill";
import { SocialPills } from "./location/SocialPills";

const layoutTransition = { type: "spring", stiffness: 350, damping: 35, mass: 1 } as const;

export function LocationStatus() {
    const {
        showCoords, setShowCoords,
        use24Hour, setUse24Hour,
        tempUnit, toggleUnit, tempUnitLabel,
        mounted
    } = usePreferences();

    const { weather: torontoWeather, tempValue } = useWeather(tempUnit);
    const { isNight: effectiveIsNight } = useTimeOfDay();
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const isDesktop = useMediaQuery("(min-width: 768px)");

    // Measure size for Liquid Glass Filter
    const { ref: pillRef, width, height } = useElementSize<HTMLDivElement>();
    const RADIUS = isDesktop ? 12 : 6;
    const filterId = useId().replace(/:/g, "");

    const glassStyle = useLiquidGlassStyle({
        filterId: `liquid-glass-${filterId}`,
        fallbackBlur: 10
    });

    const hasSize = width > 0 && height > 0;

    return (
        <motion.div
            layout
            transition={layoutTransition}
            className={cn("flex flex-wrap items-center gap-2 text-sm md:text-base select-none w-full md:w-auto", spaceGrotesk.className)}
        >
            <LiquidGlassFilter
                id={`liquid-glass-${filterId}`}
                width={width}
                height={height}
                radius={RADIUS}
                displacementScale={isDesktop ? 16 : 12}
            />
            <motion.div
                ref={pillRef}
                layout
                transition={layoutTransition}
                style={hasSize ? glassStyle : {}}
                className={cn(
                    "flex items-center gap-0.5 md:gap-1 bg-muted/20 border border-border/50 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-md md:rounded-xl shadow-sm w-full md:w-auto justify-between md:justify-start min-h-[28px] md:min-h-[46px]",
                    "relative group/pill transition-shadow duration-500",
                    effectiveIsNight ? "shadow-blue-500/5" : "shadow-orange-500/5"
                )}
            >
                {mounted ? (
                    <>
                        <motion.div layout transition={layoutTransition}>
                            <LocationPill
                                showCoords={showCoords}
                                setShowCoords={setShowCoords}
                                hoveredId={hoveredId}
                                setHoveredId={setHoveredId}
                                layoutTransition={layoutTransition}
                            />
                        </motion.div>

                        <motion.div layout transition={layoutTransition} className="flex items-center">
                            <motion.span
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{
                                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                }}
                                className="opacity-20 font-light select-none cursor-default"
                            >
                                •
                            </motion.span>
                        </motion.div>

                        <motion.div layout transition={layoutTransition}>
                            <TimePill
                                use24Hour={use24Hour}
                                setUse24Hour={setUse24Hour}
                                hoveredId={hoveredId}
                                setHoveredId={setHoveredId}
                                layoutTransition={layoutTransition}
                            />
                        </motion.div>

                        <motion.div layout transition={layoutTransition} className="flex items-center">
                            <motion.span
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{
                                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
                                }}
                                className="opacity-20 font-light select-none cursor-default"
                            >
                                •
                            </motion.span>
                        </motion.div>

                        <motion.div layout transition={layoutTransition}>
                            <WeatherPill
                                weather={torontoWeather}
                                tempValue={tempValue}
                                tempUnitLabel={tempUnitLabel}
                                toggleUnit={toggleUnit}
                                hoveredId={hoveredId}
                                setHoveredId={setHoveredId}
                                layoutTransition={layoutTransition}
                            />
                        </motion.div>

                        <motion.div layout transition={layoutTransition} className="hidden md:flex items-center">
                            <motion.span
                                animate={{ opacity: [0.1, 0.3, 0.1] }}
                                transition={{
                                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2.5 }
                                }}
                                className="opacity-20 font-light select-none cursor-default"
                            >
                                •
                            </motion.span>
                        </motion.div>

                        <motion.div layout transition={layoutTransition}>
                            <SocialPills
                                hoveredId={hoveredId}
                                setHoveredId={setHoveredId}
                                layoutTransition={layoutTransition}
                            />
                        </motion.div>
                    </>
                ) : (
                    <div className="flex items-center gap-4 px-2 opacity-20">
                        <div className="w-16 h-4 bg-foreground/20 rounded-full animate-pulse" />
                        <div className="w-12 h-4 bg-foreground/20 rounded-full animate-pulse" />
                        <div className="w-14 h-4 bg-foreground/20 rounded-full animate-pulse" />
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
