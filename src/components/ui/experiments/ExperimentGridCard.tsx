'use client';

import React, { useState, memo } from 'react';
import { Experiment } from '@/lib/experiments';
import { StaticExperimentMedia } from './StaticExperimentMedia';

interface ExperimentGridCardProps {
    experiment: Experiment;
    onClick: (e: Experiment) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent, experiment: Experiment) => void;
    isMobileActive: boolean;
}

// Grid Card Component
export const ExperimentGridCard = memo(({
    experiment,
    onClick,
    onTouchStart,
    onTouchEnd,
    isMobileActive
}: ExperimentGridCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    // Combine hover (Desktop) and mobile active state
    // For Grid, we just play the video if hovered or active.
    // No complex transitions needed, the StaticMedia component handles opacity of video vs image.
    const shouldPlay = isHovered || isMobileActive;

    return (
        <div
            role="button"
            tabIndex={0}
            className="group flex flex-col gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick(experiment)}
            onTouchStart={onTouchStart}
            onTouchEnd={(e) => onTouchEnd(e, experiment)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(experiment);
                }
            }}
        >
            {/* Media Container */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/30 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-foreground/20">
                <StaticExperimentMedia
                    experiment={experiment}
                    shouldPlay={shouldPlay}
                />
            </div>

            {/* Content */}
            <div className="space-y-1 flex-1 flex flex-col">
                <div className="flex flex-col gap-1">
                    {experiment.created && (
                        <span className="text-xs text-muted-foreground/60 font-mono" suppressHydrationWarning>
                            {new Date(experiment.created).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    )}
                    <h3 className="font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {experiment.title}
                    </h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed text-pretty">
                    {experiment.description}
                </p>
            </div>
        </div>
    );
});
ExperimentGridCard.displayName = 'ExperimentGridCard';
