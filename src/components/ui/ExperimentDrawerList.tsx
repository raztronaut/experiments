'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink, LayoutGrid, List } from 'lucide-react';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Experiment } from '@/lib/experiments';
import { useUmami, UmamiEvents } from '@/hooks/useUmami';
import { ExperimentGridCard } from './experiments/ExperimentGridCard';
import { InteractivePreviewMedia } from './experiments/InteractivePreviewMedia';

interface ExperimentDrawerListProps {
    experiments: Experiment[];
}

// macOS Traffic Light Icons (shown on hover)
const CloseIcon = () => (
    <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5">
        <path d="M3 3l6 6M9 3l-6 6" strokeLinecap="round" />
    </svg>
);

const MinimizeIcon = () => (
    <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5">
        <path d="M2.5 6h7" strokeLinecap="round" />
    </svg>
);

const ExpandIcon = () => (
    <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2">
        <path d="M2 6.5v3.5h3.5M10 5.5v-3.5h-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
};

export function ExperimentDrawerList({ experiments }: ExperimentDrawerListProps) {
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [isHoveringTrafficLights, setIsHoveringTrafficLights] = useState(false);
    const [mobilePreviewExperiment, setMobilePreviewExperiment] = useState<Experiment | null>(null);
    const touchStartRef = useRef<number | null>(null);

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
                <div className="flex items-center justify-end">
                    <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                            aria-label="Grid view"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-background shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                            aria-label="List view"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="relative w-full">
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

                        <div className="space-y-4 relative z-10">
                            {experiments.map((experiment, index) => (
                                <div
                                    key={experiment.slug}
                                    className="group relative block cursor-pointer"
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => handleExperimentClick(experiment)}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={(e) => handleTouchEnd(e, experiment)}
                                >
                                    <div className="relative p-6 border border-border rounded-xl bg-card transition-all duration-300 ease-out hover:border-foreground/20 hover:bg-muted/30 overflow-hidden">
                                        <div className={`absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none ${mobilePreviewExperiment?.slug === experiment.slug ? 'opacity-100' : 'opacity-0'
                                            }`}>
                                            {mobilePreviewExperiment?.slug === experiment.slug && (
                                                <InteractivePreviewMedia
                                                    experiment={experiment}
                                                    isHovered={true}
                                                />
                                            )}
                                            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${mobilePreviewExperiment?.slug === experiment.slug ? 'opacity-100' : 'opacity-0'
                                                }`} />
                                        </div>

                                        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-2 md:gap-4 pointer-events-none">
                                            <div className="flex-1 min-w-0 order-last md:order-first w-full">
                                                <h2 className={`font-bold text-2xl tracking-tight mb-2 transition-colors duration-300 ${mobilePreviewExperiment?.slug === experiment.slug
                                                    ? 'opacity-0'
                                                    : 'text-foreground'
                                                    }`}>
                                                    {experiment.title}
                                                </h2>
                                                <p className={`text-base leading-relaxed transition-colors duration-300 ${mobilePreviewExperiment?.slug === experiment.slug
                                                    ? 'opacity-0'
                                                    : 'text-muted-foreground'
                                                    }`}>
                                                    {experiment.description}
                                                </p>
                                            </div>

                                            {experiment.created ? (
                                                <div className="text-left md:text-right w-full md:w-auto order-first md:order-last mb-2 md:mb-0">
                                                    <span
                                                        className={`text-sm font-mono tabular-nums transition-colors duration-300 ${mobilePreviewExperiment?.slug === experiment.slug
                                                            ? 'opacity-0'
                                                            : 'text-muted-foreground opacity-60'
                                                            }`}
                                                        suppressHydrationWarning
                                                    >
                                                        {new Date(experiment.created).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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

            <Drawer open={isOpen} onOpenChange={handleDrawerOpenChange}>
                <DrawerContent className="h-[85vh]">
                    <DrawerHeader className="flex flex-row items-center justify-between px-4 py-3">
                        <div
                            className="flex items-center gap-2"
                            onMouseEnter={() => setIsHoveringTrafficLights(true)}
                            onMouseLeave={() => setIsHoveringTrafficLights(false)}
                        >
                            <DrawerClose asChild>
                                <button
                                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57] transition-colors flex items-center justify-center"
                                    aria-label="Close"
                                >
                                    {isHoveringTrafficLights ? <CloseIcon /> : null}
                                </button>
                            </DrawerClose>

                            <DrawerClose asChild>
                                <button
                                    className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E] transition-colors flex items-center justify-center"
                                    aria-label="Minimize"
                                >
                                    {isHoveringTrafficLights ? <MinimizeIcon /> : null}
                                </button>
                            </DrawerClose>

                            <button
                                onClick={handleOpenFullPage}
                                className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840] transition-colors flex items-center justify-center"
                                aria-label="Open in new tab"
                            >
                                {isHoveringTrafficLights ? <ExpandIcon /> : null}
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <DrawerTitle className="text-sm font-medium">{selectedExperiment?.title}</DrawerTitle>
                            <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                                <Link href={selectedExperiment?.href || '#'} target="_blank">
                                    <ExternalLink className="h-3 w-3 mr-1.5" />
                                    Open Full Page
                                </Link>
                            </Button>
                        </div>
                    </DrawerHeader>
                    <div className="p-4 h-full">
                        {selectedExperiment && (
                            <iframe
                                src={selectedExperiment.href}
                                className="w-full h-full rounded-lg border bg-background"
                                title={selectedExperiment.title}
                            />
                        )}
                    </div>
                    <DrawerFooter className="pt-2 pb-8">
                        <p className="text-xs text-muted-foreground text-center">
                            {selectedExperiment?.description}
                        </p>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
