'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';

export default function MountainTransition() {
    return (
        <div className="relative w-full h-full bg-black">
            {/* 
        Scroll container:
        We make this very tall to allow scrolling.
        The Canvas will be fixed behind it.
      */}
            <div
                id="mountain-scroll-container"
                className="absolute top-0 left-0 w-full z-10"
                style={{ height: '500vh' }} // 5 sections approx
            />

            {/* 
              Visual Container:
              Fixed to viewport, but with padding and rounded corners to create the "Dashboard/Card" look.
              The scroll container above still drives the window scroll, which GSAP picks up.
            */}
            <div className="fixed inset-0 bg-[#0a0a0a] p-4 z-0 flex items-center justify-center">
                <div className="relative w-full h-full rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-black">
                    <Canvas
                        orthographic
                        camera={{ zoom: 1, position: [0, 0, 1] }}
                        gl={{ antialias: true }}
                        dpr={[1, 2]}
                        className="absolute inset-0 w-full h-full"
                    >
                        <Suspense fallback={null}>
                            <Scene />
                        </Suspense>
                    </Canvas>

                    {/* Optional: Add a subtle logo or overlay inside the card if needed later */}
                </div>
            </div>


        </div>
    );
}