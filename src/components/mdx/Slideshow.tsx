"use client";

import { useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export interface SlideshowProps {
  alt?: string;
  aspectRatio?: CSSProperties["aspectRatio"];
  height?: number;
  images: string[];
  width?: number;
}

export function Slideshow({
  images,
  width = 700,
  height = 400,
  alt = "Image",
  aspectRatio = "16 / 9",
}: SlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(galleryRef);
  const shouldReduceMotion = useReducedMotion();

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  }, [images.length]);

  const previous = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInView) {
        return;
      }
      if (e.key === "ArrowRight") {
        next();
      }
      if (e.key === "ArrowLeft") {
        previous();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInView, next, previous]);

  const calculateTranslation = (index: number): number => {
    if (!galleryRef.current) {
      return 0;
    }
    const gapPct = ((12 * index) / galleryRef.current.offsetWidth) * 100;
    return -index * 100 - gapPct;
  };

  return (
    <figure className="my-8">
      <div
        aria-label="Image slideshow"
        aria-roledescription="carousel"
        className="relative w-full overflow-hidden rounded-xl border border-border"
        ref={galleryRef}
        role="region"
        style={{ aspectRatio, maxWidth: width }}
      >
        <div
          className={cn(
            "flex h-full gap-3",
            !shouldReduceMotion &&
              "transition-transform duration-450 ease-in-out"
          )}
          style={{
            transform: `translateX(${calculateTranslation(currentIndex)}%)`,
          }}
        >
          {images.map((src, i) => (
            <button
              className={cn(
                "min-w-full border-none bg-transparent p-0 outline-none",
                i === currentIndex ? "cursor-default" : "cursor-pointer"
              )}
              data-current={i === currentIndex}
              key={src}
              onClick={() => setCurrentIndex(i)}
              type="button"
            >
              <Image
                alt={`${alt} ${i + 1}`}
                className="h-full w-full rounded-none object-cover"
                height={height}
                src={src}
                width={width}
              />
            </button>
          ))}
        </div>

        <div className="absolute right-0 bottom-2 left-0 z-10 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/60 px-3 py-2 backdrop-blur-md">
            <button
              aria-label="Previous slide"
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground",
                currentIndex === 0 && "invisible"
              )}
              onClick={previous}
              type="button"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === currentIndex
                      ? "w-6 cursor-default bg-foreground"
                      : "w-2 cursor-pointer bg-foreground/30"
                  )}
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  type="button"
                />
              ))}
            </div>

            <button
              aria-label="Next slide"
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground",
                currentIndex === images.length - 1 && "invisible"
              )}
              onClick={next}
              type="button"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </figure>
  );
}
