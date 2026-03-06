"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import { MoonIcon, SunIcon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ThemeSwitch = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isChecked = resolvedTheme === "dark";

  const handleCheckedChange = useCallback(
    (checked: boolean) => {
      setTheme(checked ? "dark" : "light");
    },
    [setTheme]
  );

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center", // center the whole control
        "h-9 w-20", // track sized to hug the icons
        className
      )}
      {...props}
    >
      <SwitchPrimitives.Root
        checked={isChecked}
        className={cn(
          // root (track)
          "peer absolute inset-0 h-full w-full rounded-full transition-colors duration-300",
          "bg-zinc-200 dark:bg-zinc-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        onCheckedChange={handleCheckedChange}
      >
        <SwitchPrimitives.Thumb asChild>
          <motion.span
            // Use motion for specific properties to guarantee smooth animation
            animate={{
              x: isChecked ? 48 : 4,
              backgroundColor: isChecked ? "#09090b" : "#ffffff",
            }}
            className={cn(
              "pointer-events-none z-10 block h-7 w-7 rounded-full shadow-lg ring-0"
            )}
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>

      {/* Icons overlaid inside the track, perfectly centered left/right */}
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 left-2.5 z-0",
          "flex items-center justify-center"
        )}
      >
        <SunIcon
          className="text-zinc-500 transition-colors duration-300"
          size={16}
        />
      </span>

      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 right-2.5 z-0",
          "flex items-center justify-center"
        )}
      >
        <MoonIcon
          className="text-zinc-500 transition-colors duration-300"
          size={16}
        />
      </span>
    </div>
  );
};

export default ThemeSwitch;
