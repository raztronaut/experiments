"use client";

import { useState, useEffect } from "react";
import { useMounted } from "./useMounted";

export type TemperatureUnit = 'C' | 'F' | 'K' | 'R' | 'Re' | 'De';

export function usePreferences() {
    const mounted = useMounted();

    const [tempUnit, setTempUnit] = useState<TemperatureUnit>('C');
    const [use24Hour, setUse24Hour] = useState(false);
    const [showCoords, setShowCoords] = useState(false);

    // Hydrate preferences on mount
    useEffect(() => {
        try {
            // Temp Unit
            const storedUnit = localStorage.getItem("pref-temp-unit");
            if (storedUnit && ['C', 'F', 'K', 'R', 'Re', 'De'].includes(storedUnit)) {
                setTempUnit(storedUnit as TemperatureUnit);
            } else {
                // Fallback to old preference key for migration
                const oldPref = localStorage.getItem("pref-fahrenheit");
                if (oldPref !== null) {
                    setTempUnit(oldPref === "true" ? 'F' : 'C');
                }
            }

            // 24 Hour
            const stored24h = localStorage.getItem("pref-24h");
            if (stored24h !== null) {
                setUse24Hour(stored24h === "true");
            }

            // Show Coords
            const storedCoords = localStorage.getItem("pref-show-coords");
            if (storedCoords !== null) {
                setShowCoords(storedCoords === "true");
            }
        } catch (e) {
            console.error("Failed to load preferences", e);
        }
    }, []);

    // Cycle through units: C -> F -> K -> R -> Re -> De -> C
    const toggleUnit = () => {
        setTempUnit(prev => {
            const map: Record<TemperatureUnit, TemperatureUnit> = {
                'C': 'F',
                'F': 'K',
                'K': 'R',
                'R': 'Re',
                'Re': 'De',
                'De': 'C'
            };
            return map[prev];
        });
    };

    const tempUnitLabel = (() => {
        switch (tempUnit) {
            case 'C': return '°C';
            case 'F': return '°F';
            case 'K': return 'K';
            case 'R': return '°R';
            case 'Re': return '°Re';
            case 'De': return '°De';
            default: return '°C';
        }
    })();

    // Save preferences
    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem("pref-24h", String(use24Hour));
        localStorage.setItem("pref-temp-unit", tempUnit);
        localStorage.setItem("pref-show-coords", String(showCoords));
    }, [use24Hour, tempUnit, showCoords, mounted]);

    return {
        tempUnit,
        setTempUnit,
        toggleUnit,
        tempUnitLabel,
        use24Hour,
        setUse24Hour,
        showCoords,
        setShowCoords,
        mounted
    };
}
