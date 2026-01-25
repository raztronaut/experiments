'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Experiment } from '@/lib/experiments';
import { useUmami, UmamiEvents } from '@/hooks/useUmami';
import { useCursor } from './cursor/Context';

// Extracted components
import { ViewModeToggle } from './experiments/ViewModeToggle';
import { ExperimentListItem } from './experiments/ExperimentListItem';
import { ExperimentGridCard } from './experiments/ExperimentGridCard';
import { ExperimentPreviewDrawer } from './experiments/ExperimentPreviewDrawer';
import { InteractivePreviewMedia } from './experiments/InteractivePreviewMedia';

interface ExperimentDrawerListProps {
    experiments: Experiment[];
}

const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
};

// Cached date formatter options for performance
const dateFormatOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
};

// Pre-compute formatted date from ISO string
const formatDate = (isoDate: string): string => {
    return new Date(isoDate).toLocaleDateString('en-US', dateFormatOptions);
};

/**
 * Displays a list of experiments in either grid or list view with a preview drawer.
 * Refactored into smaller, focused components for better maintainability.
 */
export function ExperimentDrawerList({ experiments }: ExperimentDrawerListProps) {
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [mobilePreviewExperiment, setMobilePreviewExperiment] = useState<Experiment | null>(null);
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

    // Memoize formatted dates to avoid recalculating on each render
    const formattedDates = useMemo(() => {
        return new Map(
            experiments.map(exp => [exp.slug, formatDate(exp.created)])
        );
    }, [experiments]);

    // Hide custom cursor when drawer is open
    useEffect(() => {
        setIsHidden(isOpen);
    }, [isOpen, setIsHidden]);

    // Animation loop for smooth preview following cursor
    useEffect(() => {
        const updateOrigin = () => {
            if (listRef.current) {
                const rect = listRef.current.getBoundingClientRect();
                listOriginRef.current = { x: rect.left, y: rect.top };
            }
        };

        updateOrigin();
        window.addEventListener('resize', updateOrigin);
        window.addEventListener('scroll', updateOrigin, { passive: true });

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

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', updateOrigin);
            window.removeEventListener('scroll', updateOrigin);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (listRef.current) {
            const rect = listRef.current.getBoundingClientRect();
            mousePositionRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }
    };

    const handleMouseEnter = (index: number) => {
        setHoveredIndex(index);
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
        setIsVisible(false);
    };

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent, experiment: Experiment) => {
        if (touchStartRef.current === null) return;

        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStartRef.current - touchEnd;

        if (Math.abs(diff) > 50) {
            setMobilePreviewExperiment(prev => prev?.slug === experiment.slug ? null : experiment);
        }
        touchStartRef.current = null;
    }, []);

    const handleExperimentClick = useCallback((experiment: Experiment) => {
        trackExperiment(UmamiEvents.EXPERIMENT_OPEN_DRAWER, {
            slug: experiment.slug,
            title: experiment.title,
        });
        setSelectedExperiment(experiment);
        setIsOpen(true);
    }, [trackExperiment]);

    const handleOpenFullPage = () => {
        if (selectedExperiment) {
            trackExperiment(UmamiEvents.EXPERIMENT_OPEN_FULL, {
                slug: selectedExperiment.slug,
                title: selectedExperiment.title,
            });
            window.open(selectedExperiment.href, '_blank');
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
                ref={listRef}
                onMouseMove={handleMouseMove}
                className="relative w-full space-y-6"
            >
                <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />

                {viewMode === 'list' ? (
                    <div className="relative w-full">
                        {/* Floating preview that follows cursor */}
                        <div
                            ref={previewRef}
                            className="pointer-events-none fixed z-50 overflow-hidden rounded-xl shadow-2xl hidden md:block"
                            style={{
                                left: 0,
                                top: 0,
                                transform: 'translate3d(0, 0, 0)',
                                opacity: isVisible ? 1 : 0,
                                scale: isVisible ? 1 : 0.8,
                                width: '280px',
                                height: '180px',
                            }}
                        >
                            <div className="relative w-full h-full bg-secondary rounded-xl overflow-hidden border border-border/50">
                                {hoveredIndex !== null && experiments[hoveredIndex] && (
                                    <InteractivePreviewMedia
                                        key={experiments[hoveredIndex].slug}
                                        experiment={experiments[hoveredIndex]}
                                        isHovered={true}
                                    />
                                )}
                            </div>
                        </div>

                        {/* List items */}
                        <div className="space-y-4 relative z-10">
                            {experiments.map((experiment, index) => (
                                <ExperimentListItem
                                    key={experiment.slug}
                                    experiment={experiment}
                                    formattedDate={formattedDates.get(experiment.slug)}
                                    isMobileActive={mobilePreviewExperiment?.slug === experiment.slug}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => handleExperimentClick(experiment)}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={(e) => handleTouchEnd(e, experiment)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
                        {experiments.map((experiment) => (
                            <ExperimentGridCard
                                key={experiment.slug}
                                experiment={experiment}
                                onClick={handleExperimentClick}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                                isMobileActive={mobilePreviewExperiment?.slug === experiment.slug}
                            />
                        ))}
                    </div>
                )}

                {experiments.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                        No experiments found. Run <code className="bg-muted px-1 py-0.5 rounded">npm run new:experiment</code> to create one.
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
