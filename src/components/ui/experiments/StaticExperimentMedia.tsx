'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Experiment } from '@/lib/experiments';

interface StaticExperimentMediaProps {
    experiment: Experiment;
    shouldPlay: boolean;
}

// 2. Static Media (Grid Cards / Mobile - Simple & Robust)
export const StaticExperimentMedia = ({
    experiment,
    shouldPlay
}: StaticExperimentMediaProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
    const [isInViewport, setIsInViewport] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Optimized Observer: Large margin to preload, but strictly unload when far away
    useEffect(() => {
        if (!containerEl) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInViewport(entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '600px 0px 600px 0px' }
        );
        observer.observe(containerEl);
        return () => observer.disconnect();
    }, [containerEl]);

    useEffect(() => {
        if (!videoRef.current) return;

        // If active (hover/swipe), play immediately
        if (shouldPlay) {
            videoRef.current.play().catch(() => { });
        } else {
            // Otherwise pause to save CPU
            videoRef.current.pause();
        }
    }, [shouldPlay]);

    const [posterError, setPosterError] = useState(false);
    const staticImage = experiment.poster || experiment.image;
    const hasStaticImage = !!staticImage && !posterError;

    // DECODER LIMIT FIX (FINAL):
    // 1. If we have a static image (poster/manual image), use it.
    // 2. ONLY mount the video if we are interacting (shouldPlay).
    // 3. Fallback: If no static image exists at all, try to load video if in viewport.
    const shouldRenderVideo = hasStaticImage ? shouldPlay : isInViewport;

    return (
        <div
            ref={setContainerEl}
            className="absolute inset-0 w-full h-full bg-secondary"
        >
            {/* Image Layer (Manual Image OR Generated Poster) */}
            {staticImage && (
                <Image
                    src={staticImage}
                    alt={experiment.title}
                    fill
                    className="object-cover z-0"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority={false}
                    onError={() => setPosterError(true)}
                />
            )}

            {/* Video Layer */}
            {experiment.video && shouldRenderVideo && (
                <video
                    ref={videoRef}
                    src={experiment.video}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={() => setIsLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${(hasStaticImage && !shouldPlay) ? 'opacity-0' : 'opacity-100'
                        }`}
                />
            )}

            {/* Fallback / Loading State for Video-Only cards */}
            {!staticImage && !isLoaded && experiment.video && (
                <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center z-0 animate-pulse">
                </div>
            )}

            {!staticImage && !experiment.video && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center z-0">
                    <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">No Preview</span>
                </div>
            )}

            {experiment.isPlaceholder && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none">
                    <span className="text-white font-['Comic_Sans_MS'] font-bold text-sm border-2 border-white/50 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm -rotate-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transform hover:scale-110 transition-transform">
                        NO PREVIEW YET
                    </span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none z-10" />
        </div>
    );
};
