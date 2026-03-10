"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { useMounted } from "@/hooks/useMounted";
import { useCursor } from "./Context";

const getCursorColor = (alpha: number) => `rgba(255, 255, 255, ${alpha})`;

const IDLE_TIMEOUT = 100;

export const Cursor: React.FC = () => {
  const { selectedElement, status, pressing, setStatus, isHidden } =
    useCursor();
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorBodyRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  const stateRef = useRef({ selectedElement, status, isHidden });
  const mouseRef = useRef({ x: -100, y: -100 });
  const gsapRef = useRef<typeof import("gsap").gsap | null>(null);

  useEffect(() => {
    stateRef.current = { selectedElement, status, isHidden };
  }, [selectedElement, status, isHidden]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    let tickerActive = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const updateCursor = () => {
      const g = gsapRef.current;
      if (!(cursorRef.current && g) || stateRef.current.isHidden) {
        return;
      }

      const { selectedElement, status } = stateRef.current;
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
          const padding = 0;
          targetState.x = rect.left + xMove - padding / 2;
          targetState.y = rect.top + yMove - padding / 2;
          targetState.width = rect.width + padding;
          targetState.height = rect.height + padding;
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
          const textSize = (selectedElement.config?.textSize as number) || 20;
          targetState.width = 2;
          targetState.height = textSize;
          targetState.x = x;
          targetState.y = y - textSize / 2;
          targetState.borderRadius = "1px";
          targetState.backgroundColor = getCursorColor(0.8);
          targetState.duration = 0.15;
          targetState.ease = "power4.out";

          if (status !== "entered") {
            setStatus("entered");
          }
        }
      }

      g.to(cursorRef.current, {
        x: targetState.x,
        y: targetState.y,
        duration: targetState.duration,
        ease: targetState.ease,
        overwrite: "auto",
      });

      g.to(cursorBodyRef.current, {
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

    const ensureTickerActive = () => {
      const g = gsapRef.current;
      if (!tickerActive && g) {
        g.ticker.add(updateCursor);
        tickerActive = true;
      }
    };

    const scheduleIdle = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      idleTimer = setTimeout(() => {
        const hasSnap = stateRef.current.selectedElement.el !== null;
        if (!hasSnap && tickerActive && gsapRef.current) {
          gsapRef.current.ticker.remove(updateCursor);
          tickerActive = false;
        }
      }, IDLE_TIMEOUT);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      ensureTickerActive();
      updateCursor();
      scheduleIdle();
    };

    import("gsap").then((mod) => {
      if (disposed) {
        return;
      }
      gsapRef.current = mod.gsap || mod.default;
      window.addEventListener("mousemove", onMouseMove);
      ensureTickerActive();
    });

    return () => {
      disposed = true;
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      window.removeEventListener("mousemove", onMouseMove);
      if (tickerActive && gsapRef.current) {
        gsapRef.current.ticker.remove(updateCursor);
      }
    };
  }, [mounted, setStatus]);

  useEffect(() => {
    if (!cursorBodyRef.current || isHidden || !mounted) {
      return;
    }
    const g = gsapRef.current;
    if (!g) {
      return;
    }
    g.to(cursorBodyRef.current, {
      scale: pressing ? 0.9 : 1,
      duration: 0.1,
      overwrite: "auto",
    });
  }, [pressing, isHidden, mounted]);

  if (!mounted || isHidden) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[10000]"
      ref={cursorRef}
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        backfaceVisibility: "hidden",
        willChange: "transform",
        mixBlendMode: "difference",
      }}
    >
      <div
        ref={cursorBodyRef}
        style={{
          width: 18,
          height: 18,
          borderRadius: "9px",
          backgroundColor: "rgba(255, 255, 255, 0.3)",
        }}
      />
    </div>
  );
};
