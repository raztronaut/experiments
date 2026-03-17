"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
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
export const ExperimentListItem = React.memo(function ExperimentListItem({
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
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors duration-300 ease-out hover:border-foreground/20 hover:bg-muted/30 md:p-6">
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
            <div className="mb-1">
              <h3
                className={`font-bold text-lg tracking-tight transition-colors duration-300 md:text-2xl ${isMobileActive ? "opacity-0" : "text-foreground"}`}
              >
                {experiment.title}
              </h3>
            </div>
            <p
              className={`text-[13px] leading-relaxed transition-colors duration-300 md:text-base ${isMobileActive ? "opacity-0" : "text-muted-foreground"}`}
            >
              {experiment.description}
            </p>
            <div
              className={`mt-2 flex flex-wrap items-center gap-1 transition-opacity duration-300 ${isMobileActive ? "opacity-0" : ""}`}
            >
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
                  className="pointer-events-auto inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-muted/50 px-3 py-2 font-medium text-muted-foreground text-xs transition-colors hover:border-foreground/20 hover:text-foreground md:min-h-0 md:px-2 md:py-0.5 md:text-[10px]"
                  href={experiment.articleHref}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="h-3 w-3" />
                  Article
                </Link>
              )}
            </div>
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
});
