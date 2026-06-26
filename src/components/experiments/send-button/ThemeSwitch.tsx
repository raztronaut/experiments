"use client";

// TODO: Restore theme switch — theme switching disabled until persistence/sync is fixed
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ThemeSwitch = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isChecked = resolvedTheme === "dark";

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        "h-9 w-20",
        "cursor-not-allowed opacity-70",
        className
      )}
      title="Theme toggle disabled — fix planned"
      {...props}
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-colors duration-300",
          "bg-zinc-200 dark:bg-zinc-100"
        )}
      />
      <span
        className={cn(
          "absolute inset-y-0 top-1/2 z-10 h-7 w-7 -translate-y-1/2 rounded-full shadow-lg ring-0",
          isChecked ? "left-[48px] bg-zinc-900" : "left-[4px] bg-white"
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 left-2.5 z-0 flex items-center justify-center"
        )}
      >
        <SunIcon className="text-zinc-500" size={16} />
      </span>
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 right-2.5 z-0 flex items-center justify-center"
        )}
      >
        <MoonIcon className="text-zinc-500" size={16} />
      </span>
    </div>
  );
};

export default ThemeSwitch;
