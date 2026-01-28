'use client';

import React from 'react';
import { Experiment } from '@/lib/experiments';
import { InteractivePreviewMedia } from './InteractivePreviewMedia';
import { MobileSwipeTutorialOverlay } from './MobileSwipeTutorialOverlay';

interface ExperimentListItemProps {
    experiment: Experiment;
    formattedDate: string | undefined;
    isMobileActive: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
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
    showTutorial
}: ExperimentListItemProps) {
    return (
        <div
            className="group relative block cursor-pointer"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ contentVisibility: 'auto', containIntrinsicSize: '0 100px' }}
        >
            <div className="relative p-4 md:p-6 border border-border rounded-xl bg-card transition-all duration-300 ease-out hover:border-foreground/20 hover:bg-muted/30 overflow-hidden">
                {/* Mobile preview background */}
                <div className={`absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none ${isMobileActive ? 'opacity-100' : 'opacity-0'}`}>
                    {isMobileActive && (
                        <InteractivePreviewMedia
                            experiment={experiment}
                            isHovered={true}
                        />
                    )}

                    <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isMobileActive ? 'opacity-100' : 'opacity-0'}`} />

                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-1 md:gap-4 pointer-events-none">
                    <div className="flex-1 min-w-0 order-last md:order-first w-full">
                        <h2 className={`font-bold text-lg md:text-2xl tracking-tight mb-1 transition-colors duration-300 ${isMobileActive ? 'opacity-0' : 'text-foreground'}`}>
                            {experiment.title}
                        </h2>
                        <p className={`text-[13px] md:text-base leading-relaxed transition-colors duration-300 ${isMobileActive ? 'opacity-0' : 'text-muted-foreground'}`}>
                            {experiment.description}
                        </p>
                    </div>

                    {formattedDate && (
                        <div className="text-left md:text-right w-full md:w-auto order-first md:order-last mb-0 md:mb-0">
                            <span
                                className={`text-[11px] md:text-sm font-mono tabular-nums transition-colors duration-300 ${isMobileActive ? 'opacity-0' : 'text-muted-foreground opacity-60'}`}
                                suppressHydrationWarning
                            >
                                {formattedDate}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {showTutorial && <MobileSwipeTutorialOverlay />}
        </div>

    );
}
