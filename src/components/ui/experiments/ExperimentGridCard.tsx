"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";
import type { Experiment } from "@/lib/experiments";
import { MobileSwipeTutorialOverlay } from "./MobileSwipeTutorialOverlay";
import { StaticExperimentMedia } from "./StaticExperimentMedia";

interface ExperimentGridCardProps {
  experiment: Experiment;
  isMobileActive: boolean;
  onClick: (e: Experiment) => void;
  onTouchEnd: (e: React.TouchEvent, experiment: Experiment) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  priority?: boolean;
  showTutorial?: boolean;
}

// Cache Intl.DateTimeFormat to avoid parsing/allocation overhead on each render
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Grid Card Component
export const ExperimentGridCard = memo(
  ({
    experiment,
    onClick,
    onTouchStart,
    onTouchEnd,
    isMobileActive,
    showTutorial,
    priority = false,
  }: ExperimentGridCardProps) => {
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

    const PREFETCH_HOVER_DELAY_MS = 100;

    // Debounce prefetch to avoid prefetching on quick mouse pass-over
    useEffect(() => {
      if (!isHovered) {
        return;
      }

      prefetchTimeoutRef.current = setTimeout(() => {
        router.prefetch(experiment.href);
        if (experiment.articleHref) {
          router.prefetch(experiment.articleHref);
        }
        prefetchTimeoutRef.current = null;
      }, PREFETCH_HOVER_DELAY_MS);

      return () => {
        if (prefetchTimeoutRef.current) {
          clearTimeout(prefetchTimeoutRef.current);
          prefetchTimeoutRef.current = null;
        }
      };
    }, [isHovered, experiment.href, experiment.articleHref, router]);

    // Combine hover (Desktop) and mobile active state
    // For Grid, we just play the video if hovered or active.
    // No complex transitions needed, the StaticMedia component handles opacity of video vs image.
    const shouldPlay = isHovered || isMobileActive;

    return (
      <div
        className="group flex h-full cursor-pointer touch-pan-y flex-col gap-3 rounded-xl outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => onClick(experiment)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(experiment);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchEnd={(e) => onTouchEnd(e, experiment)}
        onTouchStart={onTouchStart}
        role="button"
        tabIndex={0}
      >
        {/* Media Container */}
        <div
          className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/30 shadow-xs transition-[border-color,box-shadow] duration-300 group-hover:border-foreground/20 group-hover:shadow-md"
          style={{ viewTransitionName: `experiment-media-${experiment.slug}` }}
        >
          <StaticExperimentMedia
            experiment={experiment}
            priority={priority}
            shouldPlay={shouldPlay}
          />
          {showTutorial && !isMobileActive && <MobileSwipeTutorialOverlay />}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col space-y-1.5">
          <div className="flex flex-col gap-1">
            {experiment.created && (
              <span
                className="font-mono text-muted-foreground/60 text-xs"
                suppressHydrationWarning
              >
                {dateFormatter.format(new Date(experiment.created))}
              </span>
            )}
            <h3 className="font-semibold text-foreground leading-tight tracking-tight transition-colors group-hover:text-primary">
              {experiment.title}
            </h3>
          </div>
          <p className="line-clamp-3 text-pretty text-muted-foreground text-sm leading-relaxed">
            {experiment.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
            {experiment.tech?.map((t) => (
              <span
                className="rounded-full bg-accent px-2 py-0.5 font-medium text-[10px] text-accent-foreground"
                key={t}
              >
                {t}
              </span>
            ))}
            {experiment.articleHref && (
              <Link
                aria-label={`Read article: ${experiment.title}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2 py-0.5 font-medium text-[10px] text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                href={experiment.articleHref}
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="h-3 w-3" />
                Article
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
);
ExperimentGridCard.displayName = "ExperimentGridCard";
