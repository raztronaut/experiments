"use client";

import Lottie from "lottie-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";

// Mappings for Day/Night Specific Icons
const weatherIcons: Record<number, { day: string; night: string }> = {
  // Clear
  0: { day: "sun-hot.json", night: "moon-full.json" },

  // Mainly clear, partly cloudy, overcast
  1: { day: "partly-cloudy-day.json", night: "partly-cloudy-night.json" },
  2: { day: "partly-cloudy-day.json", night: "partly-cloudy-night.json" },
  3: { day: "overcast-day.json", night: "overcast-night.json" },

  // Fog
  45: { day: "fog.json", night: "fog-night.json" },
  48: { day: "fog.json", night: "fog-night.json" },

  // Drizzle
  51: {
    day: "partly-cloudy-day-drizzle.json",
    night: "partly-cloudy-night-drizzle.json",
  },
  53: {
    day: "partly-cloudy-day-drizzle.json",
    night: "partly-cloudy-night-drizzle.json",
  },
  55: { day: "overcast-drizzle.json", night: "overcast-night-drizzle.json" },

  // Freezing Drizzle
  56: {
    day: "partly-cloudy-day-sleet.json",
    night: "partly-cloudy-night-sleet.json",
  },
  57: { day: "overcast-sleet.json", night: "overcast-night-sleet.json" },

  // Rain
  61: {
    day: "partly-cloudy-day-rain.json",
    night: "partly-cloudy-night-rain.json",
  },
  63: { day: "rain.json", night: "rain.json" },
  65: { day: "rain.json", night: "rain.json" },

  // Freezing Rain
  66: { day: "sleet.json", night: "sleet.json" },
  67: { day: "sleet.json", night: "sleet.json" },

  // Snow
  71: {
    day: "partly-cloudy-day-snow.json",
    night: "partly-cloudy-night-snow.json",
  },
  73: { day: "snow.json", night: "snow.json" },
  75: { day: "snow.json", night: "snow.json" },
  77: { day: "snowflake.json", night: "snowflake.json" }, // Snow grains

  // Rain showers
  80: {
    day: "partly-cloudy-day-rain.json",
    night: "partly-cloudy-night-rain.json",
  },
  81: {
    day: "partly-cloudy-day-rain.json",
    night: "partly-cloudy-night-rain.json",
  },
  82: {
    day: "thunderstorms-day-rain.json",
    night: "thunderstorms-night-rain.json",
  },

  // Snow showers
  85: {
    day: "partly-cloudy-day-snow.json",
    night: "partly-cloudy-night-snow.json",
  },
  86: {
    day: "thunderstorms-day-snow.json",
    night: "thunderstorms-day-snow.json",
  },

  // Thunderstorm
  95: { day: "thunderstorms-day.json", night: "thunderstorms-night.json" },

  // Thunderstorm with hail
  96: {
    day: "thunderstorms-day-rain.json",
    night: "thunderstorms-night-rain.json",
  },
  99: {
    day: "thunderstorms-extreme.json",
    night: "thunderstorms-extreme.json",
  },
};

export function LottieWeatherIcon({
  code,
  isNight,
}: {
  code: number;
  isNight: boolean;
}) {
  const [animationData, setAnimationData] = useState<unknown>(null);
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  useEffect(() => {
    const loadLottie = async () => {
      // Fallback to sun/moon if code not found
      const mapping = weatherIcons[code] || weatherIcons[0];
      const filename = isNight ? mapping.night : mapping.day;

      try {
        // Dynamically import the JSON file
        // Note: We need to use the public path or import them.
        // Since they are in public/, we can fetch them.
        const response = await fetch(`/weather/line/lottie/${filename}`);
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Failed to load weather icon:", filename, error);
      }
    };

    loadLottie();
  }, [code, isNight]);

  // In light mode, the icons (especially clouds) can be too faint.
  // We apply a brightness filter to make them more visible while preserving relative colors.
  const isLightMode = mounted && resolvedTheme === "light";

  return (
    <div
      className={cn(
        "relative z-[50] -my-1 flex h-6 w-6 items-center justify-center transition-all duration-300 md:h-8 md:w-8",
        isLightMode && "brightness-[0.4] saturate-[1.2]"
      )}
    >
      {animationData ? (
        <Lottie
          animationData={animationData}
          className="h-full w-full"
          loop={true}
        />
      ) : (
        <div className="h-4 w-4 animate-pulse rounded-full bg-muted-foreground/10 capitalize md:h-6 md:w-6" />
      )}
    </div>
  );
}
