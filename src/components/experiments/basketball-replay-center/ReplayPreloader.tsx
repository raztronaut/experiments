"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import ReplayGrid, { type ReplayGridHandle } from "./ReplayGrid";
import DistortionPass from "./DistortionPass";
import usePreloaderTimeline from "./usePreloaderTimeline";

// Ambient camera movement that reacts to mouse — uses a group wrapper
function CameraRig() {
    const groupRef = useRef<THREE.Group>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;
        // Smooth lerp toward mouse position
        target.current.x += (mouse.current.x * 0.15 - target.current.x) * 0.05;
        target.current.y += (-mouse.current.y * 0.1 - target.current.y) * 0.05;

        groupRef.current.position.x = target.current.x;
        groupRef.current.position.y = target.current.y;
    });

    return <group ref={groupRef} />;
}


// Inner scene that lives inside the Canvas
function PreloaderScene({
    onComplete,
}: {
    onComplete?: () => void;
}) {
    const gridRef = useRef<ReplayGridHandle>(null);
    const distortionRef = useRef<{
        setDistortion: (value: number) => void;
        setGlow: (value: number) => void;
        uniforms: Record<string, { value: number }>;
    } | null>(null);

    const { buildTimeline } = usePreloaderTimeline();
    const hasStarted = useRef(false);

    // Build and start the animation once everything is mounted
    useFrame(() => {
        if (hasStarted.current) return;
        if (!gridRef.current || !distortionRef.current) return;

        const panels = gridRef.current.getPanels();
        if (panels.length === 0) return;

        hasStarted.current = true;

        // Small delay to ensure everything is rendered
        setTimeout(() => {
            buildTimeline({
                getPanels: () => gridRef.current?.getPanels() || [],
                distortionControl: distortionRef.current,
                onComplete,
            });
        }, 100);
    });

    return (
        <>
            <CameraRig />
            <React.Suspense fallback={null}>
                <ReplayGrid ref={gridRef} />
            </React.Suspense>
            <DistortionPass distortionRef={distortionRef} />
        </>
    );
}

interface ReplayPreloaderProps {
    onComplete?: () => void;
}

export default function ReplayPreloader({ onComplete }: ReplayPreloaderProps) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "#050508",
                zIndex: 100,
            }}
        >
            {/* Subtle ambient grid lines in background */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
                    backgroundSize: "40px 40px",
                    pointerEvents: "none",
                }}
            />

            <Canvas
                camera={{
                    position: [0, 0, 5.2],
                    fov: 55,
                    near: 0.1,
                    far: 100,
                }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance",
                }}
                dpr={[1, 2]}
                style={{ position: "absolute", inset: 0 }}
            >
                <color attach="background" args={["#050508"]} />
                <PreloaderScene onComplete={onComplete} />
            </Canvas>

        </div>
    );
}
