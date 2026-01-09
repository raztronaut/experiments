"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import GalleryExploreScene from './GalleryExploreScene';

export default function RabbitholeChatGalleryExplore() {
    return (
        <div
            className="w-full h-screen overflow-hidden overscroll-none"
            style={{ backgroundColor: 'hsl(0, 0%, 14%)' }}
        >
            <Canvas
                dpr={[1, 2]}
                gl={{ alpha: true }}
                camera={{ position: [0, 0, 10], fov: 75 }}
                style={{ width: '100%', height: '100%' }}
            >
                <Suspense fallback={null}>
                    <GalleryExploreScene />
                </Suspense>
            </Canvas>
        </div>
    );
}