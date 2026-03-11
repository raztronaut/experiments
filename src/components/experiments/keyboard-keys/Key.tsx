"use client";

import { cn } from "@/lib/utils";

type KeyState = "idle" | "active" | "completed" | "error" | "success";

interface KeyProps {
  isPressed?: boolean;
  label: string;
  onPress?: () => void;
  state?: KeyState;
  sublabel?: string;
  width?: string;
}

export function Key({
  label,
  sublabel,
  width = "w-16",
  state = "idle",
  isPressed = false,
  onPress,
}: KeyProps) {
  // Style variants based on state
  const getStyles = () => {
    switch (state) {
      case "completed":
        return {
          shadow: "bg-green-900",
          surface: isPressed
            ? "border-green-500 bg-linear-to-b from-green-800 to-green-900"
            : "border-green-600 bg-linear-to-b from-green-700 to-green-800",
          shine: "via-green-400/30",
          sublabel: "text-green-400",
          label: "text-green-300",
        };
      case "success":
        return {
          shadow: "bg-green-800",
          surface:
            "border-green-500 bg-linear-to-b from-green-600 to-green-700",
          shine: "via-green-300/40",
          sublabel: "text-green-200",
          label: "text-white",
        };
      case "error":
        return {
          shadow: "bg-red-900",
          surface: "border-red-500 bg-linear-to-b from-red-700 to-red-800",
          shine: "via-red-400/30",
          sublabel: "text-red-300",
          label: "text-red-200",
        };
      case "active":
        return {
          shadow: "bg-neutral-700",
          surface: isPressed
            ? "border-neutral-500 bg-linear-to-b from-neutral-700 to-neutral-800"
            : "border-neutral-500 bg-linear-to-b from-neutral-700 to-neutral-800 ring-2 ring-neutral-500",
          shine: "via-white/30",
          sublabel: "text-neutral-400",
          label: "text-neutral-200",
        };
      default:
        return {
          shadow: "bg-neutral-800",
          surface: isPressed
            ? "border-neutral-600 bg-linear-to-b from-neutral-900 to-neutral-800"
            : "border-neutral-700 bg-linear-to-b from-neutral-800 to-neutral-900",
          shine: "via-white/20",
          sublabel: "text-neutral-500",
          label: isPressed ? "text-neutral-400" : "text-neutral-300",
        };
    }
  };

  const styles = getStyles();

  return (
    <button
      className={cn(
        width,
        "group relative h-16 touch-manipulation select-none rounded-xl transition-all duration-75 ease-out focus:outline-hidden",
        isPressed ? "translate-y-1" : "translate-y-0"
      )}
      onMouseDown={(e) => {
        e.stopPropagation();
        onPress?.();
      }}
      onTouchEnd={(e) => {
        e.preventDefault(); // Prevent click event from firing
      }}
      onTouchStart={(e) => {
        e.preventDefault(); // Prevent synthetic mousedown from firing
        e.stopPropagation();
        onPress?.();
      }}
      type="button"
    >
      {/* Shadow/depth layer */}
      <span
        className={cn(
          "absolute inset-0 rounded-xl transition-all duration-150",
          styles.shadow,
          isPressed ? "translate-y-0" : "translate-y-1"
        )}
      />

      {/* Main key surface */}
      <span
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center rounded-xl border transition-all duration-150",
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
            <span
              className={cn(
                "font-medium text-[10px] transition-colors duration-150",
                styles.sublabel
              )}
            >
              {sublabel}
            </span>
          )}
          <span
            className={cn(
              "font-semibold text-base tracking-wide transition-colors duration-150",
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
