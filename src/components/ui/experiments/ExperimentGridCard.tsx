"use client";

import { FileText } from "lucide-react";
import type React from "react";
import { memo, useState } from "react";
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
    const [isHovered, setIsHovered] = useState(false);

    // Combine hover (Desktop) and mobile active state
    // For Grid, we just play the video if hovered or active.
    // No complex transitions needed, the StaticMedia component handles opacity of video vs image.
    const shouldPlay = isHovered || isMobileActive;

    return (
      <div
        className="group flex h-full cursor-pointer flex-col gap-3 rounded-xl outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
        <div className="flex flex-1 flex-col space-y-1">
          <div className="flex flex-col gap-1">
            {experiment.created && (
              <span
                className="font-mono text-muted-foreground/60 text-xs"
                suppressHydrationWarning
              >
                {new Date(experiment.created).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground leading-tight tracking-tight transition-colors group-hover:text-primary">
                {experiment.title}
              </h3>
              {experiment.content?.article && (
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
              )}
            </div>
          </div>
          <p className="line-clamp-3 text-pretty text-muted-foreground text-sm leading-relaxed">
            {experiment.description}
          </p>
        </div>
      </div>
    );
  }
);
ExperimentGridCard.displayName = "ExperimentGridCard";
