"use client";
import { Info } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  type GraphEdge,
  type GraphNode,
  generateHyperbolicTree,
} from "./HyperbolicGraphGen";
import { HyperbolicInfoModal } from "./HyperbolicInfoModal";
import { HyperbolicLink } from "./HyperbolicLink";
import { Complex, mobiusTransform } from "./HyperbolicMath";
import { HyperbolicTileMemo as HyperbolicTile } from "./HyperbolicTile";

export default function NonEuclideanHyperbolicWorkspace() {
  // Hydration fix: Start with empty state to match server, populate purely on client
  const [graph, setGraph] = useState<{
    nodes: GraphNode[];
    edges: GraphEdge[];
  }>({ nodes: [], edges: [] });

  useEffect(() => {
    // Generate the random graph only on the client
    setGraph(generateHyperbolicTree());
  }, []);

  const [viewCenter, setViewCenter] = useState<Complex>(new Complex(0, 0));
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const dragStartRef = useRef<{
    screen: { x: number; y: number };
    view: Complex;
  } | null>(null);

  // Responsive Radius State
  const [viewportRadius, setViewportRadius] = useState(300);

  useEffect(() => {
    const updateRadius = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewportRadius(Math.min(rect.width, rect.height) / 2);
      }
    };

    // Initial measurement
    updateRadius();

    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let dx = 0;
      let dy = 0;
      const step = 0.1; // Amount to move in screen space per key press

      if (e.key === "ArrowLeft") {
        dx = -step;
      }
      if (e.key === "ArrowRight") {
        dx = step;
      }
      if (e.key === "ArrowUp") {
        dy = -step;
      }
      if (e.key === "ArrowDown") {
        dy = step;
      }

      if (dx === 0 && dy === 0) {
        return;
      }

      // Pan logic: Move view center in opposite direction of "camera" move
      // Actually, if I press Right, I expect the camera to move Right, so the world moves Left.
      // World shift = -dx, -dy

      setViewCenter((current) => {
        const shift = new Complex(dx, dy);
        // Note: drag logic used negative shift. Let's test feel.
        // If I press Right (dx>0), I want to see what is to the right.
        // So I move camera right (+x). New center is old center shifted by +x?
        // mobiusTransform(z, a) maps a to 0.
        // If we want new center to be "the point that was at +x", we pass +x as 'a'.
        return mobiusTransform(current, shift);
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Reset view removed as per user request

  const getRelCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) {
      return { x: 0, y: 0, radius: 1 };
    }
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 2;

    // Normalize to [-1, 1]
    // Note: Coordinate system: +y is Down in DOM, but typically +y is Up in Math.
    // Let's keep DOM coords (+y down) for consistency with mouse,
    // but remember math might expect standard Cartesian.
    // Our Math lib handles arbitrary Complex numbers, so as long as we are consistent it's fine.
    const x = (clientX - centerX) / radius;
    const y = (clientY - centerY) / radius;
    return { x, y, radius };
  };

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsDragging(true);
      const { x, y } = getRelCoords(clientX, clientY);
      dragStartRef.current = {
        screen: { x, y },
        view: viewCenter,
      };
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: legacy experiment, intentional dep pattern
    [viewCenter, getRelCoords]
  ); // viewCenter needed if we want to capture it exactly at start, though ref is better?
  // Actually viewCenter is in state, so closure captures it.
  // Ideally getRelCoords should also be memoized or stable.
  // simpler: just add missing dep to useEffect and suppress if needed, OR memorize functions.

  // Let's go with memoizing handlers to be clean.

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!(isDragging && dragStartRef.current)) {
        return;
      }

      const { x, y } = getRelCoords(clientX, clientY);

      // Sensitivity panner
      const dx = x - dragStartRef.current.screen.x;
      const dy = y - dragStartRef.current.screen.y;

      const currentC = dragStartRef.current.view;
      const shift = new Complex(-dx * 0.8, -dy * 0.8);

      const newCenter = mobiusTransform(currentC, shift);
      setViewCenter(newCenter);
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: legacy experiment, intentional dep pattern
    [isDragging, getRelCoords]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Mouse Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) {
      return;
    }
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleEnd();

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Touch Event Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  return (
    <div className="relative flex h-full min-h-[400px] w-full touch-none select-none flex-col items-center justify-center overflow-hidden bg-zinc-950 p-4 sm:p-8">
      {/* Controls / Info Button */}
      <div className="absolute top-4 right-4 z-50 sm:top-6 sm:right-6">
        <button
          className="group rounded-full border border-white/5 bg-white/5 p-3 text-white/70 shadow-lg backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white"
          onClick={() => setIsInfoOpen(true)}
          title="About Hyperbolic Workspace"
        >
          <Info
            className="transition-transform group-hover:scale-110"
            size={24}
          />
        </button>
      </div>

      <HyperbolicInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />

      {/* Viewport Container */}
      <div
        className={cn(
          "relative aspect-square w-full max-w-[600px] cursor-move touch-none overflow-hidden rounded-full border border-sky-900/30",
          // Added outer glow here so it isn't clipped by overflow-hidden
          "shadow-[0_0_100px_rgba(56,189,248,0.1)]",
          "bg-[radial-gradient(circle_at_center,#1a1b24_0%,#09090b_60%,#000000_100%)]",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        ref={containerRef}
      >
        {/* SVG Layer for Links */}
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          viewBox="-300 -300 600 600"
        >
          <defs>
            <linearGradient
              id="link-gradient"
              x1="0%"
              x2="100%"
              y1="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.1)" />{" "}
              {/* Sky 400 at 10% */}
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />{" "}
              {/* Purple 500 at 10% */}
            </linearGradient>
            <filter height="200%" id="glow" width="200%" x="-50%" y="-50%">
              <feGaussianBlur result="coloredBlur" stdDeviation="4" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g transform="translate(0, 0)">
            {/* Grid removed as per user request */}

            {graph.edges.map((edge) => {
              const source = graph.nodes.find((n) => n.id === edge.sourceId);
              const target = graph.nodes.find((n) => n.id === edge.targetId);
              if (!(source && target)) {
                return null;
              }

              return (
                <HyperbolicLink
                  end={target.logicalPos}
                  key={`${edge.sourceId}-${edge.targetId}`}
                  start={source.logicalPos}
                  viewCenter={viewCenter}
                  viewportRadius={300} // Keep 300 for SVG coord space
                />
              );
            })}
          </g>
        </svg>

        {/* Tiles Layer */}
        <div className="pointer-events-none absolute inset-0 z-20">
          {/* Center Crosshair - made more subtle */}
          <div className="absolute top-1/2 left-1/2 z-0 h-0.5 w-0.5 rounded-full bg-sky-500/30" />

          {graph.nodes.map((node) => (
            <HyperbolicTile
              className={cn(
                "backdrop-blur-md transition-all duration-300",
                // Base glassmorphism - reduced opacity
                "border border-white/10 bg-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
                // Type specific glows AND backgrounds - reduced tint opacity to be subtle
                node.type === "root" &&
                  "border-rose-500/20 bg-rose-500/10 text-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.1)]",
                node.type === "area" &&
                  "border-indigo-500/20 bg-indigo-500/10 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.1)]",
                node.type === "project" &&
                  "border-purple-500/20 bg-purple-500/10 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
                node.type === "note" &&
                  "border-emerald-500/20 bg-emerald-500/10 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
                node.type === "media" &&
                  "border-amber-500/20 bg-amber-500/10 text-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
              )}
              key={node.id}
              logicalPosition={node.logicalPos}
              viewCenter={viewCenter} // Use dynamic radius for DOM elements
              viewportRadius={viewportRadius}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                {node.icon && (
                  <node.icon
                    className="opacity-90"
                    size={node.type === "root" ? 32 : 16}
                  />
                )}
                <span
                  className={cn(
                    "text-center font-medium leading-none tracking-tight drop-shadow-md",
                    node.type === "note" && "hidden group-hover:block"
                  )}
                >
                  {node.label}
                </span>
              </div>
            </HyperbolicTile>
          ))}
        </div>

        {/* Horizon Glow Ring - internal shadow only */}
        <div className="pointer-events-none absolute inset-0 z-60 rounded-full border-4 border-sky-500/20 shadow-[inset_0_0_60px_20px_rgba(0,0,0,0.6)]" />
      </div>

      {/* Footer removed */}
    </div>
  );
}
