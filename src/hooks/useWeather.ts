"use client";

import { useState, useEffect, useMemo } from "react";
import { TemperatureUnit } from "./usePreferences";

export interface WeatherData {
    temperature: number; // Always in Celsius from API
    weatherCode: number;
    isDay: boolean;
}

const TORONTO_COORDS = { lat: 43.6532, lng: -79.3832 };

function convertTemperature(celsius: number, unit: TemperatureUnit): number {
    switch (unit) {
        case 'C': return celsius;
        case 'F': return (celsius * 9 / 5) + 32;
        case 'K': return celsius + 273.15;
        case 'R': return (celsius + 273.15) * 9 / 5;
        case 'Re': return celsius * 0.8;
        case 'De': return (100 - celsius) * 1.5;
        default: return celsius;
    }
}

export function useWeather(unit: TemperatureUnit = 'C') {
    const [weather, setWeather] = useState<WeatherData | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchWeather = async () => {
            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${TORONTO_COORDS.lat}&longitude=${TORONTO_COORDS.lng}&current=temperature_2m,weather_code,is_day`,
                    { signal: controller.signal }
                );
                const data = await res.json();
                setWeather({
                    temperature: data.current.temperature_2m,
                    weatherCode: data.current.weather_code,
                    isDay: data.current.is_day === 1
                });
            } catch (e: unknown) {
                if (e instanceof Error && e.name === 'AbortError') return;
                console.error("Failed to fetch weather", e);
            }
        };

        fetchWeather();
        // Refresh weather every 30 minutes
        const interval = setInterval(fetchWeather, 30 * 60 * 1000);
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, []);

    const tempValue = useMemo(() => {
        if (!weather) return null;
        return Math.round(convertTemperature(weather.temperature, unit));
    }, [weather, unit]);

    return { weather, tempValue };
}
