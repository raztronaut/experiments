'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Experiment } from '@/lib/experiments';

interface InteractivePreviewMediaProps {
    experiment: Experiment;
    isHovered: boolean;
}

// 1. Interactive Preview (Floating / List View - Complex)
export const InteractivePreviewMedia = ({
    experiment,
    isHovered,
}: InteractivePreviewMediaProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
    const [posterError, setPosterError] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isInViewport, setIsInViewport] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!containerEl) return;
        const observer = new IntersectionObserver(
            ([entry]) => setIsInViewport(entry.isIntersecting),
            { threshold: 0.1, rootMargin: '400px' }
        );
        observer.observe(containerEl);
        return () => observer.disconnect();
    }, [containerEl]);

    const style = {
        opacity: isHovered ? 1 : 0,
        scale: isHovered ? 1 : 1.1,
        filter: isHovered ? "none" : "blur(10px)",
    };

    const shouldPlay = isInViewport && isHovered;

    // Fallback logic
    const staticImage = (!posterError && experiment.poster) ? experiment.poster : (!imageError ? experiment.image : null);
    const hasStaticImage = !!staticImage;

    // For interactive preview, we can be more aggressive with unmounting/optimizing
    // since it's an overlay. But to be safe, let's keep it robust.
    // IMPROVEMENT from Reference: We only render video if playing or if no static image.
    const shouldRenderVideo = !hasStaticImage || shouldPlay;

    useEffect(() => {
        if (!videoRef.current) return;
        if (shouldPlay) {
            videoRef.current.play().catch(() => { });
        } else {
            videoRef.current.pause();
        }
    }, [shouldPlay]);

    return (
        <div
            ref={setContainerEl}
            className="absolute inset-0 w-full h-full transition-all duration-500 ease-out bg-secondary"
            style={style}
        >
            {hasStaticImage && staticImage && (
                <Image
                    src={staticImage}
                    alt={experiment.title}
                    fill
                    className="object-cover z-0"
                    sizes="280px"
                    priority={isHovered}
                    onError={() => {
                        if (staticImage === experiment.poster) {
                            setPosterError(true);
                        } else {
                            setImageError(true);
                        }
                    }}
                />
            )}
            {experiment.video && shouldRenderVideo && (
                <video
                    ref={videoRef}
                    src={experiment.video}
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={() => setIsLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${(hasStaticImage && !shouldPlay) ? 'opacity-0' : (isLoaded ? 'opacity-100' : 'opacity-0')
                        }`}
                />
            )}
            {/* Fallback */}
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
