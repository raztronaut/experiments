"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UmamiEvents, useUmami } from "@/hooks/useUmami";
import type { Experiment } from "@/lib/experiments";
import { useCursor } from "./cursor/Context";
import { ExperimentGridCard } from "./experiments/ExperimentGridCard";
import { ExperimentListItem } from "./experiments/ExperimentListItem";

const InteractivePreviewMedia = dynamic(
  () =>
    import("./experiments/InteractivePreviewMedia").then(
      (mod) => mod.InteractivePreviewMedia
    ),
  { ssr: false }
);

const ExperimentPreviewDrawer = dynamic(
  () =>
    import("./experiments/ExperimentPreviewDrawer").then(
      (mod) => mod.ExperimentPreviewDrawer
    ),
  { ssr: false }
);

interface ExperimentDrawerListProps {
  experiments: Experiment[];
  viewMode: "list" | "grid";
}

const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor;
};

// Cached date formatter options for performance
const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

// Pre-compute formatted date from ISO string
const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString("en-US", dateFormatOptions);
};

/**
 * Displays a list of experiments in either grid or list view with a preview drawer.
 * Refactored into smaller, focused components for better maintainability.
 */
export function ExperimentDrawerList({
  experiments,
  viewMode,
}: ExperimentDrawerListProps) {
  const router = useRouter();
  const [selectedExperiment, setSelectedExperiment] =
    useState<Experiment | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mobilePreviewExperiment, setMobilePreviewExperiment] =
    useState<Experiment | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const { setIsHidden } = useCursor();

  // Analytics
  const { trackExperiment, track } = useUmami();

  // Hover state for list items
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Use REFs for animation values to avoid re-renders
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const smoothPositionRef = useRef({ x: 0, y: 0 });
  const listOriginRef = useRef({ x: 0, y: 0 });

  const [isVisible, setIsVisible] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  const startAnimation = useCallback(() => {
    if (isAnimatingRef.current) {
      return;
    }
    isAnimatingRef.current = true;

    const animate = () => {
      const target = mousePositionRef.current;
      const current = smoothPositionRef.current;

      const nextX = lerp(current.x, target.x, 0.15);
      const nextY = lerp(current.y, target.y, 0.15);

      smoothPositionRef.current = { x: nextX, y: nextY };

      if (previewRef.current) {
        const origin = listOriginRef.current;
        previewRef.current.style.transform = `translate3d(${nextX + 20}px, ${nextY - 100}px, 0)`;
        previewRef.current.style.left = `${origin.x}px`;
        previewRef.current.style.top = `${origin.y}px`;
      }

      if (
        Math.abs(target.x - nextX) < 0.5 &&
        Math.abs(target.y - nextY) < 0.5
      ) {
        isAnimatingRef.current = false;
        animationRef.current = null;
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Memoize formatted dates to avoid recalculating on each render
  const formattedDates = useMemo(() => {
    return new Map(
      experiments.map((exp) => [exp.slug, formatDate(exp.created)])
    );
  }, [experiments]);

  // Hide custom cursor when drawer is open
  useEffect(() => {
    setIsHidden(isOpen);
  }, [isOpen, setIsHidden]);

  // Prefetch when drawer opens (covers mobile tap without hover)
  useEffect(() => {
    if (isOpen && selectedExperiment) {
      router.prefetch(selectedExperiment.href);
      if (selectedExperiment.articleHref) {
        router.prefetch(selectedExperiment.articleHref);
      }
    }
  }, [isOpen, selectedExperiment, router]);

  // Track list origin for position calculations (only in list mode)
  useEffect(() => {
    if (viewMode !== "list") {
      return;
    }

    const updateOrigin = () => {
      if (listRef.current) {
        const rect = listRef.current.getBoundingClientRect();
        listOriginRef.current = { x: rect.left, y: rect.top };
      }
    };

    updateOrigin();
    window.addEventListener("resize", updateOrigin);
    window.addEventListener("scroll", updateOrigin, { passive: true });

    return () => {
      window.removeEventListener("resize", updateOrigin);
      window.removeEventListener("scroll", updateOrigin);
    };
  }, [viewMode]);

  // Start/stop lerp animation when hover state changes in list mode
  useEffect(() => {
    if (viewMode !== "list" || !isVisible) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      isAnimatingRef.current = false;
      return;
    }

    startAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      isAnimatingRef.current = false;
    };
  }, [viewMode, isVisible, startAnimation]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!listRef.current) {
      return;
    }
    const rect = listRef.current.getBoundingClientRect();
    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    if (viewMode === "list" && isVisible && !isAnimatingRef.current) {
      startAnimation();
    }
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    setIsVisible(true);
    // Prefetch experiment and article on hover (cards are not Links, so no viewport prefetch)
    const exp = experiments[index];
    if (exp) {
      router.prefetch(exp.href);
      if (exp.articleHref) router.prefetch(exp.articleHref);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setIsVisible(false);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent, experiment: Experiment) => {
      if (touchStartRef.current === null) {
        return;
      }

      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStartRef.current - touchEnd;

      if (Math.abs(diff) > 50) {
        setMobilePreviewExperiment((prev) =>
          prev?.slug === experiment.slug ? null : experiment
        );
      }
      touchStartRef.current = null;
    },
    []
  );

  const handleExperimentClick = useCallback(
    (experiment: Experiment) => {
      trackExperiment(UmamiEvents.EXPERIMENT_OPEN_DRAWER, {
        slug: experiment.slug,
        title: experiment.title,
      });
      setSelectedExperiment(experiment);
      setIsOpen(true);
    },
    [trackExperiment]
  );

  const handleOpenFullPage = (e?: React.MouseEvent) => {
    if (selectedExperiment) {
      trackExperiment(UmamiEvents.EXPERIMENT_OPEN_FULL, {
        slug: selectedExperiment.slug,
        title: selectedExperiment.title,
      });
      if (e && (e.metaKey || e.ctrlKey)) {
        window.open(selectedExperiment.href, "_blank");
      } else {
        router.push(selectedExperiment.href);
      }
      setIsOpen(false);
    }
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open && selectedExperiment) {
      track(UmamiEvents.DRAWER_CLOSE, {
        experiment_slug: selectedExperiment.slug,
      });
    }
    setIsOpen(open);
  };

  return (
    <>
      <section
        className="relative w-full space-y-6"
        onMouseMove={handleMouseMove}
        ref={listRef}
      >
        {viewMode === "list" ? (
          <div className="relative w-full">
            {/* Floating preview that follows cursor */}
            <div
              className="pointer-events-none fixed z-50 hidden overflow-hidden rounded-xl shadow-2xl md:block"
              ref={previewRef}
              style={{
                left: 0,
                top: 0,
                transform: "translate3d(0, 0, 0)",
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.8,
                width: "280px",
                height: "180px",
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-border/50 bg-background">
                {hoveredIndex !== null && experiments[hoveredIndex] && (
                  <InteractivePreviewMedia
                    experiment={experiments[hoveredIndex]}
                    isHovered={true}
                    key={experiments[hoveredIndex].slug}
                  />
                )}
              </div>
            </div>

            {/* List items */}
            <div className="relative z-10 space-y-4">
              {experiments.map((experiment, index) => (
                <ExperimentListItem
                  experiment={experiment}
                  formattedDate={formattedDates.get(experiment.slug)}
                  isMobileActive={
                    mobilePreviewExperiment?.slug === experiment.slug
                  }
                  key={experiment.slug}
                  onClick={() => handleExperimentClick(experiment)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                  onTouchEnd={(e) => handleTouchEnd(e, experiment)}
                  onTouchStart={handleTouchStart}
                  showTutorial={index === 0}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {experiments.map((experiment, index) => (
              <ExperimentGridCard
                experiment={experiment}
                isMobileActive={
                  mobilePreviewExperiment?.slug === experiment.slug
                }
                key={experiment.slug}
                onClick={handleExperimentClick}
                onTouchEnd={handleTouchEnd}
                onTouchStart={handleTouchStart}
                priority={index === 0}
                showTutorial={index === 0}
              />
            ))}
          </div>
        )}

        {experiments.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No experiments found. Run{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              npm run new:experiment
            </code>{" "}
            to create one.
          </div>
        )}
      </section>

      <ExperimentPreviewDrawer
        experiment={selectedExperiment}
        isOpen={isOpen}
        onOpenChange={handleDrawerOpenChange}
        onOpenFullPage={handleOpenFullPage}
      />
    </>
  );
}
