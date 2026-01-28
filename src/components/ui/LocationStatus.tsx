"use client";

import { useState, useEffect, useId } from "react";
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
import { Icons } from "./icons";

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

    // Responsive State
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia("(min-width: 768px)");
        setIsDesktop(mql.matches);
        const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    // Measure own size for the Liquid Glass Filter
    const { ref: pillRef, width, height } = useElementSize<HTMLDivElement>();
    const RADIUS = isDesktop ? 12 : 6; // 6 for md, 12 for xl
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
                    "flex items-center gap-0.5 md:gap-1 bg-muted/20 border border-border/50 px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-md md:rounded-xl shadow-sm w-full md:w-auto justify-between md:justify-start",
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
                        className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm px-2 py-0.5 md:px-3 h-5 md:h-8 min-w-[8ch] md:min-w-[10ch]"
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
                        className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm px-2 py-0.5 md:px-3 h-5 md:h-8"
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
                    className="flex items-center justify-center min-w-[8ch] md:min-w-[10ch]"
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
                                    className="relative z-[60] flex items-center gap-1.5 md:gap-2 text-foreground transition-colors cursor-pointer px-2 py-0.5 md:px-3 rounded-sm h-5 md:h-8 justify-center w-full"
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

                <motion.span
                    layout
                    animate={{ opacity: [0.1, 0.3, 0.1] }}
                    transition={{
                        layout: { type: "spring", stiffness: 220, damping: 40, mass: 1 },
                        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2.5 }
                    }}
                    className="opacity-20 font-light select-none cursor-default hidden md:inline"
                >
                    •
                </motion.span>

                {/* Social Links Section */}
                <div className="hidden md:flex items-center gap-0.5">
                    <WithHover>
                        <motion.a
                            layout
                            transition={layoutTransition}
                            href="https://github.com/raztronaut"
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => setHoveredId('github')}
                            onMouseLeave={() => setHoveredId(null)}
                            className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm w-7 h-5 md:w-9 md:h-8"
                            aria-label="GitHub"
                            data-umami-event="github_click"
                            data-umami-event-type="profile"
                        >
                            {hoveredId === 'github' && (
                                <motion.div
                                    layoutId="pill-hover"
                                    className="absolute inset-0 bg-muted/40 rounded-sm -z-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            <Icons.GitHub className="h-5 w-5" />
                        </motion.a>
                    </WithHover>
                    <WithHover>
                        <motion.a
                            layout
                            transition={layoutTransition}
                            href="https://x.com/raztronaut"
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => setHoveredId('x')}
                            onMouseLeave={() => setHoveredId(null)}
                            className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm w-7 h-5 md:w-9 md:h-8"
                            aria-label="X (Twitter)"
                            data-umami-event="social_click"
                            data-umami-event-platform="x"
                        >
                            {hoveredId === 'x' && (
                                <motion.div
                                    layoutId="pill-hover"
                                    className="absolute inset-0 bg-muted/40 rounded-sm -z-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            <Icons.X className="h-5 w-5" />
                        </motion.a>
                    </WithHover>
                    <WithHover>
                        <motion.a
                            layout
                            transition={layoutTransition}
                            href="https://linkedin.com/in/raztronaut"
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => setHoveredId('linkedin')}
                            onMouseLeave={() => setHoveredId(null)}
                            className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm w-7 h-5 md:w-9 md:h-8"
                            aria-label="LinkedIn"
                            data-umami-event="social_click"
                            data-umami-event-platform="linkedin"
                        >
                            {hoveredId === 'linkedin' && (
                                <motion.div
                                    layoutId="pill-hover"
                                    className="absolute inset-0 bg-muted/40 rounded-sm -z-10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            <Icons.Linkedin className="h-5 w-5" />
                        </motion.a>
                    </WithHover>
                </div>
            </motion.div>
        </motion.div >
    );

}
