'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
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

export function ExperimentDrawerList({ experiments }: ExperimentDrawerListProps) {
    const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isHoveringTrafficLights, setIsHoveringTrafficLights] = useState(false);

    // Hover state for list items
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
    const [listOrigin, setListOrigin] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const listRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const lerp = (start: number, end: number, factor: number) => {
            return start + (end - start) * factor;
        };

        const updateOrigin = () => {
            if (listRef.current) {
                const rect = listRef.current.getBoundingClientRect();
                setListOrigin({ x: rect.left, y: rect.top });
            }
        };

        updateOrigin();
        window.addEventListener('resize', updateOrigin);
        window.addEventListener('scroll', updateOrigin);

        const animate = () => {
            setSmoothPosition((prev) => ({
                x: lerp(prev.x, mousePosition.x, 0.15),
                y: lerp(prev.y, mousePosition.y, 0.15),
            }));
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
    }, [mousePosition]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (listRef.current) {
            const rect = listRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
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

    const handleExperimentClick = (experiment: Experiment) => {
        setSelectedExperiment(experiment);
        setIsOpen(true);
    };

    const handleOpenFullPage = () => {
        if (selectedExperiment) {
            window.open(selectedExperiment.href, '_blank');
            setIsOpen(false);
        }
    };

    return (
        <>
            <section
                ref={listRef}
                onMouseMove={handleMouseMove}
                className="relative w-full"
            >
                {/* Floating Preview Image */}
                <div
                    className="pointer-events-none fixed z-50 overflow-hidden rounded-xl shadow-2xl hidden md:block"
                    style={{
                        left: listOrigin.x,
                        top: listOrigin.y,
                        transform: `translate3d(${smoothPosition.x + 20}px, ${smoothPosition.y - 100}px, 0)`,
                        opacity: isVisible ? 1 : 0,
                        scale: isVisible ? 1 : 0.8,
                        transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        width: '280px',
                        height: '180px',
                    }}
                >
                    <div className="relative w-full h-full bg-secondary rounded-xl overflow-hidden border border-border/50">
                        {experiments.map((experiment, index) => {
                            const isHovered = hoveredIndex === index;
                            return (
                                <div
                                    key={experiment.slug}
                                    className="absolute inset-0 w-full h-full transition-all duration-500 ease-out"
                                    style={{
                                        opacity: isHovered ? 1 : 0,
                                        scale: isHovered ? 1 : 1.1,
                                        filter: isHovered ? "none" : "blur(10px)",
                                    }}
                                >
                                    {experiment.video ? (
                                        <video
                                            src={experiment.video}
                                            muted
                                            loop
                                            playsInline
                                            autoPlay
                                            className="w-full h-full object-cover"
                                        />
                                    ) : experiment.image ? (
                                        <Image
                                            src={experiment.image}
                                            alt={experiment.title}
                                            fill
                                            className="object-cover"
                                            sizes="280px"
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center"
                                        >
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
                                </div>
                            );
                        })}
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
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
                        >
                            {/* Card-like container */}
                            <div className="relative p-6 border border-border rounded-xl bg-card transition-all duration-300 ease-out hover:border-foreground/20 hover:bg-muted/30">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-foreground font-medium text-lg tracking-tight mb-2">
                                            {experiment.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {experiment.description}
                                        </p>
                                    </div>

                                    {/* Date */}
                                    {experiment.created && (
                                        <div className="text-right">
                                            <span className="text-xs font-mono text-muted-foreground tabular-nums opacity-60">
                                                {new Date(experiment.created).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {experiments.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
                            No experiments found. Run <code className="bg-muted px-1 py-0.5 rounded">npm run new:experiment</code> to create one.
                        </div>
                    )}
                </div>
            </section>

            <Drawer open={isOpen} onOpenChange={setIsOpen}>
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
                                    {isHoveringTrafficLights && <CloseIcon />}
                                </button>
                            </DrawerClose>

                            {/* Minimize (Yellow) - also closes drawer */}
                            <DrawerClose asChild>
                                <button
                                    className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E] transition-colors flex items-center justify-center"
                                    aria-label="Minimize"
                                >
                                    {isHoveringTrafficLights && <MinimizeIcon />}
                                </button>
                            </DrawerClose>

                            {/* Expand (Green) - opens in new tab */}
                            <button
                                onClick={handleOpenFullPage}
                                className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840] transition-colors flex items-center justify-center"
                                aria-label="Open in new tab"
                            >
                                {isHoveringTrafficLights && <ExpandIcon />}
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
                    <div className="flex-1 overflow-hidden px-4 pb-4">
                        {selectedExperiment && (
                            <iframe
                                src={selectedExperiment.href}
                                className="w-full h-full rounded-lg border bg-background"
                                title={selectedExperiment.title}
                            />
                        )}
                    </div>
                    <DrawerFooter className="pt-2">
                        <p className="text-xs text-muted-foreground text-center">
                            {selectedExperiment?.description}
                        </p>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
