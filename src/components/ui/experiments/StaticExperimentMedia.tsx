"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Experiment } from "@/lib/experiments";

interface StaticExperimentMediaProps {
  experiment: Experiment;
  priority?: boolean;
  shouldPlay: boolean;
}

// 2. Static Media (Grid Cards / Mobile - Simple & Robust)
export const StaticExperimentMedia = ({
  experiment,
  shouldPlay,
  priority = false,
}: StaticExperimentMediaProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Optimized Observer: Large margin to preload, but strictly unload when far away
  useEffect(() => {
    if (!containerEl) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "600px 0px 600px 0px" }
    );
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl]);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    // If active (hover/swipe), play immediately
    if (shouldPlay) {
      videoRef.current.play().catch(() => {});
    } else {
      // Otherwise pause to save CPU
      videoRef.current.pause();
    }
  }, [shouldPlay]);

  const [posterError, setPosterError] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Try poster first, then fallback to image if poster fails
  const staticImage =
    !posterError && experiment.poster
      ? experiment.poster
      : imageError
        ? null
        : experiment.image;
  const hasStaticImage = !!staticImage;

  // DECODER LIMIT FIX (FINAL):
  // 1. If we have a static image (poster/manual image), use it.
  // 2. ONLY mount the video if we are interacting (shouldPlay).
  // 3. Fallback: If no static image exists at all, try to load video if in viewport.
  const shouldRenderVideo = hasStaticImage ? shouldPlay : isInViewport;

  return (
    <div
      className="absolute inset-0 h-full w-full bg-secondary"
      ref={setContainerEl}
    >
      {/* Image Layer (Manual Image OR Generated Poster) */}
      {hasStaticImage && staticImage && (
        <Image
          alt={experiment.title}
          className="z-0 object-cover"
          fill
          onError={() => {
            if (staticImage === experiment.poster) {
              setPosterError(true);
            } else {
              setImageError(true);
            }
          }}
          priority={priority}
          quality={70}
          sizes="(max-width: 768px) 100vw, 400px"
          src={staticImage}
        />
      )}

      {/* Video Layer */}
      {experiment.video && shouldRenderVideo && (
        <video
          className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-300 ${
            hasStaticImage && !shouldPlay ? "opacity-0" : "opacity-100"
          }`}
          loop
          muted
          onLoadedData={() => setIsLoaded(true)}
          playsInline
          preload="auto"
          ref={videoRef}
          src={experiment.video}
        />
      )}

      {/* Fallback / Loading State for Video-Only cards */}
      {!(staticImage || isLoaded) && experiment.video && (
        <div className="absolute inset-0 z-0 flex h-full w-full animate-pulse items-center justify-center bg-muted" />
      )}

      {!(staticImage || experiment.video) && (
        <div className="absolute inset-0 z-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
            No Preview
          </span>
        </div>
      )}

      {!(experiment.video || experiment.image) && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/20">
          <span className="-rotate-6 transform rounded-lg border-2 border-white/50 bg-black/40 px-3 py-1.5 font-['Comic_Sans_MS'] font-bold text-sm text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] backdrop-blur-sm transition-transform hover:scale-110">
            NO PREVIEW YET
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background/20 to-transparent" />
    </div>
  );
};
