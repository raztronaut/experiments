"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import Ribbon from "./Ribbon";
import { useRibbons } from "./useRibbons";
import { useResponsiveCamera } from "./useResponsiveCamera";

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