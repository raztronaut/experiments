'use client';

import React, { useState, useRef, useEffect, memo } from 'react';
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
import Image from 'next/image';
import { useUmami, UmamiEvents } from '@/hooks/useUmami';


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

// Reusable Preview Component (Top-level to prevent re-renders)
// Reusable Preview Component (Top-level to prevent re-renders)
// Reusable Preview Component (Top-level to prevent re-renders)
// Reusable Preview Component (Top-level to prevent re-renders)
const ExperimentPreviewMedia = memo(function ExperimentPreviewMedia({
    experiment,
    variant = 'interactive', // 'interactive' (float) or 'static' (grid)
    isHovered = false, // Controlled hover state
}: {
    experiment: Experiment;
    variant?: 'interactive' | 'static';
    isHovered?: boolean;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInViewport, setIsInViewport] = useState(false);

    // Intersection Observer for lazy loading/mounting video
    useEffect(() => {
        // We observe regardless of video existence to ensure state is synced/consistent
        // logic downstream handles if video needs to be rendered/played.

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInViewport(entry.isIntersecting);
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []); // Only run once on mount (refs are stable)


    // Derived logic:
    // variant='interactive': container hidden (opacity 0) unless isHovered
    // variant='static': container always visible. Video plays if hovered.

    const isVisibleStyle = variant === 'interactive' ? isHovered : true;

    const style = variant === 'interactive' ? {
        opacity: isVisibleStyle ? 1 : 0,
        scale: isVisibleStyle ? 1 : 1.1,
        filter: isVisibleStyle ? "none" : "blur(10px)",
    } : undefined;

    // Play video if:
    // 1. In viewport (perf)
    // 2. AND we are supposed to play (hovered in static, or visible in interactive)
    const shouldPlay = isInViewport && isHovered;

    // Render video if:
    // 1. We have no image (fallback) and are in viewport
    // 2. OR we are playing
    const hasImage = !!experiment.image;
    const shouldRenderVideo = isInViewport && (!hasImage || shouldPlay);

    useEffect(() => {
        if (!videoRef.current) return;

        if (shouldPlay) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.debug("Video autoplay prevented:", error);
                });
            }
        } else {
            videoRef.current.pause();
            if (!hasImage) {
                videoRef.current.currentTime = 0;
            }
        }
    }, [shouldPlay, hasImage]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 w-full h-full transition-all duration-500 ease-out bg-secondary"
            style={style}
        >
            {/* Image Layer */}
            {experiment.image && (
                <Image
                    src={experiment.image}
                    alt={experiment.title}
                    fill
                    className="object-cover z-0"
                    sizes="(max-width: 768px) 100vw, 280px"
                    priority={variant === 'interactive' && isHovered}
                />
            )}

            {/* Video Layer */}
            {experiment.video && shouldRenderVideo && (
                <>
                    <video
                        ref={videoRef}
                        src={experiment.video}
                        muted
                        loop
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover z-10 ${hasImage ? 'transition-opacity duration-500' : ''}`}
                    />

                </>
            )}

            {/* Fallback */}
            {!experiment.image && !experiment.video && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center z-0">
                    <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">No Preview</span>
                </div>
            )}

            {experiment.isPlaceholder && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20 pointer-events-none">
                    <span className="text-white font-['Comic_Sans_MS'] font-bold text-sm border-2 border-white/50 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm -rotate-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transform hover:scale-110 transition-transform">
                        NO PREVIEW YET
                    </span>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none z-10" />
        </div>
    );
});

const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
};

// Grid Card Component
const ExperimentGridCard = memo(({
    experiment,
    onClick,
    onTouchStart,
    onTouchEnd,
    isMobileActive
}: {
    experiment: Experiment;
    onClick: (e: Experiment) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent, experiment: Experiment) => void;
    isMobileActive: boolean;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Combine hover (Desktop) and mobile active state
    const shouldShowPreview = isHovered || isMobileActive;

    return (
        <div
            role="button"
            tabIndex={0}
            className="group flex flex-col gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
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
                <ExperimentPreviewMedia
                    experiment={experiment}
                    variant="static"
                    isHovered={shouldShowPreview}
                />
            </div>

            {/* Content */}
            <div className="space-y-1">
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
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {experiment.description}
                </p>
            </div>
        </div>
    );
});
ExperimentGridCard.displayName = 'ExperimentGridCard';

export function ExperimentDrawerList({ experiments }: ExperimentDrawerListProps) {
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to Grid
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
            // Read latest values from refs
            const target = mousePositionRef.current;
            const current = smoothPositionRef.current;

            // LERP from ref to ref
            const nextX = lerp(current.x, target.x, 0.15);
            const nextY = lerp(current.y, target.y, 0.15);

            // Update the source ref
            smoothPositionRef.current = { x: nextX, y: nextY };

            // Direct DOM update (Zero React Render)
            if (previewRef.current) {
                // We need to account for the list origin here since the preview is fixed/absolute
                // If the preview is fixed relative to viewport, we need listOrigin
                // Original code: left: listOrigin.x, top: listOrigin.y in render + translate3d
                // We'll update the transform directly
                const origin = listOriginRef.current;

                // We must apply the base offset (origin) + smooth offset
                // But wait, the original code had 'left' and 'top' set in style. 
                // Let's set the full transform including the origin to be safe, OR keep generic styles
                // The easiest way is to keep 'left/top' in the Ref-based style update or just translate relative to 0,0

                // Let's stick to the previous logic: 
                // Rendered style: left: listOrigin.x, top: listOrigin.y
                // Transform: translate3d(smoothX, smoothY, 0)

                // Since we can't easily update 'left/top' props without re-render if listOrigin changes (resize/scroll),
                // we'll rely on the existing effect to handle resize/scroll for origin, 
                // BUT actually listOrigin causes a re-render only on Scroll/Resize which is fine.
                // The 60fps comes from mouse movement.

                // So, inside this loop we ONLY update transform.
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
    }, []); // No dependencies!

    const handleMouseMove = (e: React.MouseEvent) => {
        if (listRef.current) {
            const rect = listRef.current.getBoundingClientRect();
            // Update ref, no re-render
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

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent, experiment: Experiment) => {
        if (touchStartRef.current === null) return;

        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStartRef.current - touchEnd;

        // Swipe threshold (50px)
        if (Math.abs(diff) > 50) {
            setMobilePreviewExperiment(prev => prev?.slug === experiment.slug ? null : experiment);
        }
        touchStartRef.current = null;
    };

    const handleExperimentClick = (experiment: Experiment) => {
        trackExperiment(UmamiEvents.EXPERIMENT_OPEN_DRAWER, {
            slug: experiment.slug,
            title: experiment.title,
        });
        setSelectedExperiment(experiment);
        setIsOpen(true);
    };

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

    // ... (Inside main component)




    return (
        <>
            <section
                ref={listRef}
                onMouseMove={handleMouseMove}
                className="relative w-full space-y-6"
            >
                {/* View Controls */}
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
                        {/* Floating Preview Image (Desktop Only - List Mode) */}
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
                                {experiments.map((experiment, index) => (
                                    <ExperimentPreviewMedia
                                        key={experiment.slug}
                                        experiment={experiment}
                                        variant="interactive"
                                        isHovered={hoveredIndex === index}
                                    />
                                ))}
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
                                    {/* Card-like container */}
                                    <div className="relative p-6 border border-border rounded-xl bg-card transition-all duration-300 ease-out hover:border-foreground/20 hover:bg-muted/30 overflow-hidden">
                                        {/* In-Card Mobile Swipe Preview */}
                                        <div className={`absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none ${mobilePreviewExperiment?.slug === experiment.slug ? 'opacity-100' : 'opacity-0'
                                            }`}>
                                            <ExperimentPreviewMedia
                                                experiment={experiment}
                                                variant="interactive"
                                                isHovered={mobilePreviewExperiment?.slug === experiment.slug}
                                            />
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

                                            {/* Date */}
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
                    // Grid View
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
                        {/* macOS Traffic Lights */}
                        <div
                            className="flex items-center gap-2"
                            onMouseEnter={() => setIsHoveringTrafficLights(true)}
                            onMouseLeave={() => setIsHoveringTrafficLights(false)}
                        >
                            {/* Close (Red) */}
                            <DrawerClose asChild>
                                <button
                                    className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57] transition-colors flex items-center justify-center"
                                    aria-label="Close"
                                >
                                    {isHoveringTrafficLights ? <CloseIcon /> : null}
                                </button>
                            </DrawerClose>

                            {/* Minimize (Yellow) - also closes drawer */}
                            <DrawerClose asChild>
                                <button
                                    className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E] transition-colors flex items-center justify-center"
                                    aria-label="Minimize"
                                >
                                    {isHoveringTrafficLights ? <MinimizeIcon /> : null}
                                </button>
                            </DrawerClose>

                            {/* Expand (Green) - opens in new tab */}
                            <button
                                onClick={handleOpenFullPage}
                                className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840] transition-colors flex items-center justify-center"
                                aria-label="Open in new tab"
                            >
                                {isHoveringTrafficLights ? <ExpandIcon /> : null}
                            </button>
                        </div>

                        {/* Title and Open Full Page button */}
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
