"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import React, { Suspense, useRef } from "react";
import * as THREE from "three";
import Ribbon from "./Ribbon";
import { scrollVelocityRef } from "./scrollState";
import { useResponsiveCamera } from "./useResponsiveCamera";
import { useRibbons } from "./useRibbons";

function ScrollManager() {
  useFrame(() => {
    // Decay scroll velocity
    scrollVelocityRef.current = THREE.MathUtils.lerp(
      scrollVelocityRef.current,
      0,
      0.05
    );
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
      scrollVelocityRef.current = THREE.MathUtils.clamp(
        scrollVelocityRef.current,
        -5,
        5
      );
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
      mouse.current.x = THREE.MathUtils.lerp(
        mouse.current.x,
        state.mouse.x,
        0.02
      );
      mouse.current.y = THREE.MathUtils.lerp(
        mouse.current.y,
        state.mouse.y,
        0.02
      );

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
      <PerspectiveCamera fov={65} makeDefault position={[0, 0, 32]} />
      <color args={["#fff9c4"]} attach="background" />

      <ambientLight color="#fffcf0" intensity={2} />
      <spotLight
        angle={0.3}
        castShadow
        color="#ffffff"
        intensity={20}
        penumbra={1}
        position={[50, 100, 50]}
      />
      <pointLight color="#fff1f1" intensity={6.0} position={[-40, 20, 20]} />

      <InteractivityLayer>
        <group rotation={[-0.15, -0.4, 0.02]}>
          {ribbons.map((ribbon, i) => (
            <Ribbon key={i} {...ribbon} />
          ))}
        </group>
      </InteractivityLayer>

      <OrbitControls enablePan={false} enableZoom={false} />
    </>
  );
}

export default function NotFound404() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#fff9c4] font-sans">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, stencil: false, depth: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-center overflow-hidden">
        <span className="translate-y-[-5%] font-black text-[45vw] text-black/3 leading-none tracking-tighter">
          404
        </span>
      </div>
    </div>
  );
}
