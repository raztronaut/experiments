"use client";

import { useEffect, useState } from "react";
import { useMounted } from "./useMounted";

export type TemperatureUnit = "C" | "F" | "K" | "R" | "Re" | "De";

export function usePreferences() {
  const mounted = useMounted();

  const [tempUnit, setTempUnit] = useState<TemperatureUnit>(() => {
    if (typeof window === "undefined") {
      return "C";
    }
    try {
      const storedUnit = localStorage.getItem("pref-temp-unit");
      if (storedUnit && ["C", "F", "K", "R", "Re", "De"].includes(storedUnit)) {
        return storedUnit as TemperatureUnit;
      }
      // Fallback for migration
      const oldPref = localStorage.getItem("pref-fahrenheit");
      if (oldPref !== null) {
        return oldPref === "true" ? "F" : "C";
      }
    } catch (e) {
      console.error("Failed to load tempUnit preference", e);
    }
    return "C";
  });

  const [use24Hour, setUse24Hour] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    try {
      const stored = localStorage.getItem("pref-24h");
      return stored === "true";
    } catch {
      return false;
    }
  });

  const [showCoords, setShowCoords] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    try {
      const stored = localStorage.getItem("pref-show-coords");
      return stored === "true";
    } catch {
      return false;
    }
  });

  // Cycle through units: C -> F -> K -> R -> Re -> De -> C
  const toggleUnit = () => {
    setTempUnit((prev) => {
      const map: Record<TemperatureUnit, TemperatureUnit> = {
        C: "F",
        F: "K",
        K: "R",
        R: "Re",
        Re: "De",
        De: "C",
      };
      return map[prev];
    });
  };

  const tempUnitLabel = (() => {
    switch (tempUnit) {
      case "C":
        return "°C";
      case "F":
        return "°F";
      case "K":
        return "K";
      case "R":
        return "°R";
      case "Re":
        return "°Re";
      case "De":
        return "°De";
      default:
        return "°C";
    }
  })();

  // Save preferences
  useEffect(() => {
    if (!mounted) {
      return;
    }
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
    mounted,
  };
}
