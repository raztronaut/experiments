"use client";

import { useRef } from "react";
import { useThreeShader } from "./useThreeShader";

/**
 * Shader landing component displaying a pixelated mosaic radial wave effect.
 * Uses Three.js loaded dynamically from CDN for WebGL rendering.
 */
export function ShaderLanding() {
    const containerRef = useRef<HTMLDivElement>(null);
    useThreeShader(containerRef);

    return <div ref={containerRef} className="w-full h-full absolute" />;
}
