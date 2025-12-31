"use client";

import React, { useRef, useEffect, useLayoutEffect } from 'react';
import { VelocityProvider, useVelocityState } from './VelocityContext';
import { VelocityText } from './VelocityText';
import { VelocityImage } from './VelocityImage';
import { VelocityCodeBlock } from './VelocityCodeBlock';
import { SpeedLines } from './SpeedLines';
import { motion } from 'framer-motion';
import { Settings, Zap, Monitor } from 'lucide-react';
import { CONTENT } from './content';
import { VELOCITY_THRESHOLDS } from './constants';
import { AIWidget } from '@/components/ui/AIWidget';

function FlightControl() {
    const { velocity, manualVelocity, setManualVelocity, readingState } = useVelocityState();

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-3 sm:p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 sm:gap-6 w-[calc(100%-2rem)] max-w-[420px]">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex justify-between text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
                    <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                        <Zap size={10} className={manualVelocity !== null ? "text-primary animate-pulse" : "text-primary/50"} />
                        <span className="hidden min-[400px]:inline">Velocity Vector</span>
                        <span className="min-[400px]:hidden">VEL</span>
                    </span>
                    <span className={readingState === 'skim' ? "text-primary font-bold whitespace-nowrap" : "text-zinc-400 whitespace-nowrap"}>
                        {Math.round(velocity)} PX/S
                    </span>
                </div>

                {/* Enhanced Slider Container */}
                <div className="relative h-8 w-full flex items-center group/slider">
                    {/* Visual Track Background */}
                    <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden relative">
                        {/* Progressive Fill */}
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-primary/80"
                            animate={{
                                width: `${Math.min((velocity / VELOCITY_THRESHOLDS.NORMALIZATION_MAX) * 100, 100)}%`,
                                backgroundColor: manualVelocity !== null ? "#3b82f6" : "#ffffff" // Primary color or white
                            }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                        />
                    </div>

                    {/* Actual Input - Taller hit area */}
                    <input
                        type="range"
                        min="0"
                        max={VELOCITY_THRESHOLDS.NORMALIZATION_MAX + 500}
                        value={velocity}
                        onChange={(e) => setManualVelocity(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />

                    {/* Floating Thumb Hint */}
                    <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] pointer-events-none z-10"
                        animate={{
                            left: `${Math.min((velocity / VELOCITY_THRESHOLDS.NORMALIZATION_MAX) * 100, 100)}%`,
                            x: "-50%",
                            scale: manualVelocity !== null ? 1.2 : 0.8,
                            opacity: manualVelocity !== null ? 1 : 0
                        }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    />

                    {/* Hover indicator for thumb when manual is OFF */}
                    {manualVelocity === null && (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-white/20 rounded-full pointer-events-none opacity-0 group-hover/slider:opacity-100 transition-opacity"
                            style={{
                                left: `${Math.min((velocity / VELOCITY_THRESHOLDS.NORMALIZATION_MAX) * 100, 100)}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    )}
                </div>
            </div>

            <div className="h-10 w-[1px] bg-white/10" />

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setManualVelocity(manualVelocity === null ? velocity : null)}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${manualVelocity !== null
                        ? 'bg-primary text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                        }`}
                    title={manualVelocity !== null ? "Switch to Auto-Scroll Velocity" : "Switch to Manual Override"}
                >
                    <Settings size={18} className={manualVelocity !== null ? "animate-spin-slow" : ""} />
                </button>
                <div className="flex flex-col items-start min-w-[80px]">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">System Phase</div>
                    <div className={`text-sm font-black uppercase tracking-tighter leading-none ${readingState === 'skim' ? 'text-primary' : 'text-blue-400'}`}>
                        {readingState}
                    </div>
                </div>
            </div>
        </div>
    );
}

function IntelligentScroller({ children }: { children: React.ReactNode }) {
    const { readingState, lockVelocity } = useVelocityState();
    const containerRef = useRef<HTMLDivElement>(null);

    // Using a ref to track the "anchor" before the layout shift happens.
    // We update this continuously on scroll so that when readingState changes,
    // we already know what was visible and where it was.
    const lastAnchorRef = useRef<{ index: number, topOffset: number, viewportOffset: number } | null>(null);

    useEffect(() => {
        const updateAnchor = () => {
            if (!containerRef.current) return;

            const childrenElements = Array.from(containerRef.current.children);
            const viewportHalf = window.innerHeight * 0.4; // Target slightly above center for better "gaze" anchoring

            let closestIndex = 0;
            let minDistance = Infinity;

            childrenElements.forEach((child, i) => {
                const rect = child.getBoundingClientRect();
                // We anchor to the top of the element plus a small buffer
                const distance = Math.abs(rect.top - viewportHalf);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i;
                }
            });

            if (childrenElements[closestIndex]) {
                const rect = childrenElements[closestIndex].getBoundingClientRect();
                lastAnchorRef.current = {
                    index: closestIndex,
                    topOffset: rect.top,
                    viewportOffset: rect.top // Store relative to viewport
                };
            }
        };

        window.addEventListener('scroll', updateAnchor, { passive: true });
        updateAnchor(); // Initial capture
        return () => window.removeEventListener('scroll', updateAnchor);
    }, []);

    // Apply stabilization when readingState changes
    useLayoutEffect(() => {
        if (!lastAnchorRef.current || !containerRef.current) return;

        const anchor = lastAnchorRef.current;
        const childrenElements = Array.from(containerRef.current.children);
        const targetChild = childrenElements[anchor.index] as HTMLElement;

        if (!targetChild) return;

        // Force a synchronous layout pass for accurate measurement
        // We need to wait for the next frame or use a small delay if content is still morphing
        // but useLayoutEffect usually fires after DOM updates but before paint.

        const newRect = targetChild.getBoundingClientRect();
        const delta = newRect.top - anchor.viewportOffset;

        if (Math.abs(delta) > 0.1) {
            lockVelocity();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.scrollBy({ top: delta, behavior: 'instant' as any });
        }
    }, [readingState, lockVelocity]);

    return (
        <main
            ref={containerRef}
            className="max-w-3xl mx-auto px-6 py-24 relative z-10"
        >
            {children}
        </main>
    );
}

export default function VelocityResponsiveDesign() {
    return (
        <VelocityProvider>
            <div className="relative min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden">
                <SpeedLines />

                {/* Header Section */}
                <div className="h-screen flex flex-col items-center justify-center p-8 text-center bg-zinc-950 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="z-10 relative"
                    >

                        <h1 className="text-5xl sm:text-8xl font-black italic tracking-tighter mb-4 bg-gradient-to-b from-white to-zinc-700 bg-clip-text text-transparent uppercase text-white leading-[0.9]">
                            The<br />Relativistic<br />Reader
                        </h1>


                        <div className="mt-16 flex flex-col items-center gap-4">
                            <div className="w-[1px] h-24 bg-gradient-to-b from-primary/50 to-transparent" />
                            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest animate-pulse">Scroll to Accelerate</span>
                        </div>
                    </motion.div>
                </div>

                <IntelligentScroller>
                    {CONTENT.map((item, i) => {
                        if (item.type === 'text') {
                            return <VelocityText key={i} detailed={item.detailed!} summary={item.summary!} />;
                        }
                        if (item.type === 'image') {
                            return <VelocityImage key={i} src={item.src!} alt={item.alt!} />;
                        }
                        if (item.type === 'code') {
                            return <VelocityCodeBlock key={i} filename={item.filename!} language={item.language!} code={item.code!} />;
                        }
                        return null;
                    })}
                </IntelligentScroller>

                <FlightControl />

                <footer className="h-[200vh] flex flex-col items-center justify-center bg-zinc-950 border-t border-white/5 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-white/10 to-transparent" />
                    <p className="text-zinc-700 font-mono text-xs uppercase tracking-[0.4em] mb-4">
                        End of Content Stream
                    </p>
                    <div className="flex gap-4">
                        <Zap size={14} className="text-zinc-800" />
                        <Monitor size={14} className="text-zinc-800" />
                        <Settings size={14} className="text-zinc-800" />
                    </div>
                </footer>

                <div className="hidden md:block">
                    <AIWidget />
                </div>
            </div>
        </VelocityProvider>
    );
}