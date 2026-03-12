"use client";
import { X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface HyperbolicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HyperbolicInfoModal({
  isOpen,
  onClose,
}: HyperbolicInfoModalProps) {
  const [isHoveringEscher, setIsHoveringEscher] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Smooth cursor-following via refs (no state-per-frame)
  useEffect(() => {
    if (!isHoveringEscher) {
      return;
    }

    const animate = () => {
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.15;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.15;

      if (previewRef.current) {
        previewRef.current.style.transform = `translate3d(${smoothRef.current.x + 20}px, ${smoothRef.current.y + 20}px, 0)`;
        previewRef.current.style.opacity = "1";
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isHoveringEscher]);

  // Hide preview when not hovering
  useEffect(() => {
    if (!isHoveringEscher && previewRef.current) {
      previewRef.current.style.opacity = "0";
    }
  }, [isHoveringEscher]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap: auto-focus dialog on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // biome-ignore lint: Escape key close handled via useEffect listener
    <div
      aria-labelledby="hyperbolic-modal-title"
      aria-modal="true"
      className="fade-in absolute inset-0 z-100 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200"
      onClick={handleBackdropClick}
      role="dialog"
    >
      {/* Escher Hover Preview */}
      <div
        className="pointer-events-none fixed z-110 hidden overflow-hidden rounded-lg border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl sm:block"
        ref={previewRef}
        style={{
          left: 0,
          top: 0,
          opacity: 0,
          width: "280px",
          height: "280px",
        }}
      >
        <div className="relative h-full w-full">
          <img
            alt="M.C. Escher Circle Limit"
            className="h-full w-full object-contain p-2"
            src="/experiments/non-euclidean-hyperbolic-workspace/escher.png"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
        </div>
      </div>

      <div
        className="relative mx-4 flex max-h-[90%] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl"
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="relative flex-none border-white/5 border-b p-6 pb-4">
          <button
            aria-label="Close dialog"
            className="absolute top-4 right-4 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            onClick={onClose}
          >
            <X size={20} />
          </button>
          <div>
            <h2
              className="mb-2 pr-8 font-bold text-white text-xl sm:text-2xl"
              id="hyperbolic-modal-title"
            >
              Non-Euclidean Hyperbolic Workspace
            </h2>
            <div className="h-0.5 w-12 rounded-full bg-sky-500/50" />
          </div>
        </div>

        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6 pt-4 text-zinc-300">
          <div className="space-y-4 text-sm leading-relaxed">
            <section>
              <h3 className="mb-1 font-medium text-sky-400">Concept</h3>
              <p>
                This experiment abandons the standard Euclidean plane of the web
                browser for <strong>Hyperbolic Geometry</strong>, specifically
                utilizing the <strong>Poincaré Disk Model</strong>—the same
                geometry made famous by{" "}
                <span
                  className="inline-block cursor-help border-sky-300/30 border-b text-sky-300 transition-colors hover:border-sky-300"
                  onMouseEnter={() => setIsHoveringEscher(true)}
                  onMouseLeave={() => setIsHoveringEscher(false)}
                  onMouseMove={handleMouseMove}
                >
                  M.C. Escher&apos;s <em>Circle Limit</em> woodcuts
                </span>
                . In this non-Euclidean space, the entire infinite plane is
                mapped onto a finite unit circle.
              </p>
            </section>

            <section>
              <h3 className="mb-1 font-medium text-purple-400">The Math</h3>
              <ul className="list-disc space-y-1 pl-4 text-zinc-400">
                <li>
                  <strong>Poincaré Disk</strong>: A model of hyperbolic geometry
                  where &quot;lines&quot; are circular arcs orthogonal to the
                  boundary circle.
                </li>
                <li>
                  <strong>Möbius Transformations</strong>: Navigation is not
                  simple addition (
                  <span className="font-mono text-zinc-300">x + Δx</span>); it
                  is a complex conformal mapping (
                  <span className="font-mono text-zinc-300">
                    z ↦ (z - a)/(1 - āz)
                  </span>
                  ) that preserves angles but distorts distances.
                </li>
                <li>
                  <strong>Exponential Growth</strong>: The circumference of a
                  halo around a point grows exponentially with radius, allowing
                  for infinite information density at the &quot;horizon&quot;
                  (the edge of the circle).
                </li>
              </ul>
            </section>

            <section>
              <h3 className="mb-1 font-medium text-emerald-400">Interaction</h3>
              <ul className="list-disc space-y-1 pl-4 text-zinc-400">
                <li>
                  <strong>Panning</strong>: Dragging the workspace applies a
                  Möbius transformation to the world, bringing distant (tiny)
                  objects to the center (large) and pushing central objects to
                  the periphery.
                </li>
                <li>
                  <strong>The Horizon</strong>: Items never leave the screen;
                  they simply tessellate and shrink towards the boundary circle,
                  which represents infinity.
                </li>
              </ul>
            </section>

            <div className="rounded-lg border border-white/5 bg-white/5 p-3 text-xs">
              <strong className="mb-1 block text-zinc-200">Controls</strong>
              <div className="grid grid-cols-2 gap-2">
                <span>Mouse Drag</span>
                <span className="text-zinc-500">
                  Pan the view (apply Möbius transformation)
                </span>
                <span>Arrow Keys</span>
                <span className="text-zinc-500">Pan the view</span>
                <span>Click Tile</span>
                <span className="text-zinc-500">
                  (Placeholder) Interaction with nodes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
