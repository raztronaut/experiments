import { useMemo, useEffect, useState } from "react";

interface LiquidGlassStyleOptions {
    filterId: string;
    fallbackBlur?: number;
}

export function useLiquidGlassStyle({ filterId, fallbackBlur = 20 }: LiquidGlassStyleOptions) {
    const [isChromium, setIsChromium] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Simple check for Chrome/Edge/Arc (Chromium based engines generally support the advanced SVG filter in backdrop-filter)
        // This is a heuristic; technically Safari matches "Chrome" in user agent strings too, so we check for 'vendor'
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        setIsChromium(isChrome);
    }, []);

    return useMemo(() => {
        if (!mounted) return {}; // Return empty on server/initial render

        if (isChromium) {
            return {
                backdropFilter: `url(#${filterId})`,
                WebkitBackdropFilter: `url(#${filterId})`,
                transform: "translate3d(0,0,0)", // Force GPU
            };
        }

        // Fallback for Safari/Firefox
        return {
            backdropFilter: `blur(${fallbackBlur}px)`,
            WebkitBackdropFilter: `blur(${fallbackBlur}px)`,
            backgroundColor: "rgba(255, 255, 255, 0.05)", // Slight tint for glass feel
        };
    }, [filterId, isChromium, mounted, fallbackBlur]);
}
