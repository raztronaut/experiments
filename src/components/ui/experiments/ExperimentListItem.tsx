"use client";

import { FileText } from "lucide-react";
import React from "react";
import type { Experiment } from "@/lib/experiments";
import { InteractivePreviewMedia } from "./InteractivePreviewMedia";
import { MobileSwipeTutorialOverlay } from "./MobileSwipeTutorialOverlay";

interface ExperimentListItemProps {
  experiment: Experiment;
  formattedDate: string | undefined;
  isMobileActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  showTutorial?: boolean;
}

/**
 * A single experiment item in list view with hover preview support.
 */
export function ExperimentListItem({
  experiment,
  formattedDate,
  isMobileActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onTouchStart,
  onTouchEnd,
  showTutorial,
}: ExperimentListItemProps) {
  const [isTutorialActive, setIsTutorialActive] = React.useState(false);

  return (
    <div
      className="group relative block cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 100px" }}
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 ease-out hover:border-foreground/20 hover:bg-muted/30 md:p-6">
        {/* Mobile preview background */}
        <div
          className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ${isMobileActive ? "opacity-100" : isTutorialActive ? "opacity-40 md:opacity-0" : "opacity-0"}`}
        >
          {(showTutorial || isMobileActive || isTutorialActive) && (
            <InteractivePreviewMedia
              experiment={experiment}
              forceStatic={
                (showTutorial || isTutorialActive) && !isMobileActive
              }
              isHovered={isMobileActive}
            />
          )}

          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isMobileActive ? "opacity-100" : "opacity-0"}`}
          />
        </div>

        {/* Content */}
        <div className="pointer-events-none relative z-10 flex flex-col items-start justify-between gap-1 md:flex-row md:gap-4">
          <div className="order-last w-full min-w-0 flex-1 md:order-first">
            <div className="mb-1 flex items-center gap-2">
              <h2
                className={`font-bold text-lg tracking-tight transition-colors duration-300 md:text-2xl ${isMobileActive ? "opacity-0" : "text-foreground"}`}
              >
                {experiment.title}
              </h2>
              {experiment.content?.article && (
                <FileText
                  className={`h-4 w-4 shrink-0 transition-opacity duration-300 ${isMobileActive ? "opacity-0" : "text-muted-foreground/60"}`}
                />
              )}
            </div>
            <p
              className={`text-[13px] leading-relaxed transition-colors duration-300 md:text-base ${isMobileActive ? "opacity-0" : "text-muted-foreground"}`}
            >
              {experiment.description}
            </p>
          </div>

          {formattedDate && (
            <div className="order-first mb-0 w-full text-left md:order-last md:mb-0 md:w-auto md:text-right">
              <span
                className={`font-mono text-[11px] tabular-nums transition-colors duration-300 md:text-sm ${isMobileActive ? "opacity-0" : "text-muted-foreground opacity-60"}`}
                suppressHydrationWarning
              >
                {formattedDate}
              </span>
            </div>
          )}
        </div>
      </div>
      {showTutorial && !isMobileActive && (
        <MobileSwipeTutorialOverlay onVisibilityChange={setIsTutorialActive} />
      )}
    </div>
  );
}
