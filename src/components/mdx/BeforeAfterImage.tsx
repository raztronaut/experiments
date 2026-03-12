"use client";

import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface BeforeAfterImageProps {
  afterSrc: string;
  alt?: string;
  beforeSrc: string;
  defaultSliderPosition?: number;
  height?: number;
  width?: number;
}

function SliderHandle() {
  return (
    <div className="absolute inset-y-0 z-3 flex w-1 cursor-ew-resize items-center justify-center bg-foreground">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background/80 shadow-md backdrop-blur-sm">
        <svg
          className="h-4 w-4 text-foreground"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M18 8L22 12L18 16" />
          <path d="M6 8L2 12L6 16" />
        </svg>
      </div>
    </div>
  );
}

export function BeforeAfterImage({
  alt = "Before and after comparison",
  beforeSrc,
  afterSrc,
  defaultSliderPosition = 50,
  width = 700,
  height = 400,
}: BeforeAfterImageProps) {
  const [sliderPosition, setSliderPosition] = useState(defaultSliderPosition);
  const [isDragging, setIsDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const calculateSliderPosition = useCallback((clientX: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(pct, 0), 100));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    calculateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) {
      return;
    }
    calculateSliderPosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      calculateSliderPosition(e.touches[0].clientX);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight") {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  useEffect(() => {
    if (!isDragging) {
      return;
    }
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchend", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <figure className="my-8">
      <div
        aria-label="Before and after image comparison slider"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(sliderPosition)}
        className="relative cursor-ew-resize overflow-hidden rounded-xl border border-border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        ref={wrapperRef}
        role="slider"
        tabIndex={0}
      >
        <Image
          alt={`${alt} (before)`}
          className="pointer-events-none block h-auto w-full select-none"
          draggable={false}
          height={height}
          src={beforeSrc}
          width={width}
        />

        <div
          className="absolute inset-0 z-1 overflow-hidden"
          style={{
            clipPath: `inset(0 0 0 ${100 - sliderPosition}%)`,
          }}
        >
          <Image
            alt={`${alt} (after)`}
            className="pointer-events-none block h-auto w-full select-none"
            draggable={false}
            height={height}
            src={afterSrc}
            width={width}
          />
        </div>

        <div
          className="absolute inset-y-0 z-2"
          style={{
            left: `${sliderPosition}%`,
            transform: "translateX(-50%)",
          }}
        >
          <SliderHandle />
        </div>
      </div>
    </figure>
  );
}
