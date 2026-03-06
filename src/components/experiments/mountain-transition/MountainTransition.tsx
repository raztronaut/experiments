"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Scene from "./Scene";

export default function MountainTransition() {
  return (
    <div className="relative h-full w-full bg-black">
      {/* 
        Scroll container:
        We make this very tall to allow scrolling.
        The Canvas will be fixed behind it.
      */}
      <div
        className="absolute top-0 left-0 z-10 w-full"
        id="mountain-scroll-container"
        style={{ height: "500vh" }} // 5 sections approx
      />

      {/* 
              Visual Container:
              Fixed to viewport, but with padding and rounded corners to create the "Dashboard/Card" look.
              The scroll container above still drives the window scroll, which GSAP picks up.
            */}
      <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#0a0a0a] p-4">
        <div className="relative h-full w-full overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-2xl">
          <Canvas
            camera={{ zoom: 1, position: [0, 0, 1] }}
            className="absolute inset-0 h-full w-full"
            dpr={[1, 2]}
            gl={{ antialias: true }}
            orthographic
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
