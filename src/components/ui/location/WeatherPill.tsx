"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { memo } from "react";
import type { WeatherData } from "@/hooks/useWeather";
import { WithHover } from "../cursor/WithHover";
import { LottieWeatherIcon } from "../LottieWeatherIcon";
import { ScrambleTicker } from "../ScrambleTicker";

interface WeatherPillProps {
  hoveredId: string | null;
  layoutTransition: Transition;
  setHoveredId: (id: string | null) => void;
  tempUnitLabel: string;
  tempValue: number | null;
  toggleUnit: () => void;
  weather: WeatherData | null;
}

export const WeatherPill = memo(
  ({
    weather,
    tempValue,
    tempUnitLabel,
    toggleUnit,
    hoveredId,
    setHoveredId,
    layoutTransition,
  }: WeatherPillProps) => {
    return (
      <motion.div
        className="flex min-w-[8ch] items-center justify-center md:min-w-[12ch]"
        layout
        transition={layoutTransition}
      >
        <AnimatePresence initial={false} mode="wait">
          {weather ? (
            <WithHover>
              <motion.button
                aria-label="Toggle temperature unit"
                className="relative z-60 flex h-5 w-full cursor-pointer items-center justify-center gap-1.5 rounded-sm px-2 py-0.5 text-foreground transition-colors md:h-8 md:gap-2 md:px-3"
                key="weather"
                layout
                onClick={toggleUnit}
                onMouseEnter={() => setHoveredId("weather")}
                onMouseLeave={() => setHoveredId(null)}
                transition={layoutTransition}
              >
                {hoveredId === "weather" ? (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 -z-10 hidden rounded-sm bg-muted/40 md:block"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    layoutId="pill-hover"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                ) : null}
                <LottieWeatherIcon
                  code={weather.weatherCode}
                  isNight={!weather.isDay}
                />

                <motion.div
                  className="flex items-center gap-0.5 font-semibold tabular-nums"
                  layout
                  transition={layoutTransition}
                >
                  <ScrambleTicker
                    layoutTransition={layoutTransition}
                    text={tempValue === null ? "" : String(tempValue)}
                  />
                  <motion.span
                    className="text-[10px] uppercase tracking-wider opacity-50 md:text-xs"
                    layout
                    transition={layoutTransition}
                  >
                    {tempUnitLabel}
                  </motion.span>
                </motion.div>
              </motion.button>
            </WithHover>
          ) : (
            <motion.div
              animate={{ opacity: 1 }}
              className="flex h-5 w-full items-center justify-center gap-1.5 px-2 py-0.5 md:h-8 md:gap-2 md:px-3"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="skeleton"
              layout
              transition={layoutTransition}
            >
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted-foreground/10 md:h-6 md:w-6" />
              <div className="h-3 w-6 animate-pulse rounded-sm bg-muted-foreground/10 md:h-4 md:w-8" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

WeatherPill.displayName = "WeatherPill";
