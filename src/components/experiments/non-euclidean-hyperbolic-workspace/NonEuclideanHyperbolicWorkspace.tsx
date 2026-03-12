"use client";
import { Info } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { NODE_STYLE, SVG_VIEWPORT_RADIUS } from "./data";
import {
  type GraphEdge,
  type GraphNode,
  generateHyperbolicTree,
} from "./HyperbolicGraphGen";
import { HyperbolicInfoModal } from "./HyperbolicInfoModal";
import { HyperbolicLink } from "./HyperbolicLink";
import { HyperbolicTileMemo as HyperbolicTile } from "./HyperbolicTile";
import { useHyperbolicNavigation } from "./hooks/useHyperbolicNavigation";
import { useViewportRadius } from "./hooks/useViewportRadius";

export default function NonEuclideanHyperbolicWorkspace() {
  const [graph, setGraph] = useState<{
    nodes: GraphNode[];
    edges: GraphEdge[];
  }>({ nodes: [], edges: [] });

  useEffect(() => {
    setGraph(generateHyperbolicTree());
  }, []);

  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    for (const node of graph.nodes) {
      map.set(node.id, node);
    }
    return map;
  }, [graph.nodes]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const viewportRadius = useViewportRadius(containerRef);
  const {
    viewCenter,
    isDragging,
    handleMouseDown,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useHyperbolicNavigation(containerRef);

  return (
    <div className="relative flex h-full min-h-[400px] w-full touch-none select-none flex-col items-center justify-center overflow-hidden bg-zinc-950 p-4 sm:p-8">
      <div className="absolute top-4 right-4 z-50 sm:top-6 sm:right-6">
        <button
          aria-label="About Hyperbolic Workspace"
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

      <div
        className={cn(
          "relative aspect-square w-full max-w-[600px] cursor-move touch-none overflow-hidden rounded-full border border-sky-900/30",
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
          viewBox={`-${SVG_VIEWPORT_RADIUS} -${SVG_VIEWPORT_RADIUS} ${SVG_VIEWPORT_RADIUS * 2} ${SVG_VIEWPORT_RADIUS * 2}`}
        >
          <defs>
            <linearGradient
              id="link-gradient"
              x1="0%"
              x2="100%"
              y1="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.1)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
            </linearGradient>
          </defs>

          <g>
            {graph.edges.map((edge) => {
              const source = nodeMap.get(edge.sourceId);
              const target = nodeMap.get(edge.targetId);
              if (!(source && target)) {
                return null;
              }

              return (
                <HyperbolicLink
                  end={target.logicalPos}
                  key={`${edge.sourceId}-${edge.targetId}`}
                  start={source.logicalPos}
                  viewCenter={viewCenter}
                  viewportRadius={SVG_VIEWPORT_RADIUS}
                />
              );
            })}
          </g>
        </svg>

        {/* Tiles Layer */}
        <div className="pointer-events-none absolute inset-0 z-20">
          <div className="absolute top-1/2 left-1/2 z-0 h-0.5 w-0.5 rounded-full bg-sky-500/30" />

          {graph.nodes.map((node) => (
            <HyperbolicTile
              className={cn(
                "border border-white/10 bg-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
                NODE_STYLE[node.type]
              )}
              isDragging={isDragging}
              key={node.id}
              label={node.label}
              logicalPosition={node.logicalPos}
              viewCenter={viewCenter}
              viewportRadius={viewportRadius}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                {node.icon && (
                  <node.icon
                    className="opacity-90"
                    size={node.type === "root" ? 32 : 16}
                  />
                )}
                <span className="text-center font-medium leading-none tracking-tight drop-shadow-md">
                  {node.label}
                </span>
              </div>
            </HyperbolicTile>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 z-60 rounded-full border-4 border-sky-500/20 shadow-[inset_0_0_60px_20px_rgba(0,0,0,0.6)]" />
      </div>
    </div>
  );
}
