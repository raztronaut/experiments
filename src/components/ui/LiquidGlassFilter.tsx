"use client";

import { useMemo, useId } from "react";

interface LiquidGlassFilterProps {
    id?: string;
    width: number;
    height: number;
    radius?: number;
    border?: number; // 0 to 1, percentage of size
    blockOutBlur?: number;
    displacementScale?: number;
}

export function LiquidGlassFilter({
    id = "liquid-glass",
    width = 200,
    height = 80,
    radius = 12,
    border = 0.25,
    blockOutBlur = 12,
    displacementScale = 8, // Controls the "strength" of the glass
}: LiquidGlassFilterProps) {
    // Generate unique IDs for internal SVG elements to prevent collisions across multiple instances
    const baseId = useId().replace(/:/g, "");
    const redId = `${id}-${baseId}-red`;
    const blueId = `${id}-${baseId}-blue`;

    // Generate the SVG Map as a Data URI
    // This map defines the "shape" of the lens/liquid distortion using gradients
    const displacementMapParams = useMemo(() => {
        // If dimensions are invalid, return null
        if (width <= 0 || height <= 0) return null;

        // Calculate border size in pixels based on the smallest dimension
        const borderSize = Math.min(width, height) * (border * 0.5);

        // Inner block-out rectangle (where content is clear)
        const innerWidth = Math.max(0, width - borderSize * 2);
        const innerHeight = Math.max(0, height - borderSize * 2);
        const innerX = borderSize;
        const innerY = borderSize;

        // We create a simpler SVG string for the displacement map
        // The red and blue channels determine x/y displacement
        // We add the "block out" rect in the middle to keep text readable
        const svgString = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="${redId}" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#000"/>
                        <stop offset="100%" stop-color="#f00"/>
                    </linearGradient>
                    <linearGradient id="${blueId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#000"/>
                        <stop offset="100%" stop-color="#00f"/>
                    </linearGradient>
                </defs>
                <!-- Background (Black = No displacement base) -->
                <rect x="0" y="0" width="${width}" height="${height}" fill="black" />
                
                <!-- Red Channel (X Displacement) - Horizontal Gradient -->
                <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#${redId})" />
                
                <!-- Blue Channel (Y Displacement) - Vertical Gradient -->
                <!-- mix-blend-mode: difference combines them without overwriting -->
                <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#${blueId})" style="mix-blend-mode: difference" />
                
                <!-- Block Out Center (Neutral Gray) to prevent distortion on text -->
                <!-- We use #7f7f7f which is exactly decimal 127/255 (neutral in 8-bit maps) -->
                <rect x="${innerX}" y="${innerY}" width="${innerWidth}" height="${innerHeight}" rx="${radius}" fill="#7f7f7f" style="filter:blur(${blockOutBlur}px)" />
            </svg>
        `.trim();

        return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
    }, [width, height, radius, border, blockOutBlur, redId, blueId]);

    return (
        <svg
            style={{
                position: "absolute",
                width: 0,
                height: 0,
                left: -9999,
                top: -9999,
                pointerEvents: "none",
            }}
            aria-hidden="true"
        >
            <defs>
                <filter
                    id={id}
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                    colorInterpolationFilters="sRGB"
                >
                    {displacementMapParams && (
                        <>
                            {/* 1. Load the Displacement Map */}
                            <feImage
                                href={displacementMapParams}
                                x="0"
                                y="0"
                                width={width}
                                height={height}
                                result="map"
                                preserveAspectRatio="none"
                            />

                            {/* 2. Chromatic Aberration / Channel Splitting */}
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="map"
                                scale={displacementScale + 5}
                                xChannelSelector="R"
                                yChannelSelector="B"
                                result="dispRed"
                            />
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="map"
                                scale={displacementScale}
                                xChannelSelector="R"
                                yChannelSelector="B"
                                result="dispGreen"
                            />
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="map"
                                scale={displacementScale + 10}
                                xChannelSelector="B"
                                yChannelSelector="R"
                                result="dispBlue"
                            />

                            <feColorMatrix
                                in="dispRed"
                                type="matrix"
                                values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
                                result="redOnly"
                            />
                            <feColorMatrix
                                in="dispGreen"
                                type="matrix"
                                values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
                                result="greenOnly"
                            />
                            <feColorMatrix
                                in="dispBlue"
                                type="matrix"
                                values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
                                result="blueOnly"
                            />

                            <feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
                            <feBlend in="rg" in2="blueOnly" mode="screen" result="final" />
                            <feGaussianBlur in="final" stdDeviation="0.5" />
                        </>
                    )}
                </filter>
            </defs>
        </svg>
    );

}
