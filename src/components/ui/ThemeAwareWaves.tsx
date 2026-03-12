"use client";

import { useTheme } from "next-themes";
import { useMounted } from "@/hooks/useMounted";
import { Waves } from "./wave-background";

interface ThemeAwareWavesProps {
  className?: string;
}

export function ThemeAwareWaves({ className }: ThemeAwareWavesProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className={className} />;
  }

  // Determine stroke color based on theme
  // Dark mode: white with low opacity
  // Light mode: black with low opacity
  const strokeColor =
    resolvedTheme === "dark"
      ? "rgba(255, 255, 255, 0.2)"
      : "rgba(0, 0, 0, 0.15)";

  return (
    <Waves
      backgroundColor="transparent"
      className={className}
      strokeColor={strokeColor}
    />
  );
}
