"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import GalleryExploreScene from "./GalleryExploreScene";

export default function RabbitholeChatGalleryExplore() {
  return (
    <div
      className="h-screen w-full overflow-hidden overscroll-none"
      style={{ backgroundColor: "hsl(0, 0%, 14%)" }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        dpr={[1, 2]}
        gl={{ alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <GalleryExploreScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
