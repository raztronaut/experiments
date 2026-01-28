import { useMemo, useEffect, useState } from "react";
import { useMounted } from "./useMounted";

interface LiquidGlassStyleOptions {
    filterId: string;
    fallbackBlur?: number;
}

export function useLiquidGlassStyle({ filterId, fallbackBlur = 20 }: LiquidGlassStyleOptions) {
    const [isChromium, setIsChromium] = useState(false);
    const mounted = useMounted();

    useEffect(() => {
        // Improved Chromium detection (Chrome, Edge, Brave, Arc, etc.)
        // Safari and Firefox do not support SVG filters in backdrop-filter as of early 2024
        const hasChrome = typeof window !== 'undefined' && 'chrome' in window;
        const isChromium = hasChrome ||
            (/Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent) && !/OPR/.test(navigator.userAgent)) ||
            (/Edg/.test(navigator.userAgent));

        // Explicitly exclude Safari (WebKit) which often reports as "Chrome" but isn't Chromium
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

        setIsChromium(isChromium && !isSafari);
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
