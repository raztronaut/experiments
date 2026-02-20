"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import type { GridPanelRef } from "./ReplayGrid";

interface TimelineConfig {
    getPanels: () => GridPanelRef[];
    distortionControl: {
        setDistortion: (value: number) => void;
        setGlow: (value: number) => void;
        uniforms: Record<string, { value: number }>;
    } | null;
    onComplete?: () => void;
}

export default function usePreloaderTimeline() {
    const timelineRef = useRef<gsap.core.Timeline | null>(null);
    const configRef = useRef<TimelineConfig | null>(null);

    const buildTimeline = useCallback((config: TimelineConfig) => {
        configRef.current = config;
        const { getPanels, distortionControl, onComplete } = config;

        if (!distortionControl) return;

        // Kill any existing timeline
        if (timelineRef.current) {
            timelineRef.current.kill();
        }

        const panels = getPanels();
        if (panels.length === 0) return;

        const tl = gsap.timeline({
            onComplete: () => {
                onComplete?.();
            },
        });

        // Sort panels by distance from center for staggered reveal
        const centerCol = 2;
        const centerRow = 1;
        const sortedPanels = [...panels].sort((a, b) => {
            const distA = Math.abs(a.col - centerCol) + Math.abs(a.row - centerRow);
            const distB = Math.abs(b.col - centerCol) + Math.abs(b.row - centerRow);
            return distA - distB;
        });

        const nonLogoPanels = sortedPanels.filter((p) => !p.isLogo);
        const logoPanel = sortedPanels.find((p) => p.isLogo);

        // ============================================
        // PHASE 1: Boot-up — staggered panel reveal
        // ============================================

        // Set initial state
        panels.forEach((panel) => {
            panel.mesh.scale.set(0.85, 0.85, 1);
            panel.material.uniforms.uOpacity.value = 0;
            if (!panel.isLogo) {
                panel.material.uniforms.uBrightness.value = 0;
            }
        });

        // Distortion starts flat
        const distortionProxy = { value: 0, glow: 0 };

        // Logo appears first, subtly
        if (logoPanel) {
            tl.to(
                logoPanel.material.uniforms.uOpacity,
                {
                    value: 1,
                    duration: 0.8,
                    ease: "power2.out",
                },
                0.2
            );
            tl.to(
                logoPanel.mesh.scale,
                {
                    x: 1,
                    y: 1,
                    duration: 0.8,
                    ease: "back.out(1.4)",
                },
                0.2
            );
        }

        // Screens boot up from center outward
        nonLogoPanels.forEach((panel, i) => {
            const delay = 0.4 + i * 0.08;

            // Opacity in
            tl.to(
                panel.material.uniforms.uOpacity,
                {
                    value: 1,
                    duration: 0.5,
                    ease: "power2.out",
                },
                delay
            );

            // Scale in with slight bounce
            tl.to(
                panel.mesh.scale,
                {
                    x: 1,
                    y: 1,
                    duration: 0.6,
                    ease: "back.out(1.2)",
                },
                delay
            );

            // Brightness ramp up (CRT warming up)
            tl.to(
                panel.material.uniforms.uBrightness,
                {
                    value: 0.4 + Math.random() * 0.6,
                    duration: 0.8,
                    ease: "power1.in",
                },
                delay + 0.2
            );
        });

        // ============================================
        // PHASE 2: Distortion ramp — screens curve
        // ============================================
        tl.to(
            distortionProxy,
            {
                value: 0.35,
                duration: 1.8,
                ease: "power2.inOut",
                onUpdate: () => {
                    distortionControl.setDistortion(distortionProxy.value);
                },
            },
            0.6
        );

        // Ambient glow ramp
        tl.to(
            distortionProxy,
            {
                glow: 0.8,
                duration: 1.5,
                ease: "power2.out",
                onUpdate: () => {
                    distortionControl.setGlow(distortionProxy.glow);
                },
            },
            1.0
        );

        // ============================================
        // PHASE 3: Hold — screens visible with effects
        // ============================================
        // (Natural pause — no animation needed, shaders do the work)

        // Brightness pulsing for some screens
        nonLogoPanels.forEach((panel, i) => {
            if (i % 3 === 0) {
                tl.to(
                    panel.material.uniforms.uBrightness,
                    {
                        value: 0.7 + Math.random() * 0.3,
                        duration: 0.6,
                        ease: "sine.inOut",
                        yoyo: true,
                        repeat: 1,
                    },
                    2.5 + i * 0.05
                );
            }
        });

        // ============================================
        // PHASE 4: Fade out — non-center panels disappear
        // ============================================
        const fadeStart = 3.5;

        // Reverse distance sort (outer panels fade first)
        const reverseSorted = [...nonLogoPanels].reverse();

        reverseSorted.forEach((panel, i) => {
            const delay = fadeStart + i * 0.06;

            // Opacity out
            tl.to(
                panel.material.uniforms.uOpacity,
                {
                    value: 0,
                    duration: 0.6,
                    ease: "power2.in",
                },
                delay
            );

            // Scale down slightly
            tl.to(
                panel.mesh.scale,
                {
                    x: 0.9,
                    y: 0.9,
                    duration: 0.6,
                    ease: "power2.in",
                },
                delay
            );

            // Brightness dims
            tl.to(
                panel.material.uniforms.uBrightness,
                {
                    value: 0,
                    duration: 0.4,
                    ease: "power2.in",
                },
                delay
            );
        });

        // Distortion eases back to flat
        tl.to(
            distortionProxy,
            {
                value: 0.05,
                duration: 2.0,
                ease: "power3.inOut",
                onUpdate: () => {
                    distortionControl.setDistortion(distortionProxy.value);
                },
            },
            fadeStart
        );

        // ============================================
        // PHASE 5: Logo reveal — center scales up, glows
        // ============================================
        if (logoPanel) {
            tl.to(
                logoPanel.mesh.scale,
                {
                    x: 1.3,
                    y: 1.3,
                    duration: 1.2,
                    ease: "power2.out",
                },
                fadeStart + 1.0
            );

            // Glow pulse
            tl.to(
                distortionProxy,
                {
                    glow: 1.5,
                    duration: 0.8,
                    ease: "power2.out",
                    onUpdate: () => {
                        distortionControl.setGlow(distortionProxy.glow);
                    },
                },
                fadeStart + 1.2
            );
            tl.to(
                distortionProxy,
                {
                    glow: 0.3,
                    duration: 1.0,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        distortionControl.setGlow(distortionProxy.glow);
                    },
                },
                fadeStart + 2.0
            );
        }

        timelineRef.current = tl;
        return tl;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timelineRef.current) {
                timelineRef.current.kill();
            }
        };
    }, []);

    return { buildTimeline, timeline: timelineRef };
}
