'use client';

import { MoonIcon, SunIcon } from "lucide-react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ThemeSwitch = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    const isChecked = resolvedTheme === "dark";

    const handleCheckedChange = useCallback(
        (checked: boolean) => {
            setTheme(checked ? "dark" : "light");
        },
        [setTheme],
    );

    if (!mounted) return null;

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
                onCheckedChange={handleCheckedChange}
                className={cn(
                    // root (track)
                    "peer absolute inset-0 h-full w-full rounded-full transition-colors duration-300",
                    "bg-zinc-200 dark:bg-zinc-100",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    className
                )}
            >
                <SwitchPrimitives.Thumb asChild>
                    <motion.span
                        // Use motion for specific properties to guarantee smooth animation
                        initial={false}
                        animate={{
                            x: isChecked ? 48 : 4,
                            backgroundColor: isChecked ? "#09090b" : "#ffffff"
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                        className={cn(
                            "pointer-events-none block h-7 w-7 rounded-full shadow-lg ring-0 z-10"
                        )}
                    />
                </SwitchPrimitives.Thumb>
            </SwitchPrimitives.Root>

            {/* Icons overlaid inside the track, perfectly centered left/right */}
            <span
                className={cn(
                    "pointer-events-none absolute left-2.5 inset-y-0 z-0",
                    "flex items-center justify-center"
                )}
            >
                <SunIcon
                    size={16}
                    className="text-zinc-500 transition-colors duration-300"
                />
            </span>

            <span
                className={cn(
                    "pointer-events-none absolute right-2.5 inset-y-0 z-0",
                    "flex items-center justify-center"
                )}
            >
                <MoonIcon
                    size={16}
                    className="text-zinc-500 transition-colors duration-300"
                />
            </span>
        </div>
    );
};

export default ThemeSwitch;
