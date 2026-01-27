"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import Ribbon from "./Ribbon";
import { useRibbons } from "./useRibbons";
import { useResponsiveCamera } from "./useResponsiveCamera";
import { scrollVelocityRef } from "./scrollState";

function ScrollManager() {
    useFrame((_, delta) => {
        // Decay scroll velocity
        scrollVelocityRef.current = THREE.MathUtils.lerp(scrollVelocityRef.current, 0, 0.05);
    });


    React.useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            // Prevent native page scroll
            e.preventDefault();

            // Accumulate velocity based on wheel delta
            // Increased sensitivity for snappier response
            const sensitivity = 0.2;
            scrollVelocityRef.current += e.deltaY * sensitivity;
            // Clamp max speed if needed
            scrollVelocityRef.current = THREE.MathUtils.clamp(scrollVelocityRef.current, -5, 5);
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        return () => window.removeEventListener("wheel", handleWheel);
    }, []);

    return null;
}

function InteractivityLayer({ children }: { children: React.ReactNode }) {
    const groupRef = useRef<THREE.Group>(null);
    const mouse = useRef(new THREE.Vector2(0, 0));

    useFrame((state) => {
        if (groupRef.current) {
            mouse.current.x = THREE.MathUtils.lerp(mouse.current.x, state.mouse.x, 0.02);
            mouse.current.y = THREE.MathUtils.lerp(mouse.current.y, state.mouse.y, 0.02);

            groupRef.current.rotation.y = mouse.current.x * 0.12;
            groupRef.current.rotation.x = -mouse.current.y * 0.08;
        }
    });

    return <group ref={groupRef}>{children}</group>;
}

function Scene() {
    const ribbons = useRibbons();
    useResponsiveCamera(); // Handle camera responsiveness

    return (
        <>
            <ScrollManager />
            <PerspectiveCamera makeDefault position={[0, 0, 32]} fov={65} />
            <color attach="background" args={["#fff9c4"]} />

            <ambientLight intensity={2} color="#fffcf0" />
            <spotLight position={[50, 100, 50]} angle={0.3} penumbra={1} intensity={20} color="#ffffff" castShadow />
            <pointLight position={[-40, 20, 20]} intensity={6.0} color="#fff1f1" />

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