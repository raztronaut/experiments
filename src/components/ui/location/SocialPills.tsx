"use client";

import { motion, type Transition } from "motion/react";
import { memo } from "react";
import { WithHover } from "../cursor/WithHover";
import { Icons } from "../icons";

interface SocialPillsProps {
  hoveredId: string | null;
  layoutTransition: Transition;
  setHoveredId: (id: string | null) => void;
}

export const SocialPills = memo(
  ({ hoveredId, setHoveredId, layoutTransition }: SocialPillsProps) => {
    return (
      <motion.div
        className="hidden min-w-[50px] items-center justify-center gap-0.5 md:flex"
        layout
        transition={layoutTransition}
      >
        {/*
         * HISTORY:
         * Attempt 1-3: Various layout strategies.
         * Current: Exact Alignment with LocationPill strategy.
         * Root has layout. Children flow naturally without forced layout props.
         */}
        <WithHover>
          <motion.a
            aria-label="GitHub"
            className="relative z-10 flex h-5 w-7 cursor-pointer items-center justify-center rounded-sm text-foreground transition-colors md:h-8 md:w-9"
            data-umami-event="github_click"
            data-umami-event-type="profile"
            href="https://github.com/raztronaut"
            onMouseEnter={() => setHoveredId("github")}
            onMouseLeave={() => setHoveredId(null)}
            rel="me noopener noreferrer"
            target="_blank"
          >
            {hoveredId === "github" ? (
              <motion.div
                animate={{ opacity: 1 }}
                className="absolute inset-0 -z-10 rounded-sm bg-muted/40"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                layoutId="pill-hover"
              />
            ) : null}
            <Icons.GitHub className="h-5 w-5" />
          </motion.a>
        </WithHover>
        <WithHover>
          <motion.a
            aria-label="X (Twitter)"
            className="relative z-10 flex h-5 w-7 cursor-pointer items-center justify-center rounded-sm text-foreground transition-colors md:h-8 md:w-9"
            data-umami-event="social_click"
            data-umami-event-platform="x"
            href="https://x.com/raztronaut"
            onMouseEnter={() => setHoveredId("x")}
            onMouseLeave={() => setHoveredId(null)}
            rel="me noopener noreferrer"
            target="_blank"
          >
            {hoveredId === "x" ? (
              <motion.div
                animate={{ opacity: 1 }}
                className="absolute inset-0 -z-10 rounded-sm bg-muted/40"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                layoutId="pill-hover"
              />
            ) : null}
            <Icons.X className="h-5 w-5" />
          </motion.a>
        </WithHover>
        <WithHover>
          <motion.a
            aria-label="LinkedIn"
            className="relative z-10 flex h-5 w-7 cursor-pointer items-center justify-center rounded-sm text-foreground transition-colors md:h-8 md:w-9"
            data-umami-event="social_click"
            data-umami-event-platform="linkedin"
            href="https://linkedin.com/in/raztronaut"
            onMouseEnter={() => setHoveredId("linkedin")}
            onMouseLeave={() => setHoveredId(null)}
            rel="me noopener noreferrer"
            target="_blank"
          >
            {hoveredId === "linkedin" ? (
              <motion.div
                animate={{ opacity: 1 }}
                className="absolute inset-0 -z-10 rounded-sm bg-muted/40"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                layoutId="pill-hover"
              />
            ) : null}
            <Icons.Linkedin className="h-5 w-5" />
          </motion.a>
        </WithHover>
      </motion.div>
    );
  }
);

SocialPills.displayName = "SocialPills";
