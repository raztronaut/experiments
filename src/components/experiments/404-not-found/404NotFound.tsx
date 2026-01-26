"use client";

import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, useTexture } from "@react-three/drei";
import * as THREE from "three";
import Ribbon from "./Ribbon";

function InteractivityLayer({ children }: { children: React.ReactNode }) {
    const groupRef = useRef<THREE.Group>(null);
    const mouse = useRef(new THREE.Vector2(0, 0));

    useFrame((state) => {
        if (groupRef.current) {
            mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.mouse.x, 0.02);
            mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.mouse.y, 0.02);

            groupRef.current.rotation.y = mouse.current.x * 0.04;
            groupRef.current.rotation.x = -mouse.current.y * 0.03;
        }
    });

    return <group ref={groupRef}>{children}</group>;
}

function Scene() {
    const dayjobTexture = useTexture("/experiments/404-not-found/dayjob.png");

    const texts = useMemo(() => [
        "404 NOT FOUND",
        "PAGE NOT FOUND",
        "ERROR 404",
        "NOT FOUND",
        "404",
        "SYSTEM ERROR",
        "LOST IN SPACE",
        "NOT FOUND 404"
    ], []);

    const ribbons = useMemo(() => {
        const stripCount = 35; // Slightly reduced for better focus
        const colors = [
            "#fff9c4", // Warm Lemon
            "#fff59d", // Light Yellow
            "#fdfcba", // Pale Cream
            "#ffecb3", // Amber Cream
            "#ef5350", // Vibrant Red (Accent)
            "#e53935", // Deep Red
        ];

        const fonts = [
            "Inter, sans-serif",
            "system-ui, sans-serif",
        ];

        const baseHeight = 4.0;
        const baseThickness = 4.0;
        const verticalSpread = 0.65; // Slightly more spread for "loose" feel
        const totalHeight = stripCount * (baseHeight + verticalSpread);
        const startY = totalHeight / 2;
        const imageStartIdx = 12; // Start index for image overlay
        const imageRows = 10;      // Spanning more ribbons for more detail
        const imageEndIdx = imageStartIdx + imageRows;


        return Array.from({ length: stripCount }).map((_, i) => {
            const seedVal = i * 777.77;
            const random = (s: number) => {
                const x = Math.sin(s + seedVal) * 10000;
                return x - Math.floor(x);
            };

            // Calculate precise Y to ensure no overlapping
            const y = startY - i * (baseHeight + verticalSpread);

            // READABILITY FIX: All ribbons in the image section (and the label) should be perfectly aligned
            const isInImageSection = (i >= imageStartIdx - 1 && i < imageEndIdx);

            const xJitter = isInImageSection ? 0 : (random(3) - 0.5) * 4;
            const rotZ = isInImageSection ? 0 : (random(2) - 0.5) * 0.1;

            // Synchronize wave parameters for the image section so it moves like a single sheet
            const amplitude = isInImageSection ? 3.0 : (2.5 + random(5) * 1.0);
            const frequency = isInImageSection ? 0.04 : (0.03 + random(6) * 0.02);
            const speed = isInImageSection ? 0.015 : (0.01 + random(4) * 0.015);

            // Subtle rotation and Z staggering to look like a "pile"
            const z = (random(1) - 0.5) * 2;
            const textIndex = Math.floor(random(4) * texts.length);
            const text = texts[textIndex];

            // Backside Image Logic (Instagram feed style)
            let backsideImage = null;
            let backOffset: [number, number] = [0, 0];
            let backScale: [number, number] = [1, 1];
            let backClamp = 0.0;
            const backsideText = "INSPIRED BY DAY JOB";

            const ribbonWidth = 220;

            if (i >= imageStartIdx && i < imageEndIdx) {
                backsideImage = dayjobTexture;
                backClamp = 1.0;
                const rowIndex = i - imageStartIdx;

                // Total height the image spans in 3D units
                const totalImageHeight = imageRows * baseHeight + (imageRows - 1) * verticalSpread;
                const imageAspect = 2624 / 1838; // 1.4276
                const totalImageWidth = totalImageHeight * imageAspect;

                // scaleX = ribbon_width / target_image_width
                const scaleX = ribbonWidth / totalImageWidth;
                const scaleY = baseHeight / totalImageHeight;

                // No jitter anymore in image section, so offsetX is simpler
                const offsetX = 0.5 * (1 - scaleX);

                const offsetY = (imageRows - 1 - rowIndex) * (baseHeight + verticalSpread) / totalImageHeight;

                backOffset = [offsetX, offsetY];
                backScale = [scaleX, scaleY];
            }

            return {
                text,
                subscript: (text.includes("404") && i % 8 === 3) ? "4" : "",
                color: colors[i % colors.length],
                fontFamily: fonts[0],
                position: [
                    xJitter,
                    y,
                    z
                ] as [number, number, number],
                rotation: [
                    -0.08,
                    0,
                    rotZ
                ] as [number, number, number],
                speed,
                width: ribbonWidth,
                height: baseHeight,
                thickness: baseThickness,
                amplitude,
                frequency,
                fontWeight: "900",
                padding: 120,
                seed: seedVal,
                backsideText,
                backsideImage,
                backOffset,
                backScale,
                backClamp,
                textSpeed: (random(7) - 0.5) * 12, // Faster sliding movement
            };
        });
    }, [texts, dayjobTexture]);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 32]} fov={65} />
            <color attach="background" args={["#fff9c4"]} />

            <ambientLight intensity={0.8} color="#fffcf0" />
            <spotLight position={[50, 100, 50]} angle={0.3} penumbra={1} intensity={6} color="#ffffff" castShadow />
            <pointLight position={[-40, 20, 20]} intensity={3.0} color="#fff1f1" />

            <InteractivityLayer>
                <group rotation={[-0.15, -0.4, 0.02]}>
                    {ribbons.map((ribbon, i) => (
                        <Ribbon
                            key={i}
                            {...ribbon}
                        />
                    ))}
                </group>
            </InteractivityLayer>

            <OrbitControls enableZoom={false} enablePan={false} />
        </>
    );
}

export default function NotFound404() {
    return (
        <div className="w-full h-screen bg-[#fff9c4] overflow-hidden relative font-sans">
            <Canvas
                gl={{ antialias: true, stencil: false, depth: true }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>

            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none select-none overflow-hidden">
                <span className="text-[45vw] font-black text-black/[0.03] tracking-tighter leading-none translate-y-[-5%]">
                    404
                </span>
            </div>
        </div>
    );
}