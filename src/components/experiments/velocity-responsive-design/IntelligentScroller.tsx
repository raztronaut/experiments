"use client";

import type React from "react";
import { useRef } from "react";
import { useScrollStabilizer } from "./hooks/useScrollStabilizer";
import { useVelocityState } from "./VelocityContext";

interface IntelligentScrollerProps {
  children: React.ReactNode;
}

export function IntelligentScroller({ children }: IntelligentScrollerProps) {
  const { readingState, lockVelocity } = useVelocityState();
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollStabilizer(containerRef, readingState, lockVelocity);

  return (
    <main
      className="relative z-10 mx-auto max-w-3xl px-6 py-24"
      ref={containerRef}
    >
      {children}
    </main>
  );
}
