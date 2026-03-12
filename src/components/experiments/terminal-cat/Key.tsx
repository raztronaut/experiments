"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface KeyProps {
  keyCode?: string;
  label: string;
  sublabel?: string;
  width?: string;
}

export function Key({ label, sublabel, width = "w-16", keyCode }: KeyProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (keyCode && e.key.toLowerCase() === keyCode.toLowerCase()) {
        setIsPressed(true);
      }
    },
    [keyCode]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (keyCode && e.key.toLowerCase() === keyCode.toLowerCase()) {
        setIsPressed(false);
      }
    },
    [keyCode]
  );

  useEffect(() => {
    if (keyCode) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [keyCode, handleKeyDown, handleKeyUp]);

  // Dark-only styles for this experiment's dark background
  const styles = {
    shadow: "bg-neutral-800",
    surface: isPressed
      ? "border-neutral-600 bg-linear-to-b from-neutral-900 to-neutral-800"
      : "border-neutral-700 bg-linear-to-b from-neutral-800 to-neutral-900",
    shine: "via-white/20",
    sublabel: "text-neutral-500",
    label: isPressed ? "text-neutral-400" : "text-neutral-300",
  };

  return (
    <button
      className={cn(
        width,
        "group relative h-16 select-none rounded-xl transition-all duration-75 ease-out focus:outline-hidden",
        isPressed ? "translate-y-1" : "translate-y-0"
      )}
      onMouseDown={() => setIsPressed(true)}
      onMouseLeave={() => setIsPressed(false)}
      onMouseUp={() => setIsPressed(false)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
    >
      {/* Shadow/depth layer */}
      <span
        className={cn(
          "absolute inset-0 rounded-xl transition-all duration-75",
          styles.shadow,
          isPressed ? "translate-y-0" : "translate-y-1"
        )}
      />

      {/* Main key surface */}
      <span
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center rounded-xl border transition-all duration-75",
          styles.surface
        )}
      >
        {/* Shine effect */}
        <span
          className={cn(
            "absolute inset-x-2 top-1 h-px rounded-full bg-linear-to-r from-transparent to-transparent transition-opacity duration-75",
            styles.shine,
            isPressed ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Key label */}
        <span className="relative z-10 flex flex-col items-center justify-center gap-0.5">
          {sublabel && (
            <span className={cn("font-medium text-[10px]", styles.sublabel)}>
              {sublabel}
            </span>
          )}
          <span
            className={cn(
              "font-semibold text-base tracking-wide transition-colors duration-75",
              styles.label
            )}
          >
            {label}
          </span>
        </span>
      </span>
    </button>
  );
}
