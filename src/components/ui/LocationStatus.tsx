"use client";

import { motion } from "motion/react";
import { useId, useState } from "react";
import { useElementSize } from "@/hooks/useElementSize";
import { useLiquidGlassStyle } from "@/hooks/useLiquidGlassStyle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePreferences } from "@/hooks/usePreferences";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useWeather } from "@/hooks/useWeather";
import { spaceGrotesk } from "@/lib/fonts";
import { cn } from "@/lib/utils";

import { LiquidGlassFilter } from "./LiquidGlassFilter";
import { LocationPill } from "./location/LocationPill";
import { SocialPills } from "./location/SocialPills";
import { TimePill } from "./location/TimePill";
import { WeatherPill } from "./location/WeatherPill";

const layoutTransition = {
  type: "spring",
  stiffness: 350,
  damping: 35,
  mass: 1,
} as const;

export function LocationStatus() {
  const {
    showCoords,
    setShowCoords,
    use24Hour,
    setUse24Hour,
    tempUnit,
    toggleUnit,
    tempUnitLabel,
    mounted,
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
    fallbackBlur: 10,
  });

  const hasSize = width > 0 && height > 0;

  return (
    <motion.div
      className={cn(
        "flex w-full select-none flex-wrap items-center gap-2 text-sm md:w-auto md:text-base",
        spaceGrotesk.className
      )}
      layout
      transition={layoutTransition}
    >
      <LiquidGlassFilter
        displacementScale={isDesktop ? 16 : 12}
        height={height}
        id={`liquid-glass-${filterId}`}
        radius={RADIUS}
        width={width}
      />
      <motion.div
        className={cn(
          "flex min-h-[28px] w-full items-center justify-between gap-0.5 rounded-md border border-border/50 bg-muted/20 px-3 py-1 shadow-sm md:min-h-[46px] md:w-auto md:justify-start md:gap-1 md:rounded-xl md:px-2.5 md:py-1.5",
          "group/pill relative transition-shadow duration-500",
          effectiveIsNight ? "shadow-blue-500/5" : "shadow-orange-500/5"
        )}
        layout
        ref={pillRef}
        style={hasSize ? glassStyle : {}}
        transition={layoutTransition}
      >
        {mounted ? (
          <>
            <motion.div
              className="flex flex-1 justify-start md:flex-none"
              layout
              transition={layoutTransition}
            >
              <LocationPill
                hoveredId={hoveredId}
                layoutTransition={layoutTransition}
                setHoveredId={setHoveredId}
                setShowCoords={setShowCoords}
                showCoords={showCoords}
              />
            </motion.div>

            <motion.div
              className="flex items-center"
              layout
              transition={layoutTransition}
            >
              <motion.span
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                className="cursor-default select-none font-light opacity-20"
                transition={{
                  opacity: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }}
              >
                •
              </motion.span>
            </motion.div>

            <motion.div
              className="flex flex-1 justify-center md:flex-none"
              layout
              transition={layoutTransition}
            >
              <TimePill
                hoveredId={hoveredId}
                layoutTransition={layoutTransition}
                setHoveredId={setHoveredId}
                setUse24Hour={setUse24Hour}
                use24Hour={use24Hour}
              />
            </motion.div>

            <motion.div
              className="flex items-center"
              layout
              transition={layoutTransition}
            >
              <motion.span
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                className="cursor-default select-none font-light opacity-20"
                transition={{
                  opacity: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 1.5,
                  },
                }}
              >
                •
              </motion.span>
            </motion.div>

            <motion.div
              className="flex flex-1 justify-end md:flex-none"
              layout
              transition={layoutTransition}
            >
              <WeatherPill
                hoveredId={hoveredId}
                layoutTransition={layoutTransition}
                setHoveredId={setHoveredId}
                tempUnitLabel={tempUnitLabel}
                tempValue={tempValue}
                toggleUnit={toggleUnit}
                weather={torontoWeather}
              />
            </motion.div>

            <motion.div
              className="hidden items-center md:flex"
              layout
              transition={layoutTransition}
            >
              <motion.span
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                className="cursor-default select-none font-light opacity-20"
                transition={{
                  opacity: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: 2.5,
                  },
                }}
              >
                •
              </motion.span>
            </motion.div>

            <motion.div
              className="hidden md:block"
              layout
              transition={layoutTransition}
            >
              <SocialPills
                hoveredId={hoveredId}
                layoutTransition={layoutTransition}
                setHoveredId={setHoveredId}
              />
            </motion.div>
          </>
        ) : (
          <div className="flex w-full items-center opacity-20 md:w-auto md:gap-4">
            <div className="flex flex-1 justify-start md:flex-none">
              <div className="h-4 w-16 animate-pulse rounded-full bg-foreground/20" />
            </div>
            <div className="flex flex-1 justify-center md:flex-none">
              <div className="h-4 w-12 animate-pulse rounded-full bg-foreground/20" />
            </div>
            <div className="flex flex-1 justify-end md:flex-none">
              <div className="h-4 w-14 animate-pulse rounded-full bg-foreground/20" />
            </div>
            <div className="hidden md:block">
              <div className="h-4 w-24 animate-pulse rounded-full bg-foreground/20" />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
