"use client";

import { memo } from "react";
import { motion, Transition } from "framer-motion";
import { WithHover } from "../cursor/WithHover";
import { Icons } from "../icons";

interface SocialPillsProps {
    hoveredId: string | null;
    setHoveredId: (id: string | null) => void;
    layoutTransition: Transition;
}

export const SocialPills = memo(({
    hoveredId,
    setHoveredId,
    layoutTransition
}: SocialPillsProps) => {
    return (
        <motion.div
            layout
            transition={layoutTransition}
            className="hidden md:flex items-center gap-0.5 min-w-[50px] justify-center"
        >
            {/* 
             * HISTORY:
             * Attempt 1-3: Various layout strategies.
             * Current: Exact Alignment with LocationPill strategy. 
             * Root has layout. Children flow naturally without forced layout props.
             */}
            <WithHover>
                <motion.a
                    href="https://github.com/raztronaut"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredId('github')}
                    onMouseLeave={() => setHoveredId(null)}
                    className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm w-7 h-5 md:w-9 md:h-8"
                    aria-label="GitHub"
                    data-umami-event="github_click"
                    data-umami-event-type="profile"
                >
                    {hoveredId === 'github' ? (
                        <motion.div
                            layoutId="pill-hover"
                            className="absolute inset-0 bg-muted/40 rounded-sm -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    ) : null}
                    <Icons.GitHub className="h-5 w-5" />
                </motion.a>
            </WithHover>
            <WithHover>
                <motion.a
                    href="https://x.com/raztronaut"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredId('x')}
                    onMouseLeave={() => setHoveredId(null)}
                    className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm w-7 h-5 md:w-9 md:h-8"
                    aria-label="X (Twitter)"
                    data-umami-event="social_click"
                    data-umami-event-platform="x"
                >
                    {hoveredId === 'x' ? (
                        <motion.div
                            layoutId="pill-hover"
                            className="absolute inset-0 bg-muted/40 rounded-sm -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    ) : null}
                    <Icons.X className="h-5 w-5" />
                </motion.a>
            </WithHover>
            <WithHover>
                <motion.a
                    href="https://linkedin.com/in/raztronaut"
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredId('linkedin')}
                    onMouseLeave={() => setHoveredId(null)}
                    className="relative z-10 text-foreground transition-colors cursor-pointer flex items-center justify-center rounded-sm w-7 h-5 md:w-9 md:h-8"
                    aria-label="LinkedIn"
                    data-umami-event="social_click"
                    data-umami-event-platform="linkedin"
                >
                    {hoveredId === 'linkedin' ? (
                        <motion.div
                            layoutId="pill-hover"
                            className="absolute inset-0 bg-muted/40 rounded-sm -z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    ) : null}
                    <Icons.Linkedin className="h-5 w-5" />
                </motion.a>
            </WithHover>
        </motion.div>
    );
});

SocialPills.displayName = "SocialPills";
