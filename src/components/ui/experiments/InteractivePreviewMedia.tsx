"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Experiment } from "@/lib/experiments";

interface InteractivePreviewMediaProps {
  experiment: Experiment;
  forceStatic?: boolean;
  isHovered: boolean;
}

// 1. Interactive Preview (Floating / List View - Complex)
export const InteractivePreviewMedia = ({
  experiment,
  isHovered,
  forceStatic = false,
}: InteractivePreviewMediaProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const [posterError, setPosterError] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerEl) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsInViewport(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "400px" }
    );
    observer.observe(containerEl);
    return () => observer.disconnect();
  }, [containerEl]);

  const style = {
    opacity: isHovered || forceStatic ? 1 : 0,
    scale: isHovered || forceStatic ? 1 : 1.1,
    filter: isHovered || forceStatic ? "none" : "blur(10px)",
  };

  const shouldPlay = isInViewport && isHovered && !forceStatic;

  // Fallback logic
  const staticImage =
    !posterError && experiment.poster
      ? experiment.poster
      : imageError
        ? null
        : experiment.image;
  const hasStaticImage = !!staticImage;

  // For interactive preview, we can be more aggressive with unmounting/optimizing
  // since it's an overlay. But to be safe, let's keep it robust.
  // IMPROVEMENT from Reference: We only render video if playing or if no static image.
  const shouldRenderVideo = !hasStaticImage || shouldPlay;

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }
    if (shouldPlay) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [shouldPlay]);

  return (
    <div
      className="absolute inset-0 h-full w-full bg-secondary transition-all duration-500 ease-out"
      ref={setContainerEl}
      style={style}
    >
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
          priority={isHovered || forceStatic}
          sizes="280px"
          src={staticImage}
        />
      )}
      {experiment.video && shouldRenderVideo && (
        <video
          className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-300 ${
            hasStaticImage && !shouldPlay
              ? "opacity-0"
              : isLoaded
                ? "opacity-100"
                : "opacity-0"
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
      {/* Fallback */}
      {!(staticImage || experiment.video) && (
        <div className="absolute inset-0 z-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <span className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
            No Preview
          </span>
        </div>
      )}

      {!experiment.video && !experiment.image && (
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
