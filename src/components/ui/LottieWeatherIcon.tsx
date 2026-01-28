"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

// Mappings for Day/Night Specific Icons
const weatherIcons: Record<number, { day: string, night: string }> = {
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
    51: { day: "partly-cloudy-day-drizzle.json", night: "partly-cloudy-night-drizzle.json" },
    53: { day: "partly-cloudy-day-drizzle.json", night: "partly-cloudy-night-drizzle.json" },
    55: { day: "overcast-drizzle.json", night: "overcast-night-drizzle.json" },

    // Freezing Drizzle
    56: { day: "partly-cloudy-day-sleet.json", night: "partly-cloudy-night-sleet.json" },
    57: { day: "overcast-sleet.json", night: "overcast-night-sleet.json" },

    // Rain
    61: { day: "partly-cloudy-day-rain.json", night: "partly-cloudy-night-rain.json" },
    63: { day: "rain.json", night: "rain.json" },
    65: { day: "rain.json", night: "rain.json" },

    // Freezing Rain
    66: { day: "sleet.json", night: "sleet.json" },
    67: { day: "sleet.json", night: "sleet.json" },

    // Snow
    71: { day: "partly-cloudy-day-snow.json", night: "partly-cloudy-night-snow.json" },
    73: { day: "snow.json", night: "snow.json" },
    75: { day: "snow.json", night: "snow.json" },
    77: { day: "snowflake.json", night: "snowflake.json" }, // Snow grains

    // Rain showers
    80: { day: "partly-cloudy-day-rain.json", night: "partly-cloudy-night-rain.json" },
    81: { day: "partly-cloudy-day-rain.json", night: "partly-cloudy-night-rain.json" },
    82: { day: "thunderstorms-day-rain.json", night: "thunderstorms-night-rain.json" },

    // Snow showers
    85: { day: "partly-cloudy-day-snow.json", night: "partly-cloudy-night-snow.json" },
    86: { day: "thunderstorms-day-snow.json", night: "thunderstorms-day-snow.json" },

    // Thunderstorm
    95: { day: "thunderstorms-day.json", night: "thunderstorms-night.json" },

    // Thunderstorm with hail
    96: { day: "thunderstorms-day-rain.json", night: "thunderstorms-night-rain.json" },
    99: { day: "thunderstorms-extreme.json", night: "thunderstorms-extreme.json" },
};

export function LottieWeatherIcon({ code, isNight }: { code: number, isNight: boolean }) {
    const [animationData, setAnimationData] = useState<unknown>(null);

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

    return (
        <div className="w-6 h-6 flex items-center justify-center -my-1 relative z-[50]">
            {animationData ? (
                <Lottie
                    animationData={animationData}
                    loop={true}
                    className="w-full h-full"
                />
            ) : (
                <div className="w-5 h-5 bg-muted/20 rounded-full animate-pulse" />
            )}
        </div>
    );
}
