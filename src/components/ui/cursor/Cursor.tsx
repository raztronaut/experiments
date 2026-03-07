"use client";

import { gsap } from "gsap";
import type React from "react";
import { useEffect, useRef } from "react";
import { useMounted } from "@/hooks/useMounted";
import { useCursor } from "./Context";

export const Cursor: React.FC = () => {
  const { selectedElement, status, pressing, setStatus, isHidden } =
    useCursor();
  const cursorRef = useRef<HTMLDivElement>(null); // Position container (transform x/y)
  const cursorBodyRef = useRef<HTMLDivElement>(null); // Shape container (width/height/radius)
  const mounted = useMounted();

  // Store latest state in refs to access in event listener without re-binding
  const stateRef = useRef({ selectedElement, status, isHidden });
  // Track mouse position globally to persist across effect re-runs
  const mouseRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    stateRef.current = { selectedElement, status, isHidden };
  }, [selectedElement, status, isHidden]);

  // Always use white color - mixBlendMode "difference" makes it visible on any background
  // On dark background: white stays white
  // On light background: white becomes dark (inverted)
  const getCursorColor = (alpha: number) => `rgba(255, 255, 255, ${alpha})`;

  // Update position smoothly
  useEffect(() => {
    if (!mounted) {
      return;
    }

    // Shared update logic
    const updateCursor = () => {
      if (!cursorRef.current || stateRef.current.isHidden) {
        return;
      }

      const { selectedElement, status } = stateRef.current;
      // Use last known mouse position
      const x = mouseRef.current.x;
      const y = mouseRef.current.y;

      const targetState = {
        x: x - 9,
        y: y - 9,
        width: 18,
        height: 18,
        borderRadius: "9px",
        backgroundColor: getCursorColor(0.3),
        border: `0px solid ${getCursorColor(0)}`,
        mixBlendMode: "difference",
        duration: 0.1,
        ease: "power2.out",
      };

      const isSnapped =
        selectedElement.el &&
        (status === "entering" ||
          status === "shifting" ||
          status === "entered");

      if (selectedElement.el && isSnapped) {
        const rect = selectedElement.el.getBoundingClientRect();
        const amount = 4;
        const xMid = rect.width / 2;
        const yMid = rect.height / 2;
        const relX = x - rect.left;
        const relY = y - rect.top;
        const xMove = ((relX - xMid) / rect.width) * amount;
        const yMove = ((relY - yMid) / rect.height) * amount;

        if (selectedElement.type === "block") {
          // Block cursor (Buttons, Cards)
          const padding = 0;
          targetState.x = rect.left + xMove - padding / 2;
          targetState.y = rect.top + yMove - padding / 2;
          targetState.width = rect.width + padding;
          targetState.height = rect.height + padding;
          // Ensure radius is clean string to avoid interpolation bugs
          // Default to 6px if not specified, which matches standard button radius
          targetState.borderRadius =
            (selectedElement.config?.borderRadius as string) || "6px";
          targetState.backgroundColor = getCursorColor(0.15);
          targetState.border = `1px solid ${getCursorColor(0.2)}`;
          targetState.duration = 0.3;
          targetState.ease = "power3.out";

          if (status !== "entered") {
            setStatus("entered");
          }
        } else if (selectedElement.type === "text") {
          // Text cursor (vertical line)
          const textSize = (selectedElement.config?.textSize as number) || 20;
          targetState.width = 2; // Fixed width for text cursor
          targetState.height = textSize;
          targetState.x = x;
          targetState.y = y - textSize / 2;
          targetState.borderRadius = "1px"; // Explicit px for smooth morph from 9px
          targetState.backgroundColor = getCursorColor(0.8);
          targetState.duration = 0.15;
          targetState.ease = "power4.out"; // Snappier text transition

          if (status !== "entered") {
            setStatus("entered");
          }
        }
      }

      // Fire Position Tween (GPU)
      gsap.to(cursorRef.current, {
        x: targetState.x,
        y: targetState.y,
        duration: targetState.duration,
        ease: targetState.ease,
        overwrite: "auto",
        // Ensure layout properties are NOT touched here to prevent layout thrashing
      });

      // Fire Shape Tween (Layout/Paint)
      gsap.to(cursorBodyRef.current, {
        width: targetState.width,
        height: targetState.height,
        borderRadius: targetState.borderRadius,
        backgroundColor: targetState.backgroundColor,
        border: targetState.border,
        duration: targetState.duration,
        ease: targetState.ease,
        overwrite: "auto",
        boxSizing: "border-box",
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Immediate update for responsiveness
      updateCursor();
    };

    window.addEventListener("mousemove", onMouseMove);

    // Add ticker for continuous updates (handles animations/resizes while hovering)
    gsap.ticker.add(updateCursor);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      gsap.ticker.remove(updateCursor);
    };
  }, [mounted, setStatus, getCursorColor]);

  // Pressing effect
  useEffect(() => {
    if (!cursorBodyRef.current || isHidden || !mounted) {
      return;
    }
    gsap.to(cursorBodyRef.current, {
      scale: pressing ? 0.9 : 1,
      duration: 0.1,
      overwrite: "auto",
    });
  }, [pressing, isHidden, mounted]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || isHidden) {
    return null;
  }

  // Always use white - mixBlendMode "difference" inverts it on light backgrounds

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[10000]" // POSITION ONLY
      ref={cursorRef}
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
        mixBlendMode: "difference", // Blend mode on container
      }}
    >
      <div
        ref={cursorBodyRef} // SHAPE ONLY
        style={{
          width: 18,
          height: 18,
          borderRadius: "9px", // Match default state
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          willChange: "width, height, border-radius",
        }}
      />
    </div>
  );
};
